import { Link } from "react-router-dom";
import TopoBackground from "../common/TopoBackground";
import Card from "../common/Card";

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Brand panel — hidden on mobile, shown from lg breakpoint up */}
      <div className="relative hidden w-full items-end overflow-hidden bg-[#101317] p-10 text-ink lg:flex lg:w-2/5">
        <TopoBackground className="text-teal" />
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-widest text-amber">
            SITE-04 · Field Operations
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            Mining Map
          </h1>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Survey, log, and update site records from the field or the
            office.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-base px-4 py-10 sm:px-8">
        <div className="absolute inset-0 text-teal/30 lg:hidden">
          <TopoBackground />
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <p className="font-display text-lg font-semibold text-ink lg:hidden">
              Mining Map
            </p>
            {eyebrow && (
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-amber lg:mt-0">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
            )}
          </div>

          <Card>{children}</Card>

          {footerText && (
            <p className="mt-6 text-center text-sm text-ink-muted lg:text-left">
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                className="font-medium text-amber hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
