import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthLayout title="Iniciar sesión" description="Ingrese su correo electrónico y contraseña a continuación para iniciar sesión">
            <Head title="Iniciar sesión" />

            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    className="h-11 bg-white dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/25"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError id="email-error" message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="text-sm text-sky-700 decoration-sky-700/40 hover:text-sky-800 dark:text-sky-300 dark:decoration-sky-300/40 dark:hover:text-sky-200" tabIndex={5}>
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    className="h-11 bg-white dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/25"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Contraseña"
                                />
                                <InputError id="password-error" message={errors.password} />
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox className="dark:border-slate-500 dark:data-[state=checked]:border-sky-400 dark:data-[state=checked]:bg-sky-400 dark:data-[state=checked]:text-slate-950" id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember">Recuérdame</Label>
                            </div>
                            <Button type="submit" className="mt-2 h-11 w-full bg-sky-700 font-semibold text-white hover:bg-sky-800 focus-visible:ring-sky-500/50 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 dark:focus-visible:ring-sky-300/50" tabIndex={4} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Ingresar
                            </Button>
                        </div>

                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-700 dark:text-green-400">{status}</div>}
        </AuthLayout>
    );
}
