interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-background text-text-muted border border-border',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    accent: 'bg-accent/10 text-accent-dark border border-accent/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
