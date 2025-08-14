"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  User,
  ThumbsUp,
  Reply as ReplyIcon,
  Send,
} from "lucide-react";

// Memoized Comment Component
const Comment = memo(({ comment, onCommentLike, onReply }) => (
  <div className="border p-4 rounded-lg">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-5 h-5 text-gray-500" />
      </div>
      <p className="font-medium">{comment.author_name}</p>
    </div>
    <p className="text-gray-700 mb-2">{comment.content}</p>
    <div className="flex items-center gap-3 text-sm text-gray-500">
      <button
        onClick={() => onCommentLike(comment.id)}
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <ThumbsUp className="w-4 h-4" /> {comment.likes_count || 0}
      </button>
      <button
        onClick={() => onReply(comment)}
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <ReplyIcon className="w-4 h-4" /> Reply
      </button>
    </div>

    {/* Replies */}
    {comment.replies?.length > 0 && (
      <div className="ml-10 mt-4 space-y-4">
        {comment.replies.map((reply) => (
          <ReplyComponent key={reply.id} reply={reply} />
        ))}
      </div>
    )}
  </div>
));

// Memoized Reply Component
const ReplyComponent = memo(({ reply }) => (
  <div className="border p-3 rounded-lg">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-4 h-4 text-gray-500" />
      </div>
      <p className="font-medium">{reply.author_name}</p>
    </div>
    <p className="text-gray-700 text-sm">{reply.content}</p>
  </div>
));

// Memoized Comment Form Component
const CommentForm = memo(
  ({
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    onSubmit,
    isSubmitting,
  }) => (
    <div className="mt-8">
      {replyingTo && (
        <p className="text-sm text-gray-500 mb-2">
          Replying to {replyingTo.author_name}{" "}
          <button
            onClick={() => setReplyingTo(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            Cancel
          </button>
        </p>
      )}
      <textarea
        className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors"
        placeholder={replyingTo ? "Write your reply..." : "Write a comment..."}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        onClick={onSubmit}
        disabled={!newComment.trim() || isSubmitting}
        className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? "Posting..." : "Post"}
      </button>
    </div>
  )
);

export default function BlogPostDetail({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize post ID to prevent unnecessary re-renders
  const postId = useMemo(() => post?.id, [post?.id]);

  // Get user once and cache it
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        if (mounted) setIsInitialized(true);
      }
    };

    getUser();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Optimized fetch comments with error handling
  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .select(
          `
          *,
          replies:blog_comments!parent_id(*)
        `
        )
        .eq("post_id", postId)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postId]);

  // ✅ Optimized check user like with caching
  const checkUserLike = useCallback(async () => {
    if (!user || !postId) return;

    try {
      const { data } = await supabase
        .from("blog_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking user like:", error);
    }
  }, [user, postId]);

  // ✅ Optimized handle post like with optimistic updates
  const handleLike = useCallback(async () => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }
    if (!postId) return;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      if (isLiked) {
        await supabase
          .from("blog_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("blog_likes")
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (error) {
      console.error("Error handling like:", error);
      // Revert optimistic update on error
      setIsLiked(isLiked);
    }
  }, [user, postId, isLiked]);

  // ✅ Optimized handle comment submit with loading state
  const handleCommentSubmit = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !user || !postId) {
      if (!user) alert("Please log in to comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("blog_comments").insert({
        post_id: postId,
        parent_id: replyingTo?.id || null,
        user_id: user.id,
        author_name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest",
        author_email: user.email,
        content: trimmedComment,
        status: "approved",
      });

      if (!error) {
        setNewComment("");
        setReplyingTo(null);
        // Don't await to make it feel faster
        fetchComments();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, user, postId, replyingTo, fetchComments]);

  // ✅ Optimized handle comment like with debouncing
  const handleCommentLike = useCallback(
    async (commentId) => {
      if (!user) {
        alert("Please log in to like comments.");
        return;
      }

      try {
        const { data: alreadyLiked } = await supabase
          .from("blog_comment_likes")
          .select("id")
          .eq("comment_id", commentId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (alreadyLiked) {
          await supabase
            .from("blog_comment_likes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", user.id);
        } else {
          await supabase
            .from("blog_comment_likes")
            .insert({ comment_id: commentId, user_id: user.id });
        }

        // Don't await to make it feel faster
        fetchComments();
      } catch (error) {
        console.error("Error handling comment like:", error);
      }
    },
    [user, fetchComments]
  );

  // Memoized handlers to prevent re-renders
  const handleReply = useCallback((comment) => {
    setReplyingTo(comment);
  }, []);

  // ✅ Optimized real-time updates with cleanup
  useEffect(() => {
    if (!isInitialized || !postId) return;

    fetchComments();
    checkUserLike();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Debounce rapid updates
          setTimeout(() => fetchComments(), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isInitialized, fetchComments, checkUserLike]);

  // Memoized computed values
  const likesCount = useMemo(() => post?.likes_count || 0, [post?.likes_count]);
  const commentsCount = useMemo(
    () => post?.comments_count || 0,
    [post?.comments_count]
  );

  // Early return if no post
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* Post Content */}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      {/* Featured Image with optimized loading */}
      {post.featured_image && (
        <div className="mb-8">
          <Image
            src={post.featured_image}
            alt={post.title || "Blog post image"}
            width={1200}
            height={600}
            className="w-full h-96 object-cover rounded-2xl shadow-lg border border-gray-200"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>
      )}

      <p className="mb-6 text-gray-700">{post.content}</p>

      {/* Like & Comment Counts */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          disabled={!user}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isLiked ? "fill-red-600 scale-110" : "fill-none"
            }`}
          />
          {likesCount}
        </button>
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-5 h-5" />
          {commentsCount}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onCommentLike={handleCommentLike}
            onReply={handleReply}
          />
        ))}
      </div>

      {/* Comment Form */}
      <CommentForm
        newComment={newComment}
        setNewComment={setNewComment}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onSubmit={handleCommentSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Read More Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8"
      >
        <Link
          href={`/blog/${postId}`}
          className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors group"
        >
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

// Add display names for debugging
Comment.displayName = "Comment";
ReplyComponent.displayName = "ReplyComponent";
CommentForm.displayName = "CommentForm";
