type YellowLineLoaderProps = {
  label?: string;
  className?: string;
};

export function YellowLineLoader({
  label = "Loading",
  className = "",
}: YellowLineLoaderProps) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      role="status"
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b949e] ${className}`}
    >
      <span aria-hidden="true" className="yellow-line-loader">
        <span />
      </span>
      <span>{label}</span>
    </div>
  );
}
