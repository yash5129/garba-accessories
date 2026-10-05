import { CATEGORIES } from "@/lib/categories";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

const CONTACT = {
  phone: "+91 98765 43210",
  email: "hello@logodiwati.com",
  location: "Ahmedabad, Gujarat",
};

/**
 * Maroon footer with store identity, contact details, and category links.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="site.footer"
      className="mt-20 bg-primary text-primary-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-gradient-gold font-display text-lg font-semibold text-gold-foreground"
            >
              ल
            </span>
            <span className="font-display text-xl font-semibold">
              Logodiwati
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Handmade Navratri and Garba hair accessories, crafted in small
            batches with marigold, pearls, and a whole lot of love.
          </p>
          <p className="mt-5 font-accent text-lg text-gold">
            Get Garba ready this Navratri.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
            Shop by category
          </h2>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.map((category) => (
              <li key={category.value}>
                <Link
                  to="/shop"
                  search={{ category: category.value }}
                  data-ocid={`site.footer.category.${category.value}`}
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-gold">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-gold"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-gold" aria-hidden="true" />
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors hover:text-gold"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin
                className="size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <span>{CONTACT.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/70 sm:flex-row sm:px-6">
          <p>© {year} Logodiwati. All rights reserved.</p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-gold"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
