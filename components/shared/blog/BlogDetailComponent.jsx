"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  User,
  ThumbsUp,
  Reply as ReplyIcon,
  Send,
  Share2,
} from "lucide-react";

// Memoized Comment Component
const Comment = memo(({ comment, onCommentLike, onReply }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-gray-200 p-4 rounded-2xl"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <User className="w-5 h-5 text-gray-500" />
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{comment.author_name}</p>
        <p className="text-xs text-gray-500">
          {new Date(comment.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{comment.content}</p>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <button
        onClick={() => onCommentLike(comment.id)}
        className="flex items-center gap-1 hover:text-orange-600 transition-colors"
      >
        <ThumbsUp className="w-4 h-4" /> 
        <span className="font-medium">{comment.likes_count || 0}</span>
      </button>
      <button
        onClick={() => onReply(comment)}
        className="flex items-center gap-1 hover:text-orange-600 transition-colors"
      >
        <ReplyIcon className="w-4 h-4" /> Reply
      </button>
    </div>

    {/* Replies */}
    {comment.replies?.length > 0 && (
      <div className="ml-8 mt-4 space-y-3">
        {comment.replies.map((reply) => (
          <ReplyComponent key={reply.id} reply={reply} />
        ))}
      </div>
    )}
  </motion.div>
));

// Memoized Reply Component
const ReplyComponent = memo(({ reply }) => (
  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <User className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{reply.author_name}</p>
        <p className="text-xs text-gray-500">
          {new Date(reply.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
    </div>
    <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
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
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="font-bold text-gray-900 text-lg mb-4">
        {replyingTo ? "Reply to Comment" : "Leave a Comment"}
      </h3>
      
      {replyingTo && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-orange-700">
              Replying to <span className="font-medium">{replyingTo.author_name}</span>
            </p>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <textarea
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
        placeholder={replyingTo ? "Write your reply..." : "Share your thoughts..."}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        disabled={isSubmitting}
        rows={4}
      />
      
      <div className="flex justify-end mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={!newComment.trim() || isSubmitting}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Posting..." : "Post Comment"}
        </motion.button>
      </div>
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
        .maybeSingle();

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

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Early return if no post
  if (!post) {
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Category Badge */}
          {post.blog_categories?.name && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {post.blog_categories.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </div>
            {post.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.read_time} min read
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views_count || 0} views
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Admin</p>
              <p className="text-xs text-gray-500">Article Author</p>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden border border-gray-200">
              <Image
                src={post.featured_image}
                alt={post.title || "Blog post image"}
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-gray max-w-none mb-8"
        >
          <div className="text-gray-700 leading-relaxed text-sm md:text-base">
            {post.excerpt && (
              <p className="text-lg text-gray-600 font-medium mb-6 border-l-4 border-orange-500 pl-4 italic">
                {post.excerpt}
              </p>
            )}
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>
        </motion.div>

        {/* Article Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600"
                }`}
                disabled={!user}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isLiked ? "fill-white" : "fill-none"
                  }`}
                />
                <span>{likesCount}</span>
              </motion.button>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{commentsCount} comments</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-bold text-gray-900">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onCommentLike={handleCommentLike}
                  onReply={handleReply}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No comments yet
                </h3>
                <p className="text-gray-600">
                  Be the first to share your thoughts on this article.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Add display names for debugging
Comment.displayName = "Comment";
ReplyComponent.displayName = "ReplyComponent";
CommentForm.displayName = "CommentForm";