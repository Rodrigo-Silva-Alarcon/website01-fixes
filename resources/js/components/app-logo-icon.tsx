import { SVGAttributes } from 'react';

const HOUSE_PATH = 'M24 5.5 4 21.5V43h15.5V30h9v13H44V21.5L24 5.5Z';

interface AppLogoIconProps extends SVGAttributes<SVGElement> {
    variant?: 'icon' | 'wordmark';
}

export default function AppLogoIcon({ variant = 'wordmark', ...props }: AppLogoIconProps) {
    if (variant === 'icon') {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                fill="currentColor"
                role="img"
                aria-label="Smart House"
                {...props}
            >
                <path d={HOUSE_PATH} />
            </svg>
        );
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 48"
            fill="currentColor"
            role="img"
            aria-label="Smart House"
            {...props}
        >
            <path d={HOUSE_PATH} />
            <text
                x="56"
                y="34"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="28"
                fontWeight="700"
                letterSpacing="-0.5"
            >
                Smart House
            </text>
        </svg>
    );
}
