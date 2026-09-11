import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#efeff6] p-4 text-slate-900 sm:p-6 md:p-10 dark:bg-slate-950 dark:text-slate-100">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-6 shadow-xl sm:p-9 dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-black/30">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} aria-label="Volver al inicio" className="flex w-full max-w-64 flex-col items-center gap-2 rounded-xl bg-white p-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-900">                            
                            <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />                            
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
