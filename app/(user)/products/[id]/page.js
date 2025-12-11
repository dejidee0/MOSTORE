import { Suspense } from "react";
import { supabase } from "@/lib/supabase-client";
import ProductDetailsClient from "./client";

// Generate metadata dynamically
export async function generateMetadata({ params }) {
  // Await params in Next.js 15+
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, images, price, brand, categories(name)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) {
    // Try fetching by slug
    const { data: productBySlug } = await supabase
      .from("products")
      .select("name, short_description, images, price, brand, categories(name)")
      .eq("slug", id)
      .eq("is_active", true)
      .single();

    if (productBySlug) {
      return {
        title: `${productBySlug.name} | Mostore`,
        description:
          productBySlug.short_description ||
          `Buy ${productBySlug.name} at the best price`,
        openGraph: {
          title: productBySlug.name,
          description: productBySlug.short_description,
          images: productBySlug.images?.[0]
            ? [{ url: productBySlug.images[0] }]
            : [],
          type: "website",
          siteName: "Mostore",
        },
        twitter: {
          card: "summary_large_image",
          title: productBySlug.name,
          description: productBySlug.short_description,
          images: productBySlug.images?.[0] ? [productBySlug.images[0]] : [],
        },
      };
    }

    return {
      title: "Product Not Found | Mostore",
      description: "The product you are looking for could not be found.",
    };
  }

  return {
    title: `${product.name} | Mostore`,
    description:
      product.short_description || `Buy ${product.name} at the best price`,
    keywords: [
      product.name,
      product.brand,
      product.categories?.name,
      "buy online",
      "e-commerce",
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      type: "website",
      siteName: "Mostore",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.short_description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    // Add structured data for SEO
    other: {
      "product:price:amount": product.price?.toString(),
      "product:price:currency": "EUR",
    },
  };
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
