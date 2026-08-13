import { Link } from "react-router-dom";
import TopoBackground from "../common/TopoBackground";
import Card from "../common/Card";

/**
 * Mark: a faceted hexagon (mineral / surveyed plot) pierced by a
 * crosshair pin — reads as both "mining" and "map" at a glance,
 * and scales cleanly from a 28px mobile badge to a 56px hero mark.
 */

function LogoLockup({ markClassName = "h-8 w-8", wordmarkClassName, tone = "dark" }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/logo.jpg"
        alt="Mining Map"
        className={`${markClassName} rounded-full object-cover`}
        style={{ clipPath: "circle(50%)", mixBlendMode: "multiply" }}
      />
      <span
        className={`font-display font-semibold tracking-tight ${wordmarkClassName} ${
          tone === "light" ? "text-white" : "text-ink"
        }`}
      >
        Mining Map
      </span>
    </div>
  );
}

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
      <div className="relative hidden w-full flex-col overflow-hidden bg-[#EAECEE] p-10 text-ink lg:flex lg:w-2/5">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative isolate flex items-center justify-center">
            <div className="absolute h-68 w-68 rounded-full bg-white/80 blur-3xl" />
            <div className="absolute h-40 w-40 rounded-full bg-white" />
            <img
              src="/logo.jpg"
              alt="Mining Map"
              className="relative h-40 w-40 rounded-full object-cover shadow-xl shadow-ink/20"
              style={{ clipPath: "circle(50%)", mixBlendMode: "multiply" }}
            />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">
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
        <div className="absolute inset-0 text-copper/25 lg:hidden">
          <TopoBackground />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile-only brand header */}
          <div className="mb-8 flex justify-center lg:hidden">
            <LogoLockup markClassName="h-8 w-8" wordmarkClassName="text-lg" />
          </div>

          <div className="mb-8 text-center lg:text-left">
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-widest text-copper">
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

          <Card className="shadow-lg shadow-ink/5 ring-1 ring-ink/5">
            {children}
          </Card>

          {footerText && (
            <p className="mt-6 text-center text-sm text-ink-muted lg:text-left">
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                className="font-medium text-copper transition-colors hover:text-copper/80 hover:underline"
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