import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

const PLACEHOLDER = '/images/product-placeholder.svg';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src: string | null | undefined;
    webpSrc?: string | null;
    /** Miniatura WebP de 480px: el navegador la elige en pantallas pequeñas según `sizes`. */
    thumbWebpSrc?: string | null;
};

export default function ResponsiveImg({ src, webpSrc, thumbWebpSrc, sizes, loading = 'lazy', decoding = 'async', ...rest }: Props) {
    const [failed, setFailed] = useState(false);
    const resolved = !src || failed ? PLACEHOLDER : src;
    const handleError = () => {
        if (resolved !== PLACEHOLDER) setFailed(true);
    };

    const webpSet = failed
        ? null
        : thumbWebpSrc && webpSrc
          ? `${thumbWebpSrc} 480w, ${webpSrc} 800w`
          : thumbWebpSrc || webpSrc || null;

    if (webpSet) {
        return (
            <picture>
                <source srcSet={webpSet} sizes={thumbWebpSrc && webpSrc ? sizes : undefined} type="image/webp" />
                <img src={resolved} onError={handleError} sizes={sizes} loading={loading} decoding={decoding} {...rest} />
            </picture>
        );
    }

    return <img src={resolved} onError={handleError} sizes={sizes} loading={loading} decoding={decoding} {...rest} />;
}
