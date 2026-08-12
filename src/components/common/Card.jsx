export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
