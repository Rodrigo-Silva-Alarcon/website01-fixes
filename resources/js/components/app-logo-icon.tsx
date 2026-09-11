import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" fill="currentColor" role="img" aria-label="Lg" {...props}>
            <text x="2" y="35" fontFamily="Arial, Helvetica, sans-serif" fontSize="42" fontWeight="700" letterSpacing="-3">Lg</text>
        </svg>
    );
}
