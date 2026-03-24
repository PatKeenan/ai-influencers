import { Outlet, NavLink, useLocation } from "react-router";
import { Network, Rss, BookOpen } from "lucide-react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { APP_VERSION } from "../../lib/constants";

const NAV_ITEMS = [
  { to: "/", icon: Network, label: "Graph", end: true },
  { to: "/feed", icon: Rss, label: "Feed" },
  { to: "/notebook", icon: BookOpen, label: "Notes" },
] as const;

export function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();

  // On detail pages (person, reader), hide bottom tabs and show back-friendly layout
  const isFullPage = location.pathname.startsWith("/person/") || location.pathname.startsWith("/read/");

  return (
    <div className="flex h-dvh bg-bg text-text-secondary overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && (
        <nav className="flex flex-col w-14 border-r border-border bg-bg-raised shrink-0">
          {/* Brand mark */}
          <div className="flex items-center justify-center h-14 border-b border-border">
            <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Network className="w-4 h-4 text-accent" />
            </div>
          </div>

          {/* Nav items */}
          <div className="flex flex-col items-center gap-1 pt-3">
            {NAV_ITEMS.map(({ to, icon: Icon, label, ...rest }) => (
              <NavLink
                key={to}
                to={to}
                end={"end" in rest ? rest.end : undefined}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-10 h-10 rounded-md transition-all duration-[var(--transition-base)] group relative ${
                    isActive
                      ? "bg-surface-active text-accent"
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-label font-mono tracking-wider mt-0.5 uppercase">
                  {label}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Bottom spacer */}
          <div className="mt-auto pb-3 flex flex-col items-center gap-1">
            <div className="w-8 h-px bg-border mb-1" />
            <span className="text-caption font-mono text-text-muted tracking-widest">
              {APP_VERSION}
            </span>
          </div>
        </nav>
      )}

      {/* Main content area */}
      <main className={`flex-1 flex flex-col min-w-0 min-h-0 ${isMobile && !isFullPage ? "pb-[calc(3.5rem+env(safe-area-inset-bottom))]" : ""}`}>
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      {isMobile && !isFullPage && (
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-bg-raised/95 backdrop-blur-sm border-t border-border flex items-center justify-around z-overlay pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map(({ to, icon: Icon, label, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              end={"end" in rest ? rest.end : undefined}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-lg transition-all duration-[var(--transition-base)] ${
                  isActive
                    ? "text-accent"
                    : "text-text-muted active:text-text-secondary"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono tracking-wider uppercase">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
