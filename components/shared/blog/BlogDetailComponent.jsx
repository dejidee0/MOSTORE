"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  User,
  ThumbsUp,
  Send,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
  Check,
  Copy,
} from "lucide-react";

// Toast Notification Component
const Toast = memo(({ message, type = "success", onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 z-50"
  >
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
        type === "success"
          ? "bg-green-500 text-white"
          : type === "error"
          ? "bg-red-500 text-white"
          : "bg-gray-800 text-white"
      }`}
    >
      {type === "success" && <Check className="w-5 h-5" />}
      {type === "error" && <X className="w-5 h-5" />}
      {type === "info" && <Copy className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
));
Toast.displayName = "Toast";

// Image Gallery Component
const ImageGallery = memo(({ images, featuredImage, postTitle }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine featured image with additional images, ensuring featured image is first
  const allImages = useMemo(() => {
    const imagesArray = featuredImage
      ? [
          {
            url: featuredImage,
            alt: postTitle || "Featured image",
            caption: "Featured Image",
          },
        ]
      : [];
    return imagesArray.concat(images || []);
  }, [featuredImage, images, postTitle]);

  if (!allImages || allImages.length === 0) return null;

  const openGallery = (index) => {
    setCurrentIndex(index);
    setSelectedImage(allImages[index]);
  };

  const closeGallery = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") closeGallery();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  }, []);

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedImage, handleKeyDown]);

  return (
    <>
      <div className="my-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-600" />
          Image Gallery ({allImages.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {allImages.map((img, index) => (
            <motion.div
              key={img.id || index}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-orange-500 transition-colors ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : "aspect-square"
              }`}
              onClick={() => openGallery(index)}
            >
              <img
                src={img.url}
                alt={img.alt || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs sm:text-sm p-2 truncate">
                  {img.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6"
            onClick={closeGallery}
          >
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close gallery"
            >
              <X className="w-8 h-8" />
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-10 h-10 sm:w-12 sm:h-12" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-10 h-10 sm:w-12 sm:h-12" />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[90vw] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || "Gallery image"}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {(selectedImage.caption || selectedImage.alt) && (
                <div className="mt-4 text-center">
                  <p className="text-white text-sm sm:text-base">
                    {selectedImage.caption || selectedImage.alt}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {currentIndex + 1} / {allImages.length}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

// Comment Component
const Comment = memo(({ comment, onCommentLike, onReply }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-gray-200 p-4 rounded-2xl"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
        <User className="w-5 h-5 text-orange-700" />
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {comment.author_name}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(comment.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
      {comment.content}
    </p>
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
        Reply
      </button>
    </div>

    {comment.replies?.length > 0 && (
      <div className="ml-8 mt-4 space-y-3">
        {comment.replies.map((reply) => (
          <ReplyComponent key={reply.id} reply={reply} />
        ))}
      </div>
    )}
  </motion.div>
));

Comment.displayName = "Comment";

// Reply Component
const ReplyComponent = memo(({ reply }) => (
  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
        <User className="w-4 h-4 text-orange-700" />
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

ReplyComponent.displayName = "ReplyComponent";

// Comment Form Component
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
              Replying to{" "}
              <span className="font-medium">{replyingTo.author_name}</span>
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
        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none outline-none"
        placeholder={
          replyingTo ? "Write your reply..." : "Share your thoughts..."
        }
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

CommentForm.displayName = "CommentForm";

export default function BlogPostDetail({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState(null);

  const postId = useMemo(() => post?.id, [post?.id]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .select(
          `
        id,
        post_id,
        parent_id,
        guest_id,
        user_id,
        author_name,
        author_email,
        content,
        status,
        likes_count,
        created_at,
        replies:blog_comments!parent_id(
          id,
          post_id,
          parent_id,
          guest_id,
          user_id,
          author_name,
          author_email,
          content,
          status,
          created_at
        )
      `
        )
        .eq("post_id", postId)
        .is("parent_id", null)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [postId]);

  const checkUserLike = useCallback(async () => {
    if (!postId) return;

    try {
      const guestId = getGuestId();
      let query = supabase
        .from("blog_likes")
        .select("id")
        .eq("post_id", postId);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("guest_id", guestId);
      }

      const { data } = await query.maybeSingle();
      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking like:", error);
    }
  }, [user, postId]);

  function getGuestId() {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem("guest_id", guestId);
    }
    return guestId;
  }

  const handleLike = useCallback(async () => {
    if (!postId) return;

    const guestId = getGuestId();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      if (isLiked) {
        await supabase
          .from("blog_likes")
          .delete()
          .eq("post_id", postId)
          .eq("guest_id", guestId);
      } else {
        await supabase
          .from("blog_likes")
          .insert({ post_id: postId, guest_id: guestId });
      }
    } catch (error) {
      console.error("Error handling like:", error);
      setIsLiked(isLiked);
    }
  }, [postId, isLiked]);

  const handleCommentSubmit = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !postId) return;

    const guestId = getGuestId();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("blog_comments").insert({
        post_id: postId,
        parent_id: replyingTo?.id || null,
        guest_id: guestId,
        author_name: "Guest User",
        content: trimmedComment,
        status: "approved",
      });

      if (!error) {
        setNewComment("");
        setReplyingTo(null);
        fetchComments();
        showToast("Comment posted successfully!", "success");
      } else {
        showToast("Failed to post comment", "error");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      showToast("Failed to post comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, postId, replyingTo, fetchComments, showToast]);

  const handleCommentLike = useCallback(
    async (commentId) => {
      const guestId = getGuestId();

      try {
        const { data: alreadyLiked } = await supabase
          .from("blog_comment_likes")
          .select("id")
          .eq("comment_id", commentId)
          .eq("guest_id", guestId)
          .maybeSingle();

        if (alreadyLiked) {
          await supabase
            .from("blog_comment_likes")
            .delete()
            .eq("comment_id", commentId)
            .eq("guest_id", guestId);
        } else {
          await supabase
            .from("blog_comment_likes")
            .insert({ comment_id: commentId, guest_id: guestId });
        }

        fetchComments();
      } catch (error) {
        console.error("Error handling comment like:", error);
      }
    },
    [fetchComments]
  );

  const handleReply = useCallback((comment) => {
    setReplyingTo(comment);
  }, []);

  const handleShare = useCallback(async () => {
    if (!post?.title) {
      showToast("Unable to share this post", "error");
      return;
    }

    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    // Check if Web Share API is supported
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("Post shared successfully!", "success");
      } catch (error) {
        // User cancelled or share failed
        if (error.name === "AbortError") {
          // User cancelled - don't show error
          return;
        }
        console.error("Error sharing:", error);
        // Fall back to clipboard
        copyToClipboard(shareData.url);
      }
    } else {
      // Fallback to copying link
      copyToClipboard(shareData.url);
    }
  }, [post, showToast]);

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("Link copied to clipboard!", "info");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          showToast("Link copied to clipboard!", "info");
        } catch (err) {
          console.error("Fallback copy failed:", err);
          showToast("Failed to copy link", "error");
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      showToast("Failed to copy link", "error");
    }
  };

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

  const likesCount = useMemo(() => post?.likes_count || 0, [post?.likes_count]);
  const commentsCount = useMemo(() => comments.length, [comments.length]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {post.blog_categories?.name && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {post.blog_categories.name}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

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
          </div>

          <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Admin</p>
              <p className="text-xs text-gray-500">Article Author</p>
            </div>
          </div>
        </motion.div>

        {post.featured_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={post.featured_image}
                alt={post.title || "Blog post image"}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {post.excerpt && (
            <p className="text-lg text-gray-700 font-medium mb-6 border-l-4 border-orange-500 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.images && post.images.length > 0 && (
            <ImageGallery images={post.images} />
          )}
        </motion.div>

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
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Comments ({commentsCount})
          </h2>

          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />

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

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
