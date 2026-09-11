import { toast } from 'sonner';
import { useEffect } from 'react';

export default function DebugToast() {
    useEffect(() => {
        // Test toast inmediatamente al cargar
        console.log('🔍 DebugToast: Iniciando test de toast...');
        
        setTimeout(() => {
            console.log('🔍 DebugToast: Enviando toast de prueba...');
            toast.success('Toast de prueba desde DebugToast');
        }, 1000);
        
        setTimeout(() => {
            console.log('🔍 DebugToast: Enviando segundo toast...');
            toast.error('Toast de error desde DebugToast');
        }, 2000);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Debug Toast</h1>
            <p className="mb-4">Esta página prueba los toasts. Deberías ver toasts aparecer automáticamente.</p>
            
            <div className="space-x-2">
                <button 
                    onClick={() => {
                        console.log('🔍 DebugToast: Botón success clickeado');
                        toast.success('Toast manual de éxito');
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Test Success Toast
                </button>
                
                <button 
                    onClick={() => {
                        console.log('🔍 DebugToast: Botón error clickeado');
                        toast.error('Toast manual de error');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Test Error Toast
                </button>
                
                <button 
                    onClick={() => {
                        console.log('🔍 DebugToast: Botón info clickeado');
                        toast.info('Toast manual de información');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Test Info Toast
                </button>
            </div>
        </div>
    );
}
