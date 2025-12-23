// app/blog/[slug]/page.jsx
import { Suspense } from "react";
import { supabase } from "@/lib/supabase-client";
import BlogPostDetail from "@/components/shared/blog/BlogDetailComponent";
import { notFound } from "next/navigation";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params; // Await params

  try {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        read_time,
        blog_categories (
          name
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return {
        title: "Post Not Found",
        description: "The blog post you're looking for doesn't exist.",
      };
    }

    const metaTitle = `${post.title} | MOSTORE Blog`;
    const metaDescription = post.excerpt || `Read ${post.title} on our blog.`;
    const metaImage = post.featured_image || "/default-og-image.jpg";
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;
    const publishedTime = new Date(post.published_at).toISOString();

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: post.blog_categories?.name
        ? [post.blog_categories.name, "blog", "article", "MOSTORE"]
        : ["blog", "article", "MOSTORE"],
      authors: [{ name: "Admin" }],
      creator: "MOSTORE",
      publisher: "MOSTORE",
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        title: post.title,
        description: metaDescription,
        url: url,
        siteName: "MOSTORE Blog",
        images: [
          {
            url: metaImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: "en_US",
        type: "article",
        publishedTime: publishedTime,
        modifiedTime: publishedTime,
        section: post.blog_categories?.name || "Blog",
        tags: post.blog_categories?.name ? [post.blog_categories.name] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: metaDescription,
        images: [metaImage],
        creator: "@mostore",
        site: "@mostore",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error Loading Post",
      description: "There was an error loading this blog post.",
    };
  }
}

// Server Component
async function getPost(slug) {
  try {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        images,
        likes_count,
        comments_count,
        views_count,
        read_time,
        published_at,
        created_at,
        blog_categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;

    // Increment view count
    if (post) {
      await supabase.rpc("increment_post_views", { post_id: post.id });
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params; // Await params
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Generate JSON-LD structured data for rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featured_image || "/default-og-image.jpg",
    datePublished: new Date(post.published_at).toISOString(),
    dateModified: new Date(post.published_at).toISOString(),
    author: {
      "@type": "Person",
      name: "Admin",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MOSTORE",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.blog_categories?.name || "Blog",
    wordCount: post.content?.length || 0,
    timeRequired: `PT${post.read_time || 5}M`,
    inLanguage: "en-US",
    articleBody: post.excerpt,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Content */}
      <BlogPostDetail post={post} />
    </>
  );
}

// Generate static params for static generation (optional but recommended)
export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published")
      .limit(100);

    return (
      posts?.map((post) => ({
        slug: post.slug,
      })) || []
    );
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
