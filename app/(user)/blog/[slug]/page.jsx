"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import BlogPostDetail from "@/components/shared/blog/BlogDetailComponent";

export default function BlogDetailPage() {
  const { slug } = useParams(); // Changed from id to slug for SEO
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch post by slug and include images
        const { data, error: fetchError } = await supabase
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

        if (fetchError) throw fetchError;

        if (data) {
          setPost(data);

          // Increment view count
          await supabase.rpc("increment_post_views", { post_id: data.id });
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Post
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/blog"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/blog"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return <BlogPostDetail post={post} />;
}
