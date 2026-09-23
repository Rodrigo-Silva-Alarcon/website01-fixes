import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

const PLACEHOLDER = '/images/product-placeholder.svg';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src: string | null | undefined;
    webpSrc?: string | null;
};

export default function ResponsiveImg({ src, webpSrc, ...rest }: Props) {
    const [failed, setFailed] = useState(false);
    const resolved = !src || failed ? PLACEHOLDER : src;
    const resolvedWebp = !failed && webpSrc ? webpSrc : null;
    const handleError = () => {
        if (resolved !== PLACEHOLDER) setFailed(true);
    };

    if (resolvedWebp) {
        return (
            <picture>
                <source srcSet={resolvedWebp} type="image/webp" />
                <img src={resolved} onError={handleError} {...rest} />
            </picture>
        );
    }

    return <img src={resolved} onError={handleError} {...rest} />;
}
