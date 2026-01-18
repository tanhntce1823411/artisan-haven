import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  images: string[];
  artisan: string | null;
  origin: string | null;
  materials: string[];
  stock: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

export const useProducts = (options?: {
  categorySlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products' as any)
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      if (options?.bestseller) {
        query = query.eq('is_bestseller', true);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Product[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products' as any)
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Product | null;
    },
    enabled: !!slug,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      return data as unknown as Category[];
    },
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories' as any)
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Category | null;
    },
    enabled: !!slug,
  });
};
