import React from 'react';
import logoSvg from '../../assets/faciloop-logo.svg';
import iconSvg from '../../assets/faciloop-icon.svg';

interface FaciloopBrandProps {
  variant?: 'logo' | 'icon' | 'full';
  className?: string;
}

export const FaciloopBrand: React.FC<FaciloopBrandProps> = ({ variant = 'logo', className = 'h-9 sm:h-11' }) => {
  if (variant === 'icon') {
    return (
      <img
        src={iconSvg}
        alt="Faciloop Icon"
        className={className || 'w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0'}
      />
    );
  }

  return (
    <img
      src={logoSvg}
      alt="Faciloop CRM"
      className={className || 'h-9 sm:h-11 object-contain shrink-0'}
    />
  );
};
