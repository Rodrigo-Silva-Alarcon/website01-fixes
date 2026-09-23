import type { ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src: string | null | undefined;
    webpSrc?: string | null;
};

export default function ResponsiveImg({ src, webpSrc, ...rest }: Props) {
    if (!src) {
        return null;
    }

    if (webpSrc) {
        return (
            <picture>
                <source srcSet={webpSrc} type="image/webp" />
                <img src={src} {...rest} />
            </picture>
        );
    }

    return <img src={src} {...rest} />;
}
