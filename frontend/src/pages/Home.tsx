import { Link } from "react-router-dom";
import { ArrowRight, Feather, Footprints, RotateCcw, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: RotateCcw,
    title: "Start from where you are",
    body: "No backlog, no missed-days counter. Pick a goal and see one suggested session — nothing more.",
  },
  {
    icon: Footprints,
    title: "Do one short session",
    body: "Each exercise is a few lines of Python with a hint nearby. Most take under five minutes.",
  },
  {
    icon: Feather,
    title: "Make it easier, any time",
    body: "If a task feels like too much, swap it for a smaller version. It still counts.",
  },
];

export default function Home() {
  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 cc-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-coral-line bg-coral-soft px-3 py-1 text-sm font-medium text-coral-ink">
              A learning companion for restarting
            </p>
            <h1 data-testid="landing-headline" className="text-4xl font-semibold leading-[1.12] tracking-tight text-navy sm:text-5xl lg:text-[54px]">
              You don't have to catch up.
              <br />
              <span className="text-coral">You just have to start again.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-muted">
              Comeback Coach helps you return to learning Python after a break. It doesn't count what you missed.
              It suggests one short session, offers a hint when you need it and makes the task smaller when that helps.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/dashboard"
                data-testid="start-learning-again-button"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-2 rounded-xl bg-coral px-6 text-base text-white hover:bg-coral-hover active:scale-[0.98] transition-[background-color,transform] duration-150",
                )}
              >
                Start Learning Again <ArrowRight className="size-4" />
              </Link>
              <a href="#how-it-works" data-testid="how-it-works-link" className="px-2 text-sm font-medium text-navy-muted underline-offset-4 hover:text-navy hover:underline">
                How it works
              </a>
            </div>
          </div>

          {/* Static preview of a session */}
          <div className="lg:col-span-5" aria-hidden>
            <div className="relative">
              <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-3xl border border-sand-line bg-sand sm:block" />
              <div className="relative rounded-3xl border border-sand-line bg-white p-6 shadow-[0_12px_40px_rgba(27,42,74,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-navy-muted">Today · 4 min</span>
                  <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-navy-muted">Sample content</span>
                </div>
                <p className="mt-3 font-heading text-xl font-semibold text-navy">Small list, real count</p>
                <div className="mt-4 rounded-xl bg-editor p-4 font-mono text-[13px] leading-6 text-slate-100">
                  <div><span className="text-slate-500"># count your topics</span></div>
                  <div>topics = [<span className="text-emerald-300">"loops"</span>, <span className="text-emerald-300">"lists"</span>]</div>
                  <div><span className="text-pink-300">print</span>(len(topics))</div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-coral-line bg-coral-soft px-3 py-2.5 text-sm text-coral-ink">
                  <Feather className="size-4 shrink-0" />
                  Simplified: the list is written, just count it.
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-sage">
                  <Check className="size-4" /> Check passed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-sand-line bg-sand/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">How it works</h2>
            <p className="mt-3 text-navy-muted">Three things, deliberately few.</p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} data-testid={`how-step-${i + 1}`} className="rounded-2xl border border-sand-line bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-[#D5C9BC] hover:shadow-[0_4px_16px_rgba(27,42,74,0.06)]">
                <div className="flex items-center justify-between">
                  <s.icon className="size-5 text-coral" />
                  <span className="font-mono text-xs text-navy-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-medium text-navy">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-navy p-8 text-white sm:flex-row sm:items-center">
            <p className="font-heading text-xl font-medium">Ready when you are. One session is enough for today.</p>
            <Link
              to="/dashboard"
              data-testid="start-learning-again-bottom-button"
              className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl bg-coral px-5 text-white hover:bg-coral-hover")}
            >
              Start Learning Again
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
