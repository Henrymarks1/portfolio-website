"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"

const MOVEMENT_DAMPING = 1400

export interface GlobeMarker {
  location: [number, number]
  size: number
  city: string
  label: string
  sectionId: string
}

const GLOBE_CONFIG: COBEOptions = {
  width: 600,
  height: 600,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: -0.7,
  theta: 0.15,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 40000,
  mapBrightness: 1.2,
  baseColor: [0xDB / 255, 0xE2 / 255, 0xEF / 255],
  markerColor: [0x3F / 255, 0x72 / 255, 0xAF / 255],
  glowColor: [0xF9 / 255, 0xF7 / 255, 0xF7 / 255],
  markers: [],
}

export const MARKERS: GlobeMarker[] = [
  { location: [37.7749, -122.4194], size: 0.1, city: "San Francisco", label: "Periphery, Durate", sectionId: "san-francisco" },
  { location: [29.7604, -95.3698], size: 0.1, city: "Houston", label: "Rice, Levytation, CHIL", sectionId: "houston" },
  { location: [40.7128, -74.006], size: 0.1, city: "New York", label: "Advent International", sectionId: "new-york-city" },
  { location: [34.0522, -118.2437], size: 0.1, city: "Los Angeles", label: "Santa Monica College", sectionId: "los-angeles" },
  { location: [51.5074, -0.1278], size: 0.1, city: "London", label: "Queen Mary University", sectionId: "london" },
]

// Projects lat/lng to screen coordinates matching cobe's internal shader projection.
// cobe's shader uses: rotation matrix J(theta, phi) applied as l * J(theta, phi),
// sphere radius 0.8 in NDC, and the view maps NDC [-1,1] to canvas [0, width].
function projectToScreen(
  lat: number,
  lng: number,
  globePhi: number,
  globeTheta: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; visible: boolean } {
  // Exact cobe source: c=lat*PI/180, a=lng*PI/180-PI, point=[-cos(c)*cos(a), sin(c), cos(c)*sin(a)]
  // Then cobe swizzles to [x,z,y] for its Fibonacci sphere lookup, but the shader rotation
  // operates on the UN-swizzled [x,y,z] space since l is constructed as vec3(screenX, screenY, depth)
  // and the shader does m = l * J, then K(m) re-swizzles with c=c.xzy.
  // So for projection we use the raw cobe point WITHOUT swizzle:
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180 - Math.PI
  const px = -Math.cos(latRad) * Math.cos(lngRad)  // x
  const py = Math.sin(latRad)                        // y (up)
  const pz = Math.cos(latRad) * Math.sin(lngRad)    // z (into screen)

  // Shader rotation J(theta, phi): mat3 column-major
  // col0 = (cd, ed*st, -ed*ct)
  // col1 = (0, ct, st)
  // col2 = (ed, -cd*st, cd*ct)
  // where ct=cos(theta), st=sin(theta), cd=cos(phi), ed=sin(phi)
  // Shader: m = l * J => m[i] = dot(l, col[i])
  // Inverse: l = m * J^T => l[i] = dot(m, row[i] of J)
  // J rows (from columns transposed):
  // row0 = (cd, 0, ed)
  // row1 = (ed*st, ct, -cd*st)
  // row2 = (-ed*ct, st, cd*ct)
  // We want: given world point p (= m in shader terms), find view point l
  // l = p * J^T
  const ct = Math.cos(globeTheta)
  const st = Math.sin(globeTheta)
  const cd = Math.cos(globePhi)
  const ed = Math.sin(globePhi)

  const vx = px * cd + py * 0 + pz * ed
  const vy = px * ed * st + py * ct + pz * (-cd * st)
  const vz = px * (-ed * ct) + py * st + pz * cd * ct

  // vz > 0 means facing camera (shader l.z = sqrt(0.64 - screenDist^2) is always positive)
  const visible = vz > 0

  // Sphere visual radius in NDC = sqrt(0.64) = 0.8
  const sphereRadius = 0.8
  const screenX = canvasWidth / 2 + (vx * sphereRadius * canvasWidth) / 2
  const screenY = canvasHeight / 2 - (vy * sphereRadius * canvasHeight) / 2

  return { x: screenX, y: screenY, visible }
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
  markers = MARKERS,
}: {
  className?: string
  config?: COBEOptions
  markers?: GlobeMarker[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(config.phi ?? 0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const currentPhiRef = useRef(config.phi ?? 0)

  const [markerPositions, setMarkerPositions] = useState<
    { x: number; y: number; visible: boolean; marker: GlobeMarker }[]
  >([])
  const [activeMarker, setActiveMarker] = useState<string | null>(null)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  const updateMarkerPositions = useCallback(() => {
    if (!canvasRef.current) return
    const size = canvasRef.current.offsetWidth
    const phi = currentPhiRef.current
    const theta = config.theta ?? 0.15

    const positions = markers.map((marker) => {
      const pos = projectToScreen(
        marker.location[0],
        marker.location[1],
        phi,
        theta,
        size,
        size,
      )
      return { ...pos, marker }
    })
    setMarkerPositions(positions)
  }, [markers, config.theta])

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
      updateMarkerPositions()
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      markers: [],
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phiRef.current += 0.001
        const currentPhi = phiRef.current + rs.get()
        currentPhiRef.current = currentPhi
        state.phi = currentPhi
        state.width = widthRef.current * 2
        state.height = widthRef.current * 2
        updateMarkerPositions()
      },
    })

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1"
    }, 0)
    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, config, markers, updateMarkerPositions])

  const handleMarkerClick = (sectionId: string) => {
    setActiveMarker(activeMarker === sectionId ? null : sectionId)
  }

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: "smooth" })
    setActiveMarker(null)
  }

  return (
    <div
      className={`absolute inset-0 mx-auto aspect-square w-full ${className ?? ""}`}
    >
      <div ref={containerRef} className="relative size-full">
      <canvas
        className="size-full opacity-0 transition-opacity duration-500"
        style={{ contain: "layout paint size" }}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />

      {markerPositions.map(({ x, y, visible, marker }) =>
        visible ? (
          <div
            key={marker.sectionId}
            className="absolute z-20"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <button
              onClick={() => handleMarkerClick(marker.sectionId)}
              className="group relative flex items-center justify-center"
            >
              <span className="absolute size-6 animate-ping rounded-full bg-[#3F72AF]/20" />
              <span className="relative size-3 rounded-full bg-[#3F72AF] shadow-lg ring-2 ring-white transition-transform group-hover:scale-150" />
            </button>

            {activeMarker === marker.sectionId && (
              <div
                className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2"
                style={{ whiteSpace: "nowrap" }}
              >
                <div className="rounded-lg bg-white px-4 py-3 shadow-xl ring-1 ring-black/5">
                  <p className="text-sm font-semibold text-[#112D4E]">
                    {marker.city}
                  </p>
                  <p className="mt-0.5 text-xs text-[#3F72AF]">
                    {marker.label}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToSection(marker.sectionId)
                    }}
                    className="mt-2 text-xs font-medium text-[#3F72AF] transition-colors hover:text-[#112D4E]"
                  >
                    View details &rarr;
                  </button>
                </div>
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
              </div>
            )}
          </div>
        ) : null,
      )}
      </div>
    </div>
  )
}
