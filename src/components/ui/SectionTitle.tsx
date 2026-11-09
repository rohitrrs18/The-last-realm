export function SectionTitle({ kicker, title, subtitle, actions, size = 'md' }: any) {
  const sizes: Record<string, string> = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-5xl' };
  const TITLE_SIZE = sizes[size] || 'text-3xl';
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          {kicker && <div className="text-[10px] uppercase tracking-widest text-gold/70 mb-1">{kicker}</div>}
          <h1 className={`h-serif ${TITLE_SIZE} text-ink`}>{title}</h1>
          {subtitle && <p className="text-[12px] text-ink2 italic mt-2">{subtitle}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="mt-4 hair-gold" />
    </div>
  );
}
export function SubSectionTitle({ children }: any) {
  return <div className="text-[10px] uppercase tracking-widest text-muted mb-3">{children}</div>;
}
