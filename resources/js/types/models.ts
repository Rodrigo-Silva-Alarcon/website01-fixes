/**
 * Interfaces para modelos de datos (entidades principales)
 * Estas interfaces representan los modelos de la base de datos
 */

export interface User {
    id: number;
    name: string;
    last_name?: string;
    last2_name?: string;
    email: string;
    alias: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions?: Permission[];
    users?: User[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    sector: string;
    sector_label: string;
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

export interface Category{
    id: number;
    name: string;
    slug:string;
    icon:string;
    image:string;
    image_url: string;
    image_thumbs_url:string;
    summary: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    subcategories: Subcategory[]; 
    products: Product[]; 
}

export interface Subcategory{
    id:number;
    category_id: number;
    name: string;
    slug: string;
    summary: string;    
    icon: string;
    image:string;
    image_url: string;
    image_thumbs_url:string;
    active: boolean;
    created_at: string;
    updated_at: string;
    categories: Category[];
    category_label:string;
    category_slug:string;
}
        
export interface Product{
    id: number;
    category_id: number; 
    subcategory_id: number;
    brand_id: number;
    name: string;
    slug:string;
    image: string;
    summary: string; 
    general_info: string; 
    description: string;
    tecnical_info: string;
    tecnical_image: string;
    video_type: number;
    video_file: string;
    video_url: string; 
    video_iframe: string; 
    active: boolean;
    featured: boolean;
    pop: boolean;
    created_at: string;
    updated_at: string;
    image_url: string; // contiene la direccion de la image
    tecnical_image_url: string; //. contiene la direccion la imagen de ficha tecnica
    video_file_url:string; //. continene la direccion del video
    images:Image[]; // array de imagenes
    inventory:Inventory;
    category:Category;
    brand: Brand;
    subcategory:Subcategory;
    category_label:string;
    category_slug:string
    subcategory_label:string;
    subcategory_slug:string;
    brand_label:string;
    inventories:Inventory[];
}

export interface Banner{
    id: number;
    name: string;
    image: string;
    type: string;
    url: string;
    product_id: number;
    page_id: number;
    summary: string;
    active:boolean;
    sw_title:boolean;
    created_at: string;
    pages: string[];
    image_url: string; // contiene la direccion de la image
    image_url_thumbs: string;
}
export interface Image{
    id: number;
    name: string;
    original_name: string;
    image_url:string;
    image_thumbs_url:string;
}

export interface Inventory{
    id: number;
    product_id: number;
    amount: number;
    offer_amount:number;
    ini:string;
    fin:string;
    stock: number;
    money: string;
    created_at: string;
    updated_at: string;
    product?: Product;
}

export interface Brand{
    id:number;
    name: string;
    image: string;
    image_url: string;
    active: boolean;
}

export interface MenuItem{
  id: string;
  name: string;
  icon: string;
  submenu: MenuItem[];
}

export interface PagePropsMessage {
  flash: {
    status?: string
    success?: string
    error?: string
  }
}

export interface Cart{
    id:number;
    user_id:number;
    cart_session:string;
    cart_items:CartItem[]
}

export interface CartItem{
    id:number;
    card_id:number;
    product_id:number;
    name:string;
    image:string;
    image_url:string;
    image_url_thumbs:string;
    unit_price:number;
    amount:number;
    sub_total:number;
    product:Product;
    money:string;
}