import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import { type FormEvent, useState } from "react";

const NAV_LINKS = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
];

/**
 * Sticky festive header: wordmark, primary nav, search, and sign-in.
 * The admin link only appears for the signed-in store owner.
 */
export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    void navigate({
      to: "/shop",
      search: trimmed ? { q: trimmed } : {},
    });
    setMenuOpen(false);
  }

  return (
    <header
      data-ocid="site.header"
      className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-subtle backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Link
          to="/"
          data-ocid="site.logo_link"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMenuOpen(false)}
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-gradient-primary font-display text-lg font-semibold text-primary-foreground shadow-gold-glow"
          >
            ल
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-primary">
              Logodiwati
            </span>
            <span className="font-accent text-[0.7rem] text-accent">
              handmade with love
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`site.nav.${link.label.toLowerCase()}`}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "text-primary" }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              data-ocid="site.nav.admin"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "bg-accent/10" }}
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin
            </Link>
          ) : null}
        </nav>

        <form
          onSubmit={handleSearch}
          className="relative ml-auto hidden max-w-xs flex-1 sm:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search accessories"
            aria-label="Search products"
            data-ocid="site.search_input"
            className="h-10 rounded-full border-input bg-background pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="site.signout_button"
              onClick={() => clear()}
              className="hidden rounded-full sm:inline-flex"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              data-ocid="site.signin_button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="hidden rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 sm:inline-flex"
            >
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            data-ocid="site.menu_toggle"
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-card px-4 pb-4 pt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search accessories"
              aria-label="Search products"
              data-ocid="site.search_input_mobile"
              className="h-10 rounded-full border-input bg-background pl-9"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`site.mobile_nav.${link.label.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-secondary-foreground",
                )}
                activeProps={{
                  className: "bg-secondary text-secondary-foreground",
                }}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/admin"
                data-ocid="site.mobile_nav.admin"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Admin
              </Link>
            ) : null}
          </nav>
          <div className="mt-3">
            {isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                data-ocid="site.signout_button_mobile"
                onClick={() => {
                  clear();
                  setMenuOpen(false);
                }}
                className="w-full rounded-full"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            ) : (
              <Button
                type="button"
                data-ocid="site.signin_button_mobile"
                onClick={() => {
                  login();
                  setMenuOpen(false);
                }}
                disabled={isLoggingIn}
                className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                {isLoggingIn ? "Signing in…" : "Sign in"}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
