import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Clock, Feather } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { ProgressBar, SourceBadge, StepDots } from "@/components/coach-ui";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPut } from "@/lib/api";
import { qk, returnMessage, VARIANT_LABEL } from "@/lib/coach";
import type { Dashboard as DashboardData, GoalSelect, Learner } from "@/lib/coach";
import { cn } from "@/lib/utils";

const card = "rounded-2xl border border-sand-line bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(27,42,74,0.04)]";

export default function Dashboard() {
  const qc = useQueryClient();
  const { data, isError, isPending } = useQuery({
    queryKey: qk.dashboard,
    queryFn: () => apiGet<DashboardData>("/dashboard"),
  });

  const selectGoal = useMutation({
    mutationFn: (body: GoalSelect) => apiPut<Learner>("/learner/goal", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dashboard });
      toast("Goal updated. Your next session has changed to match.");
    },
    onError: () => toast.error("Couldn't switch goal. Please try again."),
  });

  const d = isError ? undefined : data;
  const goalTitles = Object.fromEntries((d?.goals ?? []).map((g) => [g.id, g.title]));
  const next = d?.next_exercise;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-medium text-coral-ink">Dashboard</p>
          <h1 data-testid="dashboard-greeting" className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Welcome back{d ? `, ${d.learner.name}` : ""}.
          </h1>
          <p data-testid="dashboard-return-message" className="mt-3 text-navy-muted">
            {d ? returnMessage(d.days_since_last) : isError ? "Your progress isn't available right now." : "Loading your progress…"}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Suggested next session */}
          <section data-testid="next-session-card" className="relative overflow-hidden rounded-2xl bg-navy p-7 text-white sm:p-9 lg:col-span-8">
            <div className="absolute right-0 top-0 h-full w-1.5 bg-coral" aria-hidden />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-300">
                {d?.next_is_review ? "Suggested review" : "Suggested next session"}
              </span>
              {next && <SourceBadge source={next.source} className="border-white/15 bg-white/10 text-slate-200" />}
            </div>
            {next ? (
              <>
                <h2 data-testid="next-session-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{next.title}</h2>
                <p className="mt-2 text-slate-300">
                  {next.concept}
                  {d?.next_is_review && " · You've finished this goal — a quick review keeps it fresh."}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Link
                    to={`/session/${next.id}`}
                    data-testid="start-next-session-button"
                    className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 rounded-xl bg-coral px-5 text-white hover:bg-coral-hover active:scale-[0.98] transition-[background-color,transform] duration-150")}
                  >
                    Start session <ArrowRight className="size-4" />
                  </Link>
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                    <Clock className="size-4" /> About {next.estimated_minutes} min · can be made easier
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3" data-testid="next-session-placeholder">
                <div className="h-8 w-2/3 rounded-lg bg-white/10" />
                <div className="h-4 w-1/3 rounded bg-white/10" />
              </div>
            )}
          </section>

          {/* Goal + progress */}
          <section className={cn(card, "lg:col-span-4")} data-testid="goal-card">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-navy-muted">Learning goal</p>
            <div className="mt-3">
              <Select
                value={d?.learner.active_goal_id ?? ""}
                onValueChange={(v: string) => v && selectGoal.mutate({ goal_id: v })}
                disabled={!d || selectGoal.isPending}
              >
                <SelectTrigger data-testid="goal-switcher-select" className="h-11 w-full rounded-xl bg-white text-base font-medium text-navy">
                  <SelectValue>{(v) => goalTitles[v as string] ?? "Choose a goal"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(d?.goals ?? []).map((g) => (
                    <SelectItem key={g.id} value={g.id} data-testid={`goal-option-${g.id}`}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p data-testid="goal-description" className="mt-3 text-sm leading-relaxed text-navy-muted">
              {d?.active.goal.description ?? "\u00a0"}
            </p>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-navy">Progress</span>
                <span data-testid="goal-progress-text" className="text-sm text-navy-muted">
                  {d ? `${d.active.completed} of ${d.active.total} sessions` : "—"}
                </span>
              </div>
              <ProgressBar value={d?.active.completed ?? 0} max={d?.active.total ?? 1} testid="goal-progress-bar" />
              {d && <div className="mt-3"><StepDots total={d.active.total} done={d.active.completed} /></div>}
            </div>
          </section>

          {/* Recent progress */}
          <section className={cn(card, "lg:col-span-8")} data-testid="recent-progress-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-navy">Recent progress</h2>
              <Link to="/history" data-testid="view-history-link" className="text-sm font-medium text-coral-ink underline-offset-4 hover:underline">
                View all
              </Link>
            </div>
            {isPending ? (
              <div className="mt-5 space-y-3">{[0, 1].map((i) => <div key={i} className="h-12 rounded-xl bg-sand" />)}</div>
            ) : !d || d.recent.length === 0 ? (
              <p data-testid="recent-empty" className="mt-5 text-sm text-navy-muted">
                Nothing here yet. Your first finished session will appear here.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-sand-line">
                {d.recent.map((c) => (
                  <li key={c.id} data-testid={`recent-item-${c.id}`} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy">{c.exercise_title}</p>
                      <p className="text-sm text-navy-muted">{c.concept}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {c.variant === "easier" && (
                        <span className="hidden items-center gap-1 rounded-full bg-coral-soft px-2 py-0.5 text-xs text-coral-ink sm:inline-flex">
                          <Feather className="size-3" /> {VARIANT_LABEL.easier}
                        </span>
                      )}
                      <span className="text-sm text-navy-muted">{format(new Date(c.completed_at), "MMM d")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Principles */}
          <aside className="rounded-2xl border border-sand-line bg-sand p-6 sm:p-7 lg:col-span-4" data-testid="principles-card">
            <h2 className="text-lg font-medium text-navy">How this works</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-navy-muted">
              <li><span className="font-medium text-navy">No streaks.</span> A gap doesn't reset anything.</li>
              <li><span className="font-medium text-navy">One session at a time.</span> We suggest the next one; you choose when.</li>
              <li><span className="font-medium text-navy">Smaller is fine.</span> Simplified sessions count the same.</li>
            </ul>
            <p data-testid="total-sessions-text" className="mt-6 border-t border-sand-line pt-4 text-sm text-navy-muted">
              {d ? `${d.total_sessions} session${d.total_sessions === 1 ? "" : "s"} completed so far` : "\u00a0"}
            </p>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
