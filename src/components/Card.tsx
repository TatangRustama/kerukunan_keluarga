import React from 'react';
import { cn } from '@/lib/utils';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Card({ children, className, onClick, ...props }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-pkk-surface rounded-xl border border-pkk-border shadow-ambient transition-transform active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
