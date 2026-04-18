export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-4">
      <h2 className="uppercase font-extrabold tracking-wider text-xl md:text-2xl">
        {title}
      </h2>
      {subtitle && (
        <div className="text-aurora-muted text-sm md:text-base">{subtitle}</div>
      )}
    </div>
  );
}
