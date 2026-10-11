import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Feather, CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { qk, VARIANT_LABEL } from "@/lib/coach";
import type { Completion } from "@/lib/coach";
import { cn } from "@/lib/utils";

export default function History() {
  const { data, isError, isPending } = useQuery({
    queryKey: qk.completions,
    queryFn: () => apiGet<Completion[]>("/completions"),
  });
  const items = isError ? [] : (data ?? []);
  const simplified = items.filter((c) => c.variant === "easier").length;
  const concepts = new Set(items.map((c) => c.concept)).size;

  const stats = [
    { label: "Sessions completed", value: items.length, testid: "stat-total-sessions" },
    { label: "Concepts practised", value: concepts, testid: "stat-concepts" },
    { label: "Done in simplified form", value: simplified, testid: "stat-simplified" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <p className="text-sm font-medium text-coral-ink">History</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">Completed sessions</h1>
        <p className="mt-3 max-w-xl text-navy-muted">A record of what you've done — not of what you missed.</p>

        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-sand-line bg-white p-5">
              <dt className="text-sm text-navy-muted">{s.label}</dt>
              <dd data-testid={s.testid} className="mt-1 font-heading text-3xl font-semibold text-navy">
                {isPending ? "–" : s.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-10" data-testid="history-list-section">
          {isPending ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-sand" />)}</div>
          ) : items.length === 0 ? (
            <div data-testid="history-empty" className="rounded-2xl border border-dashed border-sand-line bg-white p-10 text-center">
              <p className="font-heading text-lg font-medium text-navy">
                {isError ? "History isn't available right now." : "No sessions yet."}
              </p>
              <p className="mt-2 text-sm text-navy-muted">Your first completed session will show up here.</p>
              <Link to="/session" data-testid="history-start-session-button" className={cn(buttonVariants(), "mt-5 rounded-xl")}>
                Start a session
              </Link>
            </div>
          ) : (
            <ol className="relative space-y-3 border-l border-sand-line pl-6">
              {items.map((c) => (
                <li key={c.id} data-testid={`history-item-${c.id}`} className="relative rounded-2xl border border-sand-line bg-white p-5 transition-[border-color] duration-200 hover:border-[#D5C9BC]">
                  <span className="absolute -left-[31px] top-6 grid size-3.5 place-items-center rounded-full border-2 border-background bg-navy" aria-hidden />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-navy">{c.exercise_title}</p>
                      <p className="text-sm text-navy-muted">{c.concept}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        data-testid="history-item-variant"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          c.variant === "easier" ? "bg-coral-soft text-coral-ink" : "bg-sage-soft text-sage-ink",
                        )}
                      >
                        {c.variant === "easier" ? <Feather className="size-3" /> : <CheckCircle2 className="size-3" />}
                        {VARIANT_LABEL[c.variant]}
                      </span>
                      <time className="text-sm text-navy-muted" dateTime={c.completed_at}>
                        {format(new Date(c.completed_at), "EEE, MMM d · HH:mm")}
                      </time>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AppShell>
  );
}
