import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", testid: "nav-dashboard-link" },
  { to: "/session", label: "Session", testid: "nav-session-link" },
  { to: "/history", label: "History", testid: "nav-history-link" },
];

export function Logo() {
  return (
    <Link to="/" data-testid="nav-logo-link" className="flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 outline-none">
      <span className="grid size-8 place-items-center rounded-lg bg-navy text-white">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
      </span>
      <span className="font-heading text-[17px] font-semibold tracking-tight text-navy">Comeback Coach</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-sand-line/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="flex items-center gap-1" aria-label="Main">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={n.testid}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-200 sm:px-3",
                    isActive ? "bg-sand text-navy" : "text-navy-muted hover:text-navy hover:bg-sand/60",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-sand-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-navy-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>You don't have to catch up. You just have to start again.</p>
          <p data-testid="footer-content-note">Prototype · exercises are sample content</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
