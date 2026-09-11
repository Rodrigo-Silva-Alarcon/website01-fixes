import { ReactNode } from "react";

import "@/pages/web/styles/globals.css";
import Info from "@/pages/web/imports/Info";
import Header from "@/pages/web/components/Header";
import Footer from "@/pages/web/components/Footer";

import CategoriasMenuImport from "@/pages/web/imports/CategoriasMenu";


import { usePage } from "@inertiajs/react";
import { Cart, Product, MenuItem } from "@/types/models";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  const { populares } = usePage<{ populares: Product[] }>().props;
  const { cart } = usePage<{ cart: Cart }>().props;
  const { menu } = usePage<{ menu: MenuItem[] }>().props;
  
  return (
    <div className="storefront flex flex-col justify-center">      
      <Info />    
      
      <Header 
        populares={populares}
        cart={cart}
        />
      
      <CategoriasMenuImport 
        menu={menu}/>
      
        {children}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
