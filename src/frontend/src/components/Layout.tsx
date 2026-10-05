import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Outlet } from "@tanstack/react-router";

/**
 * Shared application shell: sticky festive header, routed content, maroon footer.
 */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
