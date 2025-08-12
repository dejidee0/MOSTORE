"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import BlogPostDetail from "@/components/shared/blog/BlogDetailComponent";

export default function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          id, title, slug, content, excerpt, featured_image,
          likes_count, comments_count, read_time, published_at,
          category:blog_categories(id, name, slug)
        `
        )
        .eq("id", id)
        .single();
      if (!error) setPost(data);
    };
    fetchPost();
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return <BlogPostDetail post={post} />;
}
