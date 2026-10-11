import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, CircleDashed, Clock, Feather, Lightbulb, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import CodeEditor from "@/components/CodeEditor";
import { RichText, SourceBadge } from "@/components/coach-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import { qk, VARIANT_LABEL } from "@/lib/coach";
import type { CheckRequest, CheckResult, Completion, CompletionCreate, Dashboard, Exercise, Variant } from "@/lib/coach";
import { cn } from "@/lib/utils";

export default function Session() {
  const { exerciseId } = useParams();
  const dash = useQuery({
    queryKey: qk.dashboard,
    queryFn: () => apiGet<Dashboard>("/dashboard"),
    enabled: !exerciseId,
  });
  const id = exerciseId ?? dash.data?.next_exercise?.id;
  const ex = useQuery({
    queryKey: qk.exercise(id ?? ""),
    queryFn: () => apiGet<Exercise>(`/exercises/${id}`),
    enabled: !!id,
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link to="/dashboard" data-testid="session-back-link" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-muted hover:text-navy">
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
        {ex.data && !ex.isError ? (
          <Workspace key={ex.data.id} exercise={ex.data} />
        ) : (
          <div className="mt-8 rounded-2xl border border-sand-line bg-white p-8" data-testid="session-unavailable">
            <p className="font-heading text-xl font-medium text-navy">
              {ex.isError || dash.isError ? "This session couldn't be loaded." : "Preparing your session…"}
            </p>
            <p className="mt-2 text-navy-muted">
              {ex.isError || dash.isError ? "Head back to the dashboard and pick it up from there." : "One moment."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Workspace({ exercise }: { exercise: Exercise }) {
  const qc = useQueryClient();
  const [variant, setVariant] = useState<Variant>("standard");
  const [code, setCode] = useState(exercise.standard.starter_code);
  const [hintOpen, setHintOpen] = useState(false);
  const [check, setCheck] = useState<{ result: CheckResult; code: string } | null>(null);
  const [done, setDone] = useState<Completion | null>(null);

  const v = exercise[variant];
  const passed = !!check && check.result.passed && check.code === code;
  const easier = variant === "easier";

  const switchVariant = (next: Variant) => {
    setVariant(next);
    setCode(exercise[next].starter_code);
    setCheck(null);
  };

  const runCheck = useMutation({
    mutationFn: (body: CheckRequest) => apiPost<CheckResult>(`/exercises/${exercise.id}/check`, body),
    onSuccess: (result, body) => setCheck({ result, code: body.code }),
    onError: () => toast.error("The check couldn't run. Please try again."),
  });

  const complete = useMutation({
    mutationFn: (body: CompletionCreate) => apiPost<Completion>("/completions", body),
    onSuccess: (c) => {
      setDone(c);
      qc.invalidateQueries({ queryKey: qk.dashboard });
      qc.invalidateQueries({ queryKey: qk.completions });
    },
    onError: () => toast.error("Couldn't save this session. Please try again."),
  });

  if (done) {
    return (
      <section data-testid="session-complete-panel" className="cc-fade-up mt-8 max-w-2xl rounded-2xl border border-sage-line bg-white p-8 sm:p-10">
        <span className="grid size-11 place-items-center rounded-full bg-sage-soft text-sage">
          <Check className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">Session complete.</h1>
        <p data-testid="session-complete-message" className="mt-3 leading-relaxed text-navy-muted">
          You finished “{exercise.title}”{done.variant === "easier" ? " in its simplified form" : ""}. It's saved to your history.
          That's enough for today — or keep going if you have the energy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/dashboard" data-testid="complete-back-dashboard-button" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}>
            Back to dashboard
          </Link>
          <Link to="/history" data-testid="complete-view-history-button" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl px-5")}>
            View history
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {/* Brief */}
      <section className="lg:col-span-5 lg:sticky lg:top-24" data-testid="exercise-brief">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-coral-ink">{exercise.concept}</span>
          <SourceBadge source={exercise.source} />
        </div>
        <h1 data-testid="exercise-title" className="mt-3 text-3xl font-semibold tracking-tight text-navy">{exercise.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-navy-muted">
          <span
            data-testid="exercise-variant-badge"
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
              easier ? "bg-coral-soft text-coral-ink" : "bg-sand text-navy",
            )}
          >
            {easier && <Feather className="size-3" />}
            {VARIANT_LABEL[variant]}
          </span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> about {v.estimated_minutes} min</span>
        </div>

        <div key={variant} className="cc-fade-up mt-6 rounded-2xl border border-sand-line bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-navy-muted">Your task</p>
          <p data-testid="exercise-prompt" className="mt-3 text-[17px] leading-relaxed text-navy">
            <RichText text={v.prompt} />
          </p>
        </div>

        {easier ? (
          <div data-testid="easier-message" role="status" className="cc-fade-up mt-4 rounded-2xl border border-coral-line bg-coral-soft p-5">
            <p className="flex items-center gap-2 font-medium text-coral-ink">
              <Feather className="size-4" /> Smaller step, same direction.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-coral-ink/90">
              Adjusting the size of a task is part of learning. {exercise.easier_note} It counts as a completed session.
            </p>
            <button
              type="button"
              data-testid="back-to-full-version-button"
              onClick={() => switchVariant("standard")}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-coral-ink underline-offset-4 hover:underline"
            >
              <Undo2 className="size-3.5" /> Switch back to the full version
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            data-testid="make-it-easier-button"
            onClick={() => switchVariant("easier")}
            className="mt-4 h-11 w-full gap-2 rounded-xl border-coral-line bg-white text-coral-ink hover:bg-coral-soft hover:text-coral-ink active:scale-[0.99] transition-[background-color,transform] duration-150 sm:w-auto sm:px-5"
          >
            <Feather className="size-4" /> Make It Easier
          </Button>
        )}

        <div className="mt-4 rounded-2xl border border-hint-line bg-hint">
          <button
            type="button"
            data-testid="hint-toggle-button"
            aria-expanded={hintOpen}
            onClick={() => setHintOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left text-sm font-medium text-hint-ink"
          >
            <span className="inline-flex items-center gap-2"><Lightbulb className="size-4" /> {hintOpen ? "Hide hint" : "Show a hint"}</span>
            <span className="text-xs font-normal opacity-80">{hintOpen ? "" : "no penalty"}</span>
          </button>
          {hintOpen && (
            <p data-testid="hint-text" className="cc-fade-up border-t border-hint-line px-5 py-4 text-sm leading-relaxed text-hint-ink">
              <RichText text={exercise.hint} />
            </p>
          )}
        </div>
      </section>

      {/* Editor + check */}
      <section className="lg:col-span-7" data-testid="exercise-workspace">
        <CodeEditor value={code} onChange={setCode} />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            data-testid="check-code-button"
            onClick={() => runCheck.mutate({ code, variant })}
            disabled={runCheck.isPending}
            className="h-11 rounded-xl px-5 active:scale-[0.98] transition-[background-color,transform] duration-150"
          >
            {runCheck.isPending ? "Checking…" : "Check my code"}
          </Button>
          <Button
            variant="ghost"
            data-testid="reset-code-button"
            onClick={() => { setCode(v.starter_code); setCheck(null); }}
            className="h-11 gap-1.5 rounded-xl text-navy-muted"
          >
            <RotateCcw className="size-4" /> Reset
          </Button>
          <p className="text-xs text-navy-muted sm:ml-auto">Prototype check: looks for key pieces, doesn't run code.</p>
        </div>

        {check && (
          <div
            data-testid="check-result"
            role="status"
            className={cn(
              "cc-fade-up mt-4 rounded-2xl border p-5",
              check.result.passed ? "border-sage-line bg-sage-soft" : "border-sand-line bg-white",
            )}
          >
            <p data-testid="check-result-message" className={cn("font-medium", check.result.passed ? "text-sage-ink" : "text-navy")}>
              {check.result.message}
            </p>
            {check.code !== code && (
              <p className="mt-1 text-xs text-navy-muted">You've edited the code since this check — run it again to update.</p>
            )}
            <ul className="mt-3 flex flex-wrap gap-2">
              {[...check.result.found.map((s) => ({ s, ok: true })), ...check.result.missing.map((s) => ({ s, ok: false }))].map(({ s, ok }) => (
                <li
                  key={s}
                  data-testid={`check-snippet-${ok ? "found" : "missing"}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs",
                    ok ? "border-sage-line bg-white text-sage-ink" : "border-sand-line bg-sand text-navy-muted",
                  )}
                >
                  {ok ? <Check className="size-3" /> : <CircleDashed className="size-3" />}
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-sand-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-navy-muted">
            {passed ? "Ready to log this session." : "Run the check first — completion unlocks once it passes."}
          </p>
          <Button
            data-testid="complete-session-button"
            disabled={!passed || complete.isPending}
            onClick={() => complete.mutate({ exercise_id: exercise.id, variant, code })}
            className="h-11 gap-2 rounded-xl bg-coral px-5 text-white hover:bg-coral-hover disabled:bg-sand-line disabled:text-navy-muted"
          >
            <Check className="size-4" /> {complete.isPending ? "Saving…" : "Complete session"}
          </Button>
        </div>
      </section>
    </div>
  );
}
