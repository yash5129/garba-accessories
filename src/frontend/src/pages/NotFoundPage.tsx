import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

/**
 * 404 page for unmatched routes.
 */
export function NotFoundPage() {
  return (
    <div
      data-ocid="notfound.page"
      className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6"
    >
      <p className="font-accent text-2xl text-accent">Oops</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-primary">
        This page slipped off the garland
      </h1>
      <p className="mt-4 text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Button
        asChild
        data-ocid="notfound.home_button"
        className="mt-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
      >
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
