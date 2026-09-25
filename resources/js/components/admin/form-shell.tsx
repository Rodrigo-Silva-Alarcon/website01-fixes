import { useEffect, useState, type FormEventHandler, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, X } from 'lucide-react';

/**
 * Toasts de éxito/error del servidor y de validación, idénticos en todos los
 * formularios del admin (antes duplicados en cada _form).
 */
export function useFormAlerts(success?: string, error?: string, errors: Record<string, unknown> = {}) {
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error('Por favor corrige los errores en el formulario');
        }
    }, [errors]);
}

interface FormShellProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    description: string;
    backHref: string;
    submitLabel: string;
    processing: boolean;
    onSubmit: FormEventHandler;
    children: ReactNode;
    /** Contenido opcional tras el </form> dentro de la card (p. ej. un modal). */
    after?: ReactNode;
}

/**
 * Shell común de los formularios _form: AppLayout + Card con botón de regreso,
 * título/descripción, <form> y botón de envío.
 */
export function FormShell({ breadcrumbs, title, description, backHref, submitLabel, processing, onSubmit, children, after }: FormShellProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={backHref}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="grid">
                                <CardTitle className="text-xl font-medium">{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            {children}
                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>{submitLabel}</Button>
                            </div>
                        </form>
                        {after}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

interface FieldProps {
    label: string;
    htmlFor?: string;
    error?: string;
    className?: string;
    children: ReactNode;
}

/** Campo genérico: Label + control + mensaje de error de validación. */
export function Field({ label, htmlFor, error, className = 'grid gap-2', children }: FieldProps) {
    return (
        <div className={className}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

interface CheckboxFieldProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
}

/** Checkbox con etiqueta y error (Publicar, Mostrar Título/Descripción, etc.). */
export function CheckboxField({ id, label, checked, onCheckedChange, error }: CheckboxFieldProps) {
    return (
        <>
            <div className="flex items-center space-x-2">
                <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
                <Label htmlFor={id}>{label}</Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </>
    );
}

interface ImageUploadFieldProps {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    existingUrl?: string | null;
    deleteImage: boolean;
    onFileChange: (file: File | null) => void;
    onDeleteImageChange: (deleteImage: boolean) => void;
}

/**
 * Campo de subida de imagen con preview, validación de tipo/peso (2MB) y
 * marcado de eliminación de la imagen existente. Compartido por marcas,
 * categorías y banners (antes ~80 líneas copiadas en cada uno).
 */
export function ImageUploadField({ id, label, error, hint, existingUrl, deleteImage, onFileChange, onDeleteImageChange }: ImageUploadFieldProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (existingUrl && !preview) {
            setPreview(existingUrl);
        }
    }, [existingUrl, preview]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona un archivo de imagen válido');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 2MB');
            return;
        }

        onFileChange(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);

        if (deleteImage) {
            onDeleteImageChange(false);
        }
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="grid w-full max-w-sm items-center gap-3">
                <Input id={id} type="file" accept="image/*" onChange={handleChange} className={error ? 'border-red-500' : ''} />
            </div>

            {preview && !deleteImage && (
                <div className="space-y-2">
                    <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteImageChange(true)}
                        className="text-red-600 hover:text-red-700"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Eliminar imagen
                    </Button>
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
    );
}
