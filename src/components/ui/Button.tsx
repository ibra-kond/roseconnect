import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'soft';

const base =
  'inline-flex min-h-tap items-center justify-center gap-2 rounded-pill px-5 font-heading text-base font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none';

const variants: Record<ButtonVariant, string> = {
  // #863146 : texte blanc (contraste 8:1). #F26ABC est trop clair pour du texte blanc : texte prune foncé (AA).
  primary: 'border-2 border-plum-700 bg-plum-700 text-white shadow-soft hover:bg-plum-800 active:bg-plum-800',
  secondary: 'border-2 border-plum-700 bg-pink-500 text-ink shadow-soft hover:bg-pink-600 active:bg-pink-600',
  // Boutons non principaux : contour bordeaux, texte noir (bien lisible), même au repos.
  outline: 'border-2 border-plum-700 bg-white text-ink hover:bg-pink-50 active:bg-pink-100',
  soft: 'border-2 border-plum-700 bg-pink-50 text-ink hover:bg-pink-100 active:bg-pink-100',
  ghost: 'border-2 border-plum-700 bg-white text-ink hover:bg-pink-50 active:bg-pink-100',
};

interface CommonProps {
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', icon, iconRight, block, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(base, variants[variant], block && 'w-full', className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
});

interface LinkButtonProps extends CommonProps {
  to: string;
  'aria-label'?: string;
  onClick?: () => void;
}

export function LinkButton({ variant = 'primary', icon, iconRight, block, className, children, to, ...rest }: LinkButtonProps) {
  return (
    <Link to={to} className={cn(base, variants[variant], block && 'w-full', className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

interface AnchorButtonProps extends CommonProps {
  href: string;
  'aria-label'?: string;
}

export function AnchorButton({ variant = 'primary', icon, iconRight, block, className, children, href, ...rest }: AnchorButtonProps) {
  return (
    <a href={href} className={cn(base, variants[variant], block && 'w-full', className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </a>
  );
}
