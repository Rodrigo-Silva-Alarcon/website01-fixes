import { ImgHTMLAttributes } from 'react';

// Logo oficial de Smart House (mismo archivo que usa la web pública)
const LOGO_FULL = '/images/logo-smarthouse.png';
const LOGO_MARK = '/images/logo-mark.png';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
    variant?: 'icon' | 'wordmark';
}

export default function AppLogoIcon({ variant = 'wordmark', className = '', alt, ...props }: AppLogoIconProps) {
    return (
        <img
            src={variant === 'icon' ? LOGO_MARK : LOGO_FULL}
            alt={alt ?? 'Smart House Importaciones SRL'}
            className={`object-contain ${className}`}
            draggable={false}
            {...props}
        />
    );
}
