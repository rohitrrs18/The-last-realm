import React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' };
export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans tracking-wide transition-all duration-200 border rounded-sm';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-base' }[size];
  const variants = { primary: 'bg-[#2b2a22] border-gold/40 text-goldSoft hover:border-gold hover:text-ink', ghost: 'bg-transparent border-gold/15 text-ink2 hover:border-gold/40 hover:text-ink', danger: 'bg-[#2a1515] border-crimson/50 text-[#d68a85] hover:border-crimson hover:text-ink' }[variant];
  return <button className={`${base} ${sizes} ${variants} ${className} disabled:opacity-40`} {...rest}>{children}</button>;
}
