import React from 'react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string; // Container class
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  theme?: 'light' | 'dark' | 'emerald';
  isLink?: boolean;
  to?: string;
  iconOnly?: boolean;
}

export function Logo({ 
  className, 
  iconClassName, 
  textClassName, 
  showText = true,
  theme = 'light',
  isLink = true,
  to = "/",
  iconOnly = false
}: LogoProps) {
  
  const content = (
    <>
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        "text-primary",
        iconClassName || "w-10 h-10"
      )}>
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
            <mask id="logo-cutout-mask">
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <rect x="5.5" y="10.5" width="13" height="2" rx="1" fill="black" />
              <rect x="5.5" y="14.5" width="8" height="2" rx="1" fill="black" />
            </mask>
          </defs>
          
          {/* Back layered folder tab - animating up on hover */}
          <rect x="4" y="3" width="16" height="15" rx="3.5" fill="currentColor" className="opacity-20 origin-bottom transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-y-[1.05]" />
          
          {/* Front solid block - animating down gently on hover */}
          <rect x="2" y="6" width="20" height="15" rx="3.5" fill="currentColor" mask="url(#logo-cutout-mask)" className="origin-bottom transition-all duration-500 ease-out group-hover:translate-y-0.5 group-hover:scale-y-[0.98]" />
          
          {/* Top accent line representing a document/app header */}
          <rect x="2" y="8" width="20" height="1.5" fill={theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)'} className="transition-all duration-500 ease-out group-hover:translate-y-0.5" />
        </svg>
      </div>
      
      {showText && !iconOnly && (
        <span className={cn(
          "font-black tracking-tighter transition-all duration-300",
          theme === 'dark' ? "text-white" : "text-zinc-900 group-hover:text-primary",
          theme === 'emerald' ? "text-white" : "",
          textClassName || "text-2xl"
        )}>
          مدارج<span className="text-primary">OS</span>
        </span>
      )}
    </>
  );

  const wrapperClass = cn("flex items-center gap-3 group cursor-pointer outline-none select-none", className);

  if (isLink) {
    return (
      <Link to={to} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClass}>
      {content}
    </div>
  );
}
