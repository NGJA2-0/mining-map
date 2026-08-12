export default function TopoBackground({ className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {[...Array(9)].map((_, i) => (
        <path
          key={i}
          d={`M -20 ${30 + i * 45} Q 100 ${5 + i * 45}, 200 ${30 + i * 45} T 420 ${30 + i * 45}`}
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.12 + i * 0.02}
        />
      ))}
    </svg>
  );
}
