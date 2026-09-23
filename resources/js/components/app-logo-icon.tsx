import { SVGAttributes } from 'react';

const BRAND_ORANGE = '#fa8232';
const BRAND_BLUE = '#155eef';
const HOUSE_PATH = 'M24 4 3 21.5V44h42V21.5L24 4Z';

interface AppLogoIconProps extends SVGAttributes<SVGElement> {
    variant?: 'icon' | 'wordmark';
}

function BrandMark() {
    return (
        <>
            <path d={HOUSE_PATH} fill={BRAND_ORANGE} />
            <path
                d="M18 28.6 24 35.5 30 28.6"
                fill="none"
                stroke={BRAND_BLUE}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="18" cy="27.5" r="2.6" fill={BRAND_BLUE} />
            <circle cx="30" cy="27.5" r="2.6" fill={BRAND_BLUE} />
            <circle cx="24" cy="36.2" r="2.6" fill={BRAND_BLUE} />
            <rect x="21.5" y="39" width="5" height="5" rx="0.6" fill="#191c1f" />
        </>
    );
}

function MonoMark() {
    return (
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={`${HOUSE_PATH} M15.5 27.5a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 0 0-6.4 0Zm10.6 0a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 0 0-6.4 0ZM20.8 36.2a3.2 3.2 0 1 0 6.4 0 3.2 3.2 0 0 0-6.4 0Z`}
            fill="currentColor"
        />
    );
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
                <MonoMark />
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
            <BrandMark />
            <text
                x="56"
                y="22"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="17"
                fontWeight="700"
                letterSpacing="1.5"
                fill="currentColor"
            >
                SMART
            </text>
            <text
                x="56"
                y="40"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="17"
                fontWeight="400"
                letterSpacing="3"
                fill={BRAND_ORANGE}
            >
                HOUSE
            </text>
        </svg>
    );
}
