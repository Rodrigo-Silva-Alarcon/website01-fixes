import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Image, FileText, Edit, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Text {
    id: number;
    name: string;
    date: string;
    gender: string;
    gender_label: string;
    type: string[];
    type_labels: string;
    print_view: string;
    print_view_label: string;
    image: string | null;
    image_url: string | null;
    summary: string | null;
    content: string | null;
    publish: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    text: Text;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: '/admin/dashboard' },
    { title: 'Textos', href: '/admin/texts' },
    { title: 'Ver', href: '/admin/texts/show' },
];

export default function Show({ text }: Props) {
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Show.tsx');
        console.log('Tiene show_texts:', hasPermission('show_texts'));
        
        if (!hasPermission('show_texts')) {
            console.log('❌ Usuario sin permisos para ver textos - redirigiendo');
            toast.error('No tienes permisos para ver textos');
            router.visit('/admin/texts');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('show_texts')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Texto: ${text.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/texts">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Texto</CardTitle>
                                    <CardDescription>
                                        Información completa del texto {text.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_texts') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/texts/${text.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                    {/* Información General */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>Detalles básicos del texto</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                    <p className="text-sm">{text.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm">{new Date(text.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Género</label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{text.gender_label}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Vista de Impresión</label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{text.print_view_label}</Badge>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {text.type.map((type, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {type === 'report' ? 'Reporte' : 
                                             type === 'article' ? 'Artículo' : 'Noticia'}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Estado de Publicación</label>
                                <div className="mt-1">
                                    <Badge variant={text.publish ? "default" : "secondary"}>
                                        {text.publish ? 'Publicado' : 'No Publicado'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Imagen */}
                    {text.image_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5" />
                                    Imagen
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full max-w-md">
                                    <img
                                        src={text.image_url}
                                        alt={text.name}
                                        className="w-full h-auto rounded-lg border"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Resumen */}
                    {text.summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Resumen
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed">{text.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Contenido */}
                    {text.content && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contenido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div 
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: text.content }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Metadatos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadatos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="font-medium text-muted-foreground">Creado</label>
                                    <p>{new Date(text.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="font-medium text-muted-foreground">Última actualización</label>
                                    <p>{new Date(text.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


