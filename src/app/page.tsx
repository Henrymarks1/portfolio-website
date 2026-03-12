"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"
import { Globe } from "@/components/globe"

const sections = [
  {
    city: "Houston",
    id: "houston",
    items: [
      {
        title: "Rice University",
        role: "BA in Computer Science",
        date: "2026",
        bullets: [
          "Algorithmic Thinking, Compiler Construction, Concurrent Systems, Probability and Statistics, Reasoning about Algorithms, Program Design",
        ],
      },
      {
        title: "Levytation Inc",
        role: "Founding Engineer",
        date: "Jun 2023 – Sept 2024",
        bullets: [
          "Developed a secure, dynamic Svelte Kit frontend integrated with Flask, delivering real-time interactive interfaces with over 30 distinct graphics, contributing to onboarding 30 paying customers.",
          "Engineered a multithreaded backend supporting GPU-accelerated models (CUDA-optimized), including LSTM-based sales forecasting and sentiment analysis, leading to acceptance into the Nvidia Inception Program.",
        ],
      },
      {
        title: "CHIL Lab",
        role: "Backend Developer",
        date: "Jan 2024 – Jun 2024",
        bullets: [
          "Developed an advanced PDF parsing tool leveraging OpenCV and Azure Document Intelligence, achieving high-precision detection and annotation of voting ballot components, improving parsing accuracy by 90%.",
        ],
      },
    ],
  },
  {
    city: "New York City",
    id: "new-york-city",
    items: [
      {
        title: "Advent International",
        role: "Software Developer Intern",
        date: "May 2023 – Aug 2023",
        image: "/images/advent_1.jpeg",
        bullets: [
          "Employed Python and Pandas for in-depth due diligence analyses on five high-value companies (> $100M valuation). Insights contributed to acquisition of Zimmerman in a $1 billion USD deal.",
          "Integrated BLS and BEA APIs via scheduled CRON jobs to collect 10M+ data points, now informing the standard due diligence process.",
        ],
      },
    ],
  },
  {
    city: "Los Angeles",
    id: "los-angeles",
    items: [
      {
        title: "Hack for LA",
        role: "Open Source Developer",
        date: "2020 – 2021",
        bullets: [
          "Contributed to civic tech projects as part of Hack for LA, a Code for America brigade building open-source tools to improve the lives of Los Angeles residents.",
        ],
      },
      {
        title: "World Health Organization",
        role: "Developer",
        date: "2020 – 2021",
        bullets: [
          "Contributed to open-source software projects supporting global public health initiatives during the COVID-19 pandemic.",
        ],
      },
      {
        title: "Santa Monica College",
        role: "Certificate in Cloud Computing — 4.0 GPA",
        date: "2021",
        bullets: [
          "JavaScript Programming, Cloud Computing, Security in AWS, Python Programming, Database Essentials in AWS, Compute Engines in AWS, C Programming",
        ],
      },
    ],
  },
  {
    city: "London",
    id: "london",
    items: [
      {
        title: "Queen Mary University of London",
        role: "Study Abroad",
        date: "2024",
        bullets: [
          "Studied abroad at Queen Mary University of London, one of the UK's leading research universities and a member of the Russell Group.",
        ],
      },
    ],
  },
]

function FadeInSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.3"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [80, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div ref={ref} id={id} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  )
}

function PeripherySection() {
  return (
    <FadeInSection id="san-francisco" className="relative mx-auto max-w-4xl px-6 py-24">
      <h2 className="mb-12 text-sm font-semibold uppercase tracking-[0.2em] text-[#112D4E]">
        San Francisco
      </h2>

      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
          <div>
            <h3 className="text-2xl font-bold text-[#112D4E]">Periphery</h3>
            <p className="text-sm text-[#3F72AF]">CEO &amp; Co-Founder</p>
          </div>
          <p className="text-sm text-[#3F72AF] whitespace-nowrap">
            Dec 2025 – Present
          </p>
        </div>

        <p className="text-base leading-relaxed text-[#112D4E]/80">
          AI analyst for commercial real estate. Periphery connects to SharePoint, Google Drive,
          Dropbox, databases, and spreadsheets — letting teams search thousands of documents,
          extract data, and generate reports in seconds instead of weeks.
        </p>

        <div className="overflow-hidden rounded-xl">
          <Image
            src="/images/periphery_1.jpeg"
            alt="Periphery team at work"
            width={900}
            height={500}
            className="w-full object-cover"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-[#DBE2EF]/40 p-5">
            <h4 className="text-sm font-semibold text-[#112D4E]">Infrastructure</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#112D4E]/70">
              Built a virtual filesystem using a Go FUSE daemon in Cloudflare Containers, unifying
              R2 object storage, PostgreSQL, and Google Drive into a single mount point for
              sandboxed AI agents with real-time file-change propagation via WebSockets.
            </p>
          </div>
          <div className="rounded-lg bg-[#DBE2EF]/40 p-5">
            <h4 className="text-sm font-semibold text-[#112D4E]">AI Runtime</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#112D4E]/70">
              Engineered a stateful AI agent runtime on Cloudflare Durable Objects with resumable
              SSE streaming, automatic context window compaction, human-in-the-loop tool execution,
              and multi-provider LLM failover routing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Go", "Cloudflare Workers", "Durable Objects", "R2", "PostgreSQL", "WebSockets", "FUSE", "TypeScript"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#3F72AF]/10 px-3 py-1 text-xs font-medium text-[#3F72AF]"
              >
                {tag}
              </span>
            )
          )}
        </div>

        <a
          href="https://periphery.so"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3F72AF] transition-colors hover:text-[#112D4E]"
        >
          periphery.so
          <span aria-hidden="true">&rarr;</span>
        </a>

        <hr className="my-8 border-[#DBE2EF]" />

        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
          <div>
            <h3 className="text-2xl font-bold text-[#112D4E]">Durate (YC F24)</h3>
            <p className="text-sm text-[#3F72AF]">Founding Engineer</p>
          </div>
          <p className="text-sm text-[#3F72AF] whitespace-nowrap">
            Jan 2025 – Jun 2025
          </p>
        </div>
        <ul className="mt-3 space-y-2">
          <li className="text-sm leading-relaxed text-[#112D4E]/80">
            Built core product features across a React frontend and Apollo GraphQL backend, including an AI scheduling agent using the Vercel AI SDK.
          </li>
          <li className="text-sm leading-relaxed text-[#112D4E]/80">
            Worked directly with founders on customer interviews and demos, then led a major codebase overhaul post-YC to improve maintainability and support rapid iteration.
          </li>
        </ul>
      </div>
    </FadeInSection>
  )
}

function Section({
  city,
  items,
  id,
}: {
  city: string
  items: (typeof sections)[number]["items"]
  id: string
}) {
  return (
    <FadeInSection id={id} className="relative mx-auto max-w-4xl px-6 py-24">
      <h2 className="mb-10 text-sm font-semibold uppercase tracking-[0.2em] text-[#112D4E]">
        {city}
      </h2>
      <div className="space-y-12">
        {items.map((item) => (
          <div key={item.title}>
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
              <div>
                <h3 className="text-xl font-semibold text-[#112D4E]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#3F72AF]">{item.role}</p>
              </div>
              <p className="text-sm text-[#3F72AF] whitespace-nowrap">
                {item.date}
              </p>
            </div>
            {"image" in item && item.image && (
              <div className="mt-4 overflow-hidden rounded-xl max-w-xs">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={500}
                  className="w-full object-cover"
                />
              </div>
            )}
            <ul className="mt-3 space-y-2">
              {item.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-[#112D4E]/80"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FadeInSection>
  )
}

export default function Home() {
  return (
    <div className="bg-[#F9F7F7]">
      {/* Hero with globe */}
      <div className="relative flex h-screen items-center justify-center overflow-hidden">
        <Globe />
      </div>

      {/* Experience sections */}
      <div className="relative z-10">
        <PeripherySection />
        {sections.map((section) => (
          <Section
            key={section.city}
            city={section.city}
            items={section.items}
            id={section.id}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="py-16 text-center text-sm text-[#3F72AF]">
        <div className="space-x-4">
          <a href="mailto:henryesmarks@gmail.com" className="hover:text-[#112D4E] transition-colors">
            henryesmarks@gmail.com
          </a>
          <span>·</span>
          <a href="https://linkedin.com/in/henryesmarks" className="hover:text-[#112D4E] transition-colors">
            LinkedIn
          </a>
          <span>·</span>
          <a href="https://github.com/Henrymarks1" className="hover:text-[#112D4E] transition-colors">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
