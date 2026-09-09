import React from 'react';
import logoClair from '../../assets/faciloopro-clair.jpeg';
import logoSombre from '../../assets/faciloopro-sombre.jpeg';
import iconSvg from '../../assets/faciloop-icon.svg';
import { useAuth } from '../../contexts/AuthContext';

interface FaciloopBrandProps {
  variant?: 'logo' | 'icon' | 'full';
  className?: string;
  forceDark?: boolean;
}

export const FaciloopBrand: React.FC<FaciloopBrandProps> = ({ variant = 'logo', className = 'h-9 sm:h-11', forceDark }) => {
  const { isDarkMode } = useAuth();

  if (variant === 'icon') {
    return (
      <img
        src={iconSvg}
        alt="Faciloopro Icon"
        className={className || 'w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0'}
      />
    );
  }

  const useDark = forceDark ?? isDarkMode;

  return (
    <img
      src={useDark ? logoSombre : logoClair}
      alt="Faciloopro"
      className={className || 'h-9 sm:h-11 object-contain shrink-0'}
    />
  );
};
