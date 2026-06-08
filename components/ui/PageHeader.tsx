interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "0.25rem" }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
