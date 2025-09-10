import { supabase } from "../supabase-client";

// OUR FALLBACK DATA SOURCE
export const products = [
  {
    id: 1,
    name: "VISIONE – 14JY DAYTONA Premium Appliance",
    price: 299.99,
    originalPrice: 374.99,
    image: "/mac.png",
    rating: 4,
    discount: 20,

    slug: "visione-14jy-daytona-premium-appliance",
    description:
      "VISIONE – 14JY DAYTONA Premium Appliance offers cutting-edge technology with premium build quality. Perfect for modern homes seeking efficiency and style.",
    short_description:
      "Premium appliance with advanced features and sleek design",
    sku: "VIS-14JY-DAY-001",
    brand: "VISIONE",
    stock_quantity: 25,
    is_active: true,
    is_featured: true,

    images: ["/mac.png", "/mac.png", "/mac.png"],

    colors: [
      { name: "Silver", value: "#C0C0C0" },
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
    ],

    sizes: ["Small", "Medium", "Large", "XL"],

    related_products: [2, 3, 4, 5],

    categories: {
      id: 1,
      name: "Home Appliances",
      slug: "home-appliances",
    },

    total_reviews: 89,
  },
  {
    id: 2,
    name: 'LG Smart Television 42"',
    price: 340.0,
    originalPrice: 450.0,
    image: "/mycamera.png",
    rating: 4,
    discount: 24,

    slug: "lg-smart-television-42",
    description:
      'LG Smart Television 42" with 4K resolution, HDR support, and smart features. Experience entertainment like never before with crystal clear picture quality.',
    short_description: "42-inch Smart TV with 4K resolution and HDR support",
    sku: "LG-TV-42-001",
    brand: "LG",
    stock_quantity: 15,
    is_active: true,
    is_featured: true,

    images: [
      "/mycamera.png",
      "/mycamera.png",
      "/mycamera.png",
      "/mycamera.png",
    ],

    colors: [
      { name: "Black", value: "#000000" },
      { name: "Silver", value: "#C0C0C0" },
    ],

    sizes: ['32"', '42"', '55"', '65"'],

    related_products: [1, 3, 4, 5],

    categories: {
      id: 2,
      name: "Electronics",
      slug: "electronics",
    },

    total_reviews: 50,
  },
  {
    id: 3,
    name: "Samsung Smart Watch Pro",
    price: 199.99,
    originalPrice: 249.99,
    image: "/myearpod.png",
    rating: 5,
    discount: 20,

    slug: "samsung-smart-watch-pro",
    description:
      "Advanced smartwatch with health monitoring and fitness tracking features.",
    short_description: "Smart watch with health monitoring",
    sku: "SAM-WATCH-PRO-001",
    brand: "Samsung",
    stock_quantity: 30,
    is_active: true,
    is_featured: false,

    images: ["/myearpod.png", "/myearpod.png"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Silver", value: "#C0C0C0" },
    ],
    sizes: ["Small", "Medium", "Large"],
    related_products: [1, 2, 4, 5],

    categories: {
      id: 2,
      name: "Electronics",
      slug: "electronics",
    },

    total_reviews: 75,
  },
  {
    id: 4,
    name: "Apple MacBook Air M2",
    price: 999.99,
    originalPrice: 1199.99,
    image: "/myrobot.png",
    rating: 5,
    discount: 17,

    slug: "apple-macbook-air-m2",
    description:
      "Latest MacBook Air with M2 chip for ultimate performance and portability.",
    short_description: "MacBook Air with M2 chip",
    sku: "APPLE-MBA-M2-001",
    brand: "Apple",
    stock_quantity: 8,
    is_active: true,
    is_featured: true,

    images: ["/myrobot.png", "/myrobot.png"],
    colors: [
      { name: "Space Gray", value: "#36454F" },
      { name: "Silver", value: "#C0C0C0" },
      { name: "Gold", value: "#FFD700" },
    ],
    sizes: ['13"', '15"'],
    related_products: [1, 2, 3, 5],

    categories: {
      id: 2,
      name: "Electronics",
      slug: "electronics",
    },

    total_reviews: 120,
  },
  {
    id: 5,
    name: "Sony Wireless Headphones",
    price: 149.99,
    originalPrice: 199.99,
    image: "/myheadset.png",
    rating: 4,
    discount: 25,

    slug: "sony-wireless-headphones",
    description:
      "Premium wireless headphones with noise cancellation and superior sound quality.",
    short_description: "Wireless headphones with noise cancellation",
    sku: "SONY-WH-NC-001",
    brand: "Sony",
    stock_quantity: 50,
    is_active: true,
    is_featured: false,

    images: ["/myheadset.png", "/myheadset.png"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
      { name: "Blue", value: "#0066CC" },
    ],
    sizes: ["One Size"],
    related_products: [1, 2, 3, 4],

    categories: {
      id: 2,
      name: "Electronics",
      slug: "electronics",
    },

    total_reviews: 95,
  },
];

export const recentlyAddedProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true) // Only active products
      .order("created_at", { ascending: false }) // Most recent first
      .limit(5); // Always limit to 3

    if (error) throw error;

    // Map data to match the structure used in ProductCard
    return data.map((product) => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      originalPrice: product.originalprice
        ? parseFloat(product.originalprice)
        : null,
      discount: product.discount || null,
      rating: product.rating || 0,
      reviewCount: product.total_reviews || 0,
      images: product.images || [],
      stock: product.stock_quantity || 0,
    }));
  } catch (err) {
    console.error("Error fetching recently added products:", err);
    return [];
  }
};

export async function getProductById(id) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const product = products.find((p) => p.id === parseInt(id));

  return product || null;
}

export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return [];
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    return [];
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getProductsByCategory:", err);
    return [];
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching products:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in searchProducts:", err);
    return [];
  }
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("is_featured", false)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getFeaturedProducts:", err);
    return [];
  }
};

// Get product by slug
export const getProductBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in getProductBySlug:", err);
    return null;
  }
};

// Get related products
export const getRelatedProducts = async (productId, categoryId, limit = 4) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          description
        )
      `
      )
      .eq("category_id", categoryId)
      .neq("id", productId)
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getRelatedProducts:", err);
    return [];
  }
};

// // Get a single product by ID
// export const getProductById = async (id) => {
//   try {
//     // Add small delay to simulate loading (as in your example)
//     await new Promise(resolve => setTimeout(resolve, 100))

//     const { data, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         categories (
//           id,
//           name,
//           slug
//         )
//       `)
//       .eq('id', id)
//       .single()

//     if (error) {
//       console.error('Error fetching product by ID:', error)
//       return null
//     }

//     return data || null
//   } catch (err) {
//     console.error('Error in getProductById:', err)
//     return null
//   }
// }

// export const getFeaturedProducts = async () => {
//   try {
//     const { data, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         categories (
//           id,
//           name,
//           slug
//         )
//       `)
//       .eq('is_featured', true)
//       .eq('is_active', true)
//       .order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching featured products:', error)
//       return []
//     }

//     return data || []
//   } catch (err) {
//     console.error('Error in getFeaturedProducts:', err)
//     return []
//   }
// }

// export const getProductsByCategory = async (categoryId) => {
//   try {
//     const { data, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         categories (
//           id,
//           name,
//           slug
//         )
//       `)
//       .eq('category_id', categoryId)
//       .eq('is_active', true)
//       .order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching products by category:', error)
//       return []
//     }

//     return data || []
//   } catch (err) {
//     console.error('Error in getProductsByCategory:', err)
//     return []
//   }
// }

// // Search products by name or description
// export const searchProducts = async (searchTerm) => {
//   try {
//     const { data, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         categories (
//           id,
//           name,
//           slug
//         )
//       `)
//       .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
//       .eq('is_active', true)
//       .order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error searching products:', error)
//       return []
//     }

//     return data || []
//   } catch (err) {
//     console.error('Error in searchProducts:', err)
//     return []
//   }
// }
