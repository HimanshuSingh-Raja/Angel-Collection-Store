'use client';

import React from 'react';
import Link from 'next/link';

export type LogoVariant = 'horizontal' | 'full' | 'mobile' | 'stacked' | 'icon-only' | 'favicon' | 'dark';

interface AngelLogoProps {
  variant?: LogoVariant;
  className?: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Premium Matte Gold (#C8A45D) Female Silhouette Icon.
 * Vector-optimized for 16px favicon scalability up to billboard resolutions.
 * Eliminates legacy 3D embossed overlaps in favor of clean vector geometry.
 */
export const AngelSilhouetteIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-9 h-9',
  color = '#C8A45D',
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <g fill={color}>
      {/* Matte Gold Hair Bun Updo */}
      <circle cx="36" cy="46" r="13" />

      {/* Ultra-Clean Profile: Forehead, Nose, Lips, Chin, Neck */}
      <path d="M 44, 25 C 34, 25 25, 34 25, 46 C 25, 59 34, 69 44, 71 C 43, 79 39, 87 31, 91 C 42, 91 55, 89 63, 83 C 58, 76 54, 68 53, 60 C 59, 58 64, 53 65, 47 C 69, 47 73, 45 73, 41 C 69, 40 66, 40 65, 39 C 63, 31 54, 25 44, 25 Z M 65, 41 C 63, 41 62, 42 62, 43 C 63, 44 65, 44 66, 43 C 66, 42 65, 41 65, 41 Z" />

      {/* Gold Bindi Accent Dot */}
      <circle cx="62" cy="37" r="2.3" />

      {/* Smooth Draped Collar */}
      <path d="M 49, 72 C 53, 76 57, 81 59, 87 C 65, 85 70, 81 74, 77 C 69, 74 64, 72 59, 71 C 55, 71 52, 71 49, 72 Z" />
    </g>
  </svg>
);

export const AngelLogo: React.FC<AngelLogoProps> = ({
  variant = 'horizontal',
  className = '',
  href = '/',
  onClick,
}) => {
  const isDark = variant === 'dark';
  const isStacked = variant === 'stacked';
  const isMobile = variant === 'mobile';
  const isFavicon = variant === 'favicon';
  const isIconOnly = variant === 'icon-only' || isFavicon;

  // Colors
  const iconColor = '#C8A45D'; // Always Matte Gold
  const angelTextColor = isDark ? '#FFFFFF' : '#111111'; // Black on light, White on dark
  const collectionTextColor = '#C8A45D'; // Always Matte Gold

  const logoContent = (
    <div
      onClick={onClick}
      className={`inline-flex items-center group transition-transform duration-200 ${
        isStacked ? 'flex-col text-center gap-2' : 'flex-row gap-3 sm:gap-4'
      } ${className}`}
    >
      {/* LEFT / TOP: Matte Gold Silhouette Icon */}
      <div
        className={`flex items-center justify-center shrink-0 ${
          isFavicon ? 'p-1 bg-[#111111] rounded-lg' : ''
        }`}
      >
        <AngelSilhouetteIcon
          className={
            isFavicon
              ? 'w-5 h-5'
              : isIconOnly
              ? 'w-10 h-10 sm:w-12 sm:h-12'
              : isStacked
              ? 'w-12 h-12 sm:w-14 sm:h-14'
              : isMobile
              ? 'w-7.5 h-7.5'
              : 'w-9 h-9 sm:w-10 sm:h-10'
          }
          color={iconColor}
        />
      </div>

      {/* RIGHT / BOTTOM: Refined Typography */}
      {!isIconOnly && (
        <div
          className={`flex flex-col justify-center leading-none font-sans ${
            isStacked ? 'items-center text-center' : 'items-start text-left'
          }`}
        >
          {/* ANGEL: Elegant Bold Serif */}
          <span
            className={`font-serif font-bold tracking-tight ${
              isStacked
                ? 'text-2xl sm:text-4xl'
                : isMobile
                ? 'text-xl sm:text-2xl'
                : 'text-2xl sm:text-3xl'
            }`}
            style={{ color: angelTextColor }}
          >
            ANGEL
          </span>

          {/* COLLECTION: Small Uppercase Matte Gold (#C8A45D) */}
          <span
            className={`font-sans font-bold uppercase ${
              isStacked
                ? 'text-[10px] sm:text-[11px] tracking-[0.45em] mt-1.5'
                : isMobile
                ? 'text-[8px] tracking-[0.3em] mt-0.5'
                : 'text-[9px] sm:text-[10px] tracking-[0.38em] mt-1'
            }`}
            style={{ color: collectionTextColor }}
          >
            COLLECTION
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Angel Collection Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
