// Client-safe catalog types. Declared here (with NO server imports) so both the
// server repository (src/data/store.ts) and browser components can share them —
// importing a *value* from store.ts into a client bundle would drag in Prisma.

export interface Brand { id: string; slug: string; name: string; }
export interface Category { id: string; slug: string; name: string; description?: string; parentId?: string; }
export interface Review { id: string; productId: string; rating: number; author: string; body: string; }
export interface Gemstone { type: string; caratWeight?: number; cut?: string; clarity?: string; count?: number; }
export interface Certification { body: string; number?: string; }

export interface Product {
  id: string; slug: string; name: string; description: string;
  priceInPaise: number; mrpInPaise?: number; currency: string;
  inStock: boolean; stockUnits?: number; color?: string; imageUrl?: string;
  categoryId: string; brandId?: string;
  rating?: number; reviewCount?: number; sizes?: string[];
  metal?: string; purity?: string; grossWeightG?: number;
  gemstones?: Gemstone[]; certifications?: Certification[];
  collectionLine?: string; gender?: string; tags?: string[];
}

export interface CollectionFilter { categorySlug?: string; brandSlug?: string; color?: string; maxPriceInPaise?: number; }
export interface Collection { id: string; slug: string; title: string; intro?: string; filter: CollectionFilter; }

export interface CategoryWithRelations extends Category { parent?: Category; children: Category[]; }
export interface ProductWithRelations extends Product { category: Category; brand?: Brand; reviews: Review[]; }
