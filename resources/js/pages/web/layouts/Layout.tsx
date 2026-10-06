import { ReactNode } from "react";

import "@/pages/web/styles/globals.css";
import Info from "@/pages/web/imports/Info";
import Header from "@/pages/web/components/Header";
import Footer from "@/pages/web/components/Footer";
import CartDrawer from "@/pages/web/components/CartDrawer";

import CategoriasMenuImport from "@/pages/web/imports/CategoriasMenu";


import { usePage } from "@inertiajs/react";
import { Cart, MenuItem } from "@/types/models";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  const { cart } = usePage<{ cart: Cart }>().props;
  const { menu } = usePage<{ menu: MenuItem[] }>().props;
  
  return (
    <div className="storefront flex flex-col justify-center">      
      <Info />    
      
      <Header cart={cart} />
      
      <CategoriasMenuImport 
        menu={menu}/>
      
        {children}
      
      {/* Footer */}
      <Footer />

      {/* Carrito v1: botón flotante + panel lateral (amplía a /carrito) */}
      <CartDrawer />
    </div>
  );
}
