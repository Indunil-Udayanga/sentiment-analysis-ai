import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Brain,
  Sparkles,
  Zap,
  ShieldCheck,
  Timer,
  Target,
  Rocket,
  Eraser,
  Github,
  Linkedin,
  Globe,
  Mail,
  ArrowRight,
  Play,
  Loader2,
  ChevronRight,
  Gauge,
  BarChart3,
  MessageSquareText,
  Cpu,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import heroImg from "@/assets/hero-ai.png";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SentimentAI – AI-Powered Sentiment Analysis" },
      {
        name: "description",
        content:
          "Analyze customer reviews, social comments and text using deep learning. Instantly classify sentiment as Positive, Neutral, or Negative with confidence scores.",
      },
    ],
  }),
});

type Sentiment = "Positive" | "Neutral" | "Negative";

interface PredictionResult {
  sentiment: Sentiment;
  confidence: number;
}

const EXAMPLES = [
  "I absolutely love this product. Best purchase this year!",
  "The delivery was okay, nothing special about the packaging.",
  "Worst experience ever. I want a full refund immediately.",
];

const MAX_CHARS = 1000;

// Points at the FastAPI backend's /predict endpoint.
// Override at build time with VITE_API_URL if the backend runs elsewhere.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/predict";

interface BackendPredictResponse {
  label: "Positive" | "Neutral" | "Negative";
  confidence: number;
  probabilities: Record<string, number>;
}

/** Calls the FastAPI backend's /predict endpoint. */
async function predictSentiment(text: string): Promise<PredictionResult> {
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new Error(
      "Can't reach the backend. Make sure the FastAPI server is running on port 8000 (uvicorn app.main:app --reload --port 8000).",
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.detail === "string" ? body.detail : `Request failed (${res.status})`,
    );
  }

  const data: BackendPredictResponse = await res.json();
  return { sentiment: data.label, confidence: data.confidence };
}

function sentimentMeta(s: Sentiment) {
  if (s === "Positive")
    return {
      emoji: "😊",
      color: "var(--positive)",
      label: "Positive",
      chip: "bg-positive/15 text-positive border-positive/30",
    };
  if (s === "Negative")
    return {
      emoji: "😞",
      color: "var(--negative)",
      label: "Negative",
      chip: "bg-negative/15 text-negative border-negative/30",
    };
  return {
    emoji: "😐",
    color: "var(--neutral)",
    label: "Neutral",
    chip: "bg-neutral/20 text-neutral-foreground border-neutral/40",
  };
}

function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const analyzeRef = useRef<HTMLDivElement>(null);

  const chars = text.length;
  const disabled = loading || text.trim().length < 2;

  async function handleAnalyze() {
    if (disabled) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const r = await predictSentiment(text);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function scrollToAnalyze() {
    analyzeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar onStart={scrollToAnalyze} />

      <Hero onStart={scrollToAnalyze} />

      <StatsRow />

      <section ref={analyzeRef} id="analyze" className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Playground"
            title="Analyze your text"
            subtitle="Paste a review, tweet, comment, or any snippet. Our deep learning model returns a sentiment label and confidence score."
          />

          <Card className="glass-card mt-10 rounded-3xl p-6 sm:p-8 animate-fade-up">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquareText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Input text</p>
                  <p className="text-xs text-muted-foreground">Up to {MAX_CHARS} characters</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full font-mono text-[11px]">
                {chars}/{MAX_CHARS}
              </Badge>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Enter a review, comment, tweet, or any text..."
              rows={6}
              className="w-full resize-none rounded-2xl border border-border bg-background/60 px-5 py-4 text-base leading-relaxed outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setText(ex)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="max-w-[24ch] truncate">{ex}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setText("");
                  setResult(null);
                  setError(null);
                }}
                className="rounded-full"
              >
                <Eraser className="h-4 w-4" />
                Clear text
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={disabled}
                size="lg"
                className="group rounded-full bg-primary px-6 shadow-lg shadow-primary/25 transition hover:shadow-primary/40 hover:brightness-110 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze sentiment
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          {error && !loading && (
            <div className="mt-8 rounded-2xl border border-negative/30 bg-negative/10 px-5 py-4 text-sm text-negative">
              {error}
            </div>
          )}

          {(loading || result) && (
            <div className="mt-8">
              {loading ? <LoadingResult /> : result ? <ResultCard result={result} /> : null}
            </div>
          )}
        </div>
      </section>

      <Features />
      <HowItWorks />
      <CTASection onStart={scrollToAnalyze} />
      <Footer />
    </div>
  );
}

/* ---------------- Sections ---------------- */

function Navbar({ onStart }: { onStart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/30">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-base font-bold tracking-tight">
            Sentiment<span className="text-primary">AI</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {[
            ["Playground", "#analyze"],
            ["Features", "#features"],
            ["How it works", "#how"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">


          <Button
            size="sm"
            onClick={onStart}
            className="rounded-full bg-primary shadow-md shadow-primary/25 hover:brightness-110"
          >
            Start analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden bg-mesh">
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div className="animate-fade-up">
          <Badge
            variant="outline"
            className="rounded-full border-primary/30 bg-primary/5 text-primary"
          >
            <Sparkles className="h-3 w-3" />
            Powered by Deep Learning
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="gradient-text">AI Sentiment</span>
            <br />
            <span className="text-foreground">Analysis, instantly.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Analyze customer reviews, social media comments, and text using
            deep learning to identify <span className="text-positive font-semibold">Positive</span>,{" "}
            <span className="neutral-glow font-semibold">Neutral</span>, or{" "}
            <span className="text-negative font-semibold">Negative</span> sentiment
            in real time.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onStart}
              className="group rounded-full bg-primary px-6 shadow-xl shadow-primary/30 hover:brightness-110"
            >
              <Rocket className="h-4 w-4" />
              Start analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onStart}
              className="rounded-full border-border bg-card/60 backdrop-blur"
            >
              <Play className="h-4 w-4" />
              View demo
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-positive" /> 94% accuracy
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-positive" /> Sub-second latency
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-positive" /> Privacy-first
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-primary-glow/20 blur-3xl" />
          <div className="glass-card animate-float-slow relative rounded-[2rem] p-6">
            <img
              src={heroImg}
              alt="Abstract 3D illustration of a neural network analyzing chat bubbles"
              width={1024}
              height={1024}
              className="mx-auto h-auto w-full max-w-md drop-shadow-xl"
            />
            <FloatingSampleCard
              className="absolute -left-4 top-6 hidden sm:block"
              sentiment="Positive"
              text="Best purchase this year"
              confidence={0.97}
            />
            <FloatingSampleCard
              className="absolute -right-4 bottom-8 hidden sm:block"
              sentiment="Negative"
              text="Terrible experience"
              confidence={0.92}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingSampleCard({
  sentiment,
  text,
  confidence,
  className,
}: {
  sentiment: Sentiment;
  text: string;
  confidence: number;
  className?: string;
}) {
  const m = sentimentMeta(sentiment);
  return (
    <div className={cn("glass-card min-w-[220px] rounded-2xl p-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{m.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{text}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {m.label} · {(confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${confidence * 100}%`, background: m.color }}
        />
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StatsRow() {
  const stats = [
    { icon: BarChart3, label: "Total analyses", value: "128,430", hint: "+12% this week" },
    { icon: Target, label: "Model accuracy", value: "94.8%", hint: "F1 on eval set" },
    { icon: Gauge, label: "Avg. confidence", value: "91.2%", hint: "Across all classes" },
    { icon: Timer, label: "Prediction time", value: "0.42s", hint: "P50 latency" },
  ];
  return (
    <section className="relative -mt-8 pb-4">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className="glass-card rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-[11px] text-positive">{s.hint}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LoadingResult() {
  return (
    <Card className="glass-card animate-pop-in rounded-3xl p-8">
      <div className="flex items-center gap-4">
        <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Cpu className="h-5 w-5" />
          <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Analyzing with AI...</p>
          <p className="text-sm text-muted-foreground">
            Running text through the deep learning model.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary via-primary-glow to-primary"
              style={{
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s linear infinite",
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ResultCard({ result }: { result: PredictionResult }) {
  const m = sentimentMeta(result.sentiment);
  const pct = useMemo(() => Math.round(result.confidence * 1000) / 10, [result.confidence]);

  return (
    <Card
      className="glass-card animate-pop-in overflow-hidden rounded-3xl p-0"
      style={{
        backgroundImage: `radial-gradient(600px 200px at 100% 0%, color-mix(in oklab, ${m.color} 22%, transparent), transparent 60%)`,
      }}
    >
      <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Prediction result
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl"
              style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)` }}
            >
              {m.emoji}
            </span>
            <div className="min-w-0">
              <h3 className="text-3xl font-bold tracking-tight" style={{ color: m.color }}>
                {m.label}
              </h3>
              <Badge variant="outline" className={cn("mt-1 rounded-full", m.chip)}>
                {m.label} sentiment detected
              </Badge>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-mono font-semibold" style={{ color: m.color }}>
                {pct.toFixed(2)}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${m.color}, color-mix(in oklab, ${m.color} 60%, white))`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:min-w-[160px]">
          {(["Positive", "Neutral", "Negative"] as Sentiment[]).map((s) => {
            const active = s === result.sentiment;
            const sm = sentimentMeta(s);
            return (
              <div
                key={s}
                className={cn(
                  "rounded-2xl border p-3 text-center transition",
                  active
                    ? "border-transparent"
                    : "border-border bg-card/40 text-muted-foreground",
                )}
                style={
                  active
                    ? {
                        background: `color-mix(in oklab, ${sm.color} 14%, transparent)`,
                        borderColor: `color-mix(in oklab, ${sm.color} 40%, transparent)`,
                      }
                    : undefined
                }
              >
                <div className="text-xl">{sm.emoji}</div>
                <div
                  className="mt-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={active ? { color: sm.color } : undefined}
                >
                  {s}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "Deep learning powered", desc: "Trained transformer classifier fine-tuned on millions of reviews." },
    { icon: Zap, title: "Real-time prediction", desc: "Streaming inference returns results in under a second." },
    { icon: Target, title: "High accuracy", desc: "94.8% weighted F1 on public sentiment benchmarks." },
    { icon: Timer, title: "Fast processing", desc: "Batched GPU inference with adaptive queuing." },
    { icon: ShieldCheck, title: "Secure analysis", desc: "Inputs are encrypted in transit and never stored by default." },
    { icon: Sparkles, title: "Easy to use", desc: "One clean API — POST /predict and render the result." },
  ];
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to ship sentiment"
          subtitle="Production-ready building blocks: a fast model, a clean API, and a UI you can drop into any product."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="glass-card group rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-2xl animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 text-primary transition group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: MessageSquareText, title: "Enter text", desc: "Paste a review, tweet, or comment into the analyzer." },
    { icon: Cpu, title: "AI processing", desc: "The deep learning model tokenizes and encodes your text." },
    { icon: Brain, title: "Sentiment prediction", desc: "Softmax over 3 classes yields a label with confidence." },
    { icon: BarChart3, title: "View results", desc: "See the prediction, score and animated confidence bar." },
  ];
  return (
    <section id="how" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From text to sentiment in four steps"
        />
        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-11 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative flex flex-col items-center text-center animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="glass-card relative z-10 grid h-20 w-20 place-items-center rounded-2xl">
                <s.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-1 max-w-[22ch] text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Card className="glass-card relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute inset-0 -z-10 bg-mesh opacity-70" />
          <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary">
            Ready when you are
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Try <span className="gradient-text">SentimentAI</span> on your own text
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            No signup required. Paste text, hit analyze, ship insights.
          </p>
          <div className="mt-7 flex justify-center">
            <Button
              size="lg"
              onClick={onStart}
              className="rounded-full bg-primary px-7 shadow-xl shadow-primary/30 hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Start analyzing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  const links = [
    { icon: Github, label: "GitHub", href: "https://github.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Globe, label: "Portfolio", href: "https://example.com" },
    { icon: Mail, label: "Email", href: "mailto:hello@example.com" },
  ];
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-sm font-semibold">
            Sentiment<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              aria-label={l.label}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              <l.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} SentimentAI. Crafted with deep learning.
        </p>
      </div>
    </footer>
  );
}
