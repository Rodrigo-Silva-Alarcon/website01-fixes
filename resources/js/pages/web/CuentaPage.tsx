import { usePage } from "@inertiajs/react";
import { Product, Cart } from "@/types/models";
import Info from "@/pages/web/imports/Info";
import Header from "@/pages/web/components/Header";
import Footer from "@/pages/web/components/Footer";
import { Heart, User, Package, Settings, LogOut } from "lucide-react";

export default function CuentaPage() {
  const { props: shared } = usePage<{ populares: Product[]; cart: Cart }>();
  const pedidos = [
    { id: "ORD-001", fecha: "2025-10-25", total: 249.99, estado: "Entregado" },
    { id: "ORD-002", fecha: "2025-10-20", total: 149.99, estado: "En tránsito" },
    { id: "ORD-003", fecha: "2025-10-15", total: 89.99, estado: "Entregado" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Info Banner */}
      <div className="h-[40px]">
        <Info />
      </div>

      {/* Header */}
      <div className="h-[82px] md:h-[82.635px]">
        <Header populares={shared.populares} cart={shared.cart} />
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="mb-8">Mi Cuenta</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-[#006696] text-white size-20 rounded-full flex items-center justify-center mb-4">
                    <User className="size-10" />
                  </div>
                  <h3>Juan Pérez</h3>
                  <p className="text-gray-600">juan@email.com</p>
                </div>

                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#006696] text-white rounded-lg">
                    <Package className="size-5" />
                    Mis Pedidos
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
                    <Heart className="size-5" />
                    Favoritos
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="size-5" />
                    Configuración
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-red-600 rounded-lg transition-colors">
                    <LogOut className="size-5" />
                    Cerrar Sesión
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-[#006696] size-12 rounded-lg flex items-center justify-center">
                      <Package className="size-6" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Pedidos</p>
                      <p className="text-[#006696]">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-600 size-12 rounded-lg flex items-center justify-center">
                      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Completados</p>
                      <p className="text-[#006696]">10</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 text-orange-600 size-12 rounded-lg flex items-center justify-center">
                      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">En Proceso</p>
                      <p className="text-[#006696]">2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2>Mis Pedidos Recientes</h2>
                </div>

                <div className="divide-y">
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-gray-600 mb-1">Pedido #{pedido.id}</p>
                          <p className="text-sm text-gray-500">{pedido.fecha}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-gray-600 mb-1">Total</p>
                          <p className="text-[#006696]">${pedido.total}</p>
                        </div>

                        <div>
                          <span className={`px-4 py-2 rounded-full text-sm ${
                            pedido.estado === "Entregado" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {pedido.estado}
                          </span>
                        </div>

                        <button className="px-6 py-2 border border-[#006696] text-[#006696] rounded-lg hover:bg-[#006696] hover:text-white transition-colors">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t bg-gray-50">
                  <button className="text-[#006696] hover:underline">
                    Ver todos los pedidos →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
