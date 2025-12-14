import { Suspense } from "react";
import { supabase } from "@/lib/supabase-client";
import ProductDetailsClient from "./client";

// Calculate price range for products with variants
function calculatePriceRange(product) {
  if (!product) return { min: 0, max: 0 };

  const basePrice = parseFloat(product.price) || 0;
  let minPrice = basePrice;
  let maxPrice = basePrice;

  // Helper function to get min/max adjustments from variant array
  const getAdjustmentRange = (variants) => {
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return { min: 0, max: 0 };
    }
    const adjustments = variants.map((v) => parseFloat(v.priceAdjustment) || 0);
    return {
      min: Math.min(...adjustments, 0),
      max: Math.max(...adjustments, 0),
    };
  };

  // Get adjustment ranges for each variant type
  const colorRange = getAdjustmentRange(product.color_variants);
  const sizeRange = getAdjustmentRange(product.size_variants);
  const storageRange = getAdjustmentRange(product.storage_options);
  const memoryRange = getAdjustmentRange(product.memory_options);
  const simRange = getAdjustmentRange(product.sim_types);

  // Calculate minimum price (base + all minimum adjustments)
  minPrice =
    basePrice +
    colorRange.min +
    sizeRange.min +
    storageRange.min +
    memoryRange.min +
    simRange.min;

  // Calculate maximum price (base + all maximum adjustments)
  maxPrice =
    basePrice +
    colorRange.max +
    sizeRange.max +
    storageRange.max +
    memoryRange.max +
    simRange.max;

  return {
    min: Math.max(0, minPrice), // Ensure non-negative
    max: Math.max(0, maxPrice),
  };
}

// Generate metadata dynamically
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const { id } = await params;

  // Fetch product with variant data for accurate pricing metadata
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      name, 
      short_description, 
      description,
      images, 
      price, 
      originalprice,
      discount,
      brand, 
      condition,
      stock_quantity,
      color_variants,
      size_variants,
      storage_options,
      memory_options,
      sim_types,
      categories(name)
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) {
    // Try fetching by slug
    const { data: productBySlug } = await supabase
      .from("products")
      .select(
        `
        name, 
        short_description, 
        description,
        images, 
        price, 
        originalprice,
        discount,
        brand, 
        condition,
        stock_quantity,
        color_variants,
        size_variants,
        storage_options,
        memory_options,
        sim_types,
        categories(name)
      `
      )
      .eq("slug", id)
      .eq("is_active", true)
      .single();

    if (productBySlug) {
      const priceRange = calculatePriceRange(productBySlug);
      const displayPrice =
        priceRange.min === priceRange.max
          ? `€${priceRange.min.toFixed(2)}`
          : `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`;

      // Build variant description for meta description
      const variantInfo = [];
      if (productBySlug.color_variants?.length > 0) {
        variantInfo.push(`${productBySlug.color_variants.length} colors`);
      }
      if (productBySlug.storage_options?.length > 0) {
        const storages = productBySlug.storage_options
          .map((s) => s.value)
          .join(", ");
        variantInfo.push(`Storage: ${storages}`);
      }

      const metaDescription =
        productBySlug.short_description ||
        `Buy ${productBySlug.name} at ${displayPrice}. ${variantInfo.join(
          " • "
        )}. ${productBySlug.condition === "new" ? "Brand new" : "Pre-owned"} ${
          productBySlug.brand ? `${productBySlug.brand}` : ""
        } product. ${
          productBySlug.stock_quantity > 0 ? "In stock" : "Out of stock"
        }.`;

      return {
        title: `${productBySlug.name} | Mostore`,
        description: metaDescription.slice(0, 160), // SEO optimal length
        keywords: [
          productBySlug.name,
          productBySlug.brand,
          productBySlug.categories?.name,
          productBySlug.condition,
          "buy online",
          "e-commerce",
          "Mostore",
          ...(productBySlug.color_variants?.map((c) => c.name) || []),
        ]
          .filter(Boolean)
          .join(", "),
        openGraph: {
          title: productBySlug.name,
          description: metaDescription.slice(0, 160),
          images: productBySlug.images?.[0]
            ? [
                {
                  url: productBySlug.images[0],
                  alt: productBySlug.name,
                },
              ]
            : [],
          type: "website",
          siteName: "Mostore",
          locale: "en_EU",
        },
        twitter: {
          card: "summary_large_image",
          title: productBySlug.name,
          description: metaDescription.slice(0, 160),
          images: productBySlug.images?.[0] ? [productBySlug.images[0]] : [],
        },
        // Enhanced structured data for SEO
        other: {
          "product:price:amount": priceRange.min.toString(),
          "product:price:currency": "EUR",
          "product:availability":
            productBySlug.stock_quantity > 0 ? "in stock" : "out of stock",
          "product:condition": productBySlug.condition,
          "product:brand": productBySlug.brand || "Generic",
        },
      };
    }

    return {
      title: "Product Not Found | Mostore",
      description: "The product you are looking for could not be found.",
    };
  }

  // Calculate price range including all variant adjustments
  const priceRange = calculatePriceRange(product);
  const displayPrice =
    priceRange.min === priceRange.max
      ? `€${priceRange.min.toFixed(2)}`
      : `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`;

  // Build comprehensive variant information for meta description
  const variantInfo = [];
  if (product.color_variants?.length > 0) {
    variantInfo.push(`${product.color_variants.length} colors available`);
  }
  if (product.size_variants?.length > 0) {
    variantInfo.push(`${product.size_variants.length} sizes`);
  }
  if (product.storage_options?.length > 0) {
    const storages = product.storage_options.map((s) => s.value).join(", ");
    variantInfo.push(`Storage: ${storages}`);
  }
  if (product.memory_options?.length > 0) {
    const memories = product.memory_options.map((m) => m.value).join(", ");
    variantInfo.push(`Memory: ${memories}`);
  }

  const metaDescription =
    product.short_description ||
    `Buy ${product.name} starting at ${displayPrice}. ${variantInfo.join(
      " • "
    )}. ${product.condition === "new" ? "Brand new" : "Pre-owned"} ${
      product.brand ? `${product.brand}` : ""
    } product. ${
      product.stock_quantity > 0
        ? "In stock and ready to ship"
        : "Currently out of stock"
    }.`;

  return {
    title: `${product.name} | Mostore`,
    description: metaDescription.slice(0, 160), // SEO optimal length
    keywords: [
      product.name,
      product.brand,
      product.categories?.name,
      product.condition,
      "buy online",
      "e-commerce",
      "Mostore",
      ...(product.color_variants?.map((c) => c.name) || []),
      ...(product.storage_options?.map((s) => s.value) || []),
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: product.name,
      description: metaDescription.slice(0, 160),
      images: product.images?.[0]
        ? [
            {
              url: product.images[0],
              alt: product.name,
              width: 800,
              height: 600,
            },
          ]
        : [],
      type: "website",
      siteName: "Mostore",
      locale: "en_EU",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: metaDescription.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
      creator: "@mostore",
    },
    // Enhanced structured data for rich snippets
    other: {
      "product:price:amount": priceRange.min.toString(),
      "product:price:currency": "EUR",
      "product:availability":
        product.stock_quantity > 0 ? "in stock" : "out of stock",
      "product:condition": product.condition,
      "product:brand": product.brand || "Generic",
      "og:price:standard_amount": priceRange.min.toString(),
      "og:price:currency": "EUR",
    },
    // Add JSON-LD structured data
    alternates: {
      canonical: `/product/${id}`,
    },
  };
}

// Optional: Generate static params for popular products (for static generation)
export async function generateStaticParams() {
  // Fetch top 100 most popular or featured products for static generation
  const { data: products } = await supabase
    .from("products")
    .select("id, slug")
    .eq("is_active", true)
    .or("is_featured.eq.true,stock_quantity.gt.0")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!products) return [];

  // Return both ID and slug based paths
  return products.flatMap((product) => [
    { id: product.id.toString() },
    { id: product.slug },
  ]);
}

export default async function ProductPage({ params }) {
  // Await params in Next.js 15+
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <ProductDetailsClient productId={id} />
    </Suspense>
  );
}

// Add revalidation for ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
