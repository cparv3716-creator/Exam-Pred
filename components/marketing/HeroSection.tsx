"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { SoftPill } from "@/components/ui/Badge";
import { ExamIntelligencePreview } from "@/components/dashboard/ExamIntelligencePreview";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center">
          <SoftPill>
            <Sparkles size={14} /> AI exam intelligence &amp; practice
          </SoftPill>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl"
        >
          Know What Matters
          <br />
          <span className="gradient-text">Before the Exam Does.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          ExamIQ is an AI-powered exam intelligence and practice platform. It pairs pattern-based
          topic prediction with a source-grounded practice bank — starting with CAT Quant and VARC,
          with JEE, NEET and UPSC on the way.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/exams/cat"
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-cyan transition-all hover:opacity-90 sm:w-auto"
          >
            <BrainCircuit size={16} /> Explore CAT intelligence
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/exams/cat/quant/latex-source"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 sm:w-auto"
          >
            Start practicing
          </Link>
        </motion.div>
        <p className="mt-5 text-xs text-slate-600">
          Independent pattern-analysis platform. Not an official, leaked, exact, or guaranteed question source.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.28 }}
        className="mx-auto mt-16 max-w-5xl"
      >
        <ExamIntelligencePreview />
      </motion.div>
    </section>
  );
}
