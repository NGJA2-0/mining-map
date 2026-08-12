export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold tracking-wide transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm sm:text-base",
    lg: "px-6 py-3 text-base sm:text-lg",
  };

  const variants = {
    primary:
      "bg-amber text-ink shadow-[0_0_0_1px_rgba(193,131,42,0.35)] hover:bg-amber-dark focus-visible:outline-amber",
    copper:
      "bg-copper text-white shadow-[0_0_0_1px_rgba(184,90,41,0.35)] hover:brightness-110 focus-visible:outline-copper",
    secondary:
      "bg-transparent text-ink border border-line hover:border-copper hover:text-copper focus-visible:outline-copper",
    ghost: "bg-transparent text-ink-muted hover:text-ink",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
