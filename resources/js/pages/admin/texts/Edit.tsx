import TextForm from './_form';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Text {
    id: number;
    name: string;
    date: string;
    gender: string;
    type: string[];
    print_view: string;
    image?: string;
    image_url?: string;
    gender_label?: string;
    print_view_label?: string;
    type_labels?: string;
    summary: string;
    content: string;
    publish: boolean;
}

interface Props {
    text: Text;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: '/admin/dashboard' },
    { title: 'Textos', href: '/admin/texts' },
    { title: 'Editar', href: '/admin/texts/edit' },
];

export default function Edit({ text }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Edit.tsx');
        console.log('Tiene edit_texts:', hasPermission('edit_texts'));
        
        if (!hasPermission('edit_texts')) {
            console.log('❌ Usuario sin permisos para editar textos - redirigiendo');
            toast.error('No tienes permisos para editar textos');
            router.visit('/admin/texts');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_texts')) {
        return null;
    }

    return (
        <TextForm
            text={text}
            isEdit={true}
            title="Editar Texto"
            description="Modifica la información del texto"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
