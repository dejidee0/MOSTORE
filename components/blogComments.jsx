"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, User } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { saveGuestInfo, getGuestInfo } from "@/lib/guestUtils";

const BlogComments = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (currentUser?.isGuest) {
      const guestInfo = getGuestInfo();
      setGuestName(guestInfo.name);
      setGuestEmail(guestInfo.email);
    }
  }, [currentUser]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("blog_comments")
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await fetchReplies(comment.id);
          const likedByUser = await checkCommentLiked(comment.id);
          return { ...comment, replies, isLiked: likedByUser };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const { data, error } = await supabase
        .from("blog_comment_replies")
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("comment_id", commentId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching replies:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching replies:", error);
      return [];
    }
  };

  const checkCommentLiked = async (commentId) => {
    if (!currentUser) return false;

    try {
      let query = supabase
        .from("blog_comment_likes")
        .select("id")
        .eq("comment_id", commentId);

      if (currentUser.isGuest) {
        query = query.eq("guest_id", currentUser.guestId);
      } else {
        query = query.eq("user_id", currentUser.userId);
      }

      const { data } = await query.single();
      return !!data;
    } catch (error) {
      return false;
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    if (currentUser?.isGuest && (!guestName.trim() || !guestEmail.trim())) {
      setShowGuestForm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData = {
        post_id: postId,
        content: newComment.trim(),
        status: "approved", // Or 'pending' if you want to moderate
      };

      if (currentUser?.isGuest) {
        commentData.guest_id = currentUser.guestId;
        commentData.author_name = guestName.trim();
        commentData.author_email = guestEmail.trim();
        saveGuestInfo(guestName.trim(), guestEmail.trim());
      } else if (currentUser?.userId) {
        commentData.user_id = currentUser.userId;
        commentData.author_name = currentUser.name;
        commentData.author_email = currentUser.email;
      }

      const { data, error } = await supabase
        .from("blog_comments")
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      // Update post comments count
      await supabase.rpc("increment_post_comments", { post_id: postId });

      // Add the new comment to the list
      setComments([{ ...data, replies: [], isLiked: false }, ...comments]);
      setNewComment("");
      setShowGuestForm(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <form onSubmit={handleSubmitComment}>
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {currentUser?.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />

              {/* Guest Name/Email Form */}
              <AnimatePresence>
                {showGuestForm && currentUser?.isGuest && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
                  >
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name *"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Your email *"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-500">
                  {currentUser?.isGuest
                    ? "Commenting as guest"
                    : `Commenting as ${currentUser?.name || "User"}`}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUser={currentUser}
              onCommentUpdate={fetchComments}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Comment Component
const Comment = ({ comment, postId, currentUser, onCommentUpdate }) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showGuestReplyForm, setShowGuestReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  useEffect(() => {
    if (currentUser?.isGuest) {
      const guestInfo = getGuestInfo();
      setGuestName(guestInfo.name);
      setGuestEmail(guestInfo.email);
    }
  }, [currentUser]);

  const handleLikeComment = async () => {
    if (isLiking || !currentUser) return;

    setIsLiking(true);

    try {
      if (isLiked) {
        // Unlike
        let query = supabase
          .from("blog_comment_likes")
          .delete()
          .eq("comment_id", comment.id);

        if (currentUser.isGuest) {
          query = query.eq("guest_id", currentUser.guestId);
        } else {
          query = query.eq("user_id", currentUser.userId);
        }

        const { error } = await query;
        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));

        // Update comment likes count
        await supabase
          .from("blog_comments")
          .update({ likes_count: Math.max(0, likesCount - 1) })
          .eq("id", comment.id);
      } else {
        // Like
        const likeData = {
          comment_id: comment.id,
        };

        if (currentUser.isGuest) {
          likeData.guest_id = currentUser.guestId;
        } else {
          likeData.user_id = currentUser.userId;
        }

        const { error } = await supabase
          .from("blog_comment_likes")
          .insert([likeData]);

        if (error) throw error;

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);

        // Update comment likes count
        await supabase
          .from("blog_comments")
          .update({ likes_count: likesCount + 1 })
          .eq("id", comment.id);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      alert("Failed to update like. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      alert("Please enter a reply");
      return;
    }

    if (currentUser?.isGuest && (!guestName.trim() || !guestEmail.trim())) {
      setShowGuestReplyForm(true);
      return;
    }

    setIsSubmittingReply(true);

    try {
      const replyData = {
        comment_id: comment.id,
        content: replyContent.trim(),
        status: "approved",
      };

      if (currentUser?.isGuest) {
        replyData.guest_id = currentUser.guestId;
        replyData.author_name = guestName.trim();
        replyData.author_email = guestEmail.trim();
        saveGuestInfo(guestName.trim(), guestEmail.trim());
      } else if (currentUser?.userId) {
        replyData.user_id = currentUser.userId;
        replyData.author_name = currentUser.name;
        replyData.author_email = currentUser.email;
      }

      const { data, error } = await supabase
        .from("blog_comment_replies")
        .insert([replyData])
        .select()
        .single();

      if (error) throw error;

      // Add reply to the list
      setReplies([...replies, data]);
      setReplyContent("");
      setShowReplyForm(false);
      setShowGuestReplyForm(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getAuthorName = () => {
    if (comment.profiles?.full_name) return comment.profiles.full_name;
    if (comment.author_name) return comment.author_name;
    return "Anonymous";
  };

  const getAuthorInitial = () => {
    const name = getAuthorName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {getAuthorInitial()}
        </div>

        <div className="flex-1">
          {/* Author and Date */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{getAuthorName()}</h4>
              <p className="text-sm text-gray-500">
                {formatDate(comment.created_at)}
              </p>
            </div>
          </div>

          {/* Comment Content */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLikeComment}
              disabled={isLiking}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked
                  ? "text-red-600 font-medium"
                  : "text-gray-500 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount > 0 ? likesCount : ""}</span>
              <span>{isLiked ? "Liked" : "Like"}</span>
            </motion.button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitReply}
                className="mt-4 pl-4 border-l-2 border-gray-200"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                />

                {/* Guest Reply Form */}
                <AnimatePresence>
                  {showGuestReplyForm && currentUser?.isGuest && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                    >
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your name *"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        required
                      />
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Your email *"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setShowGuestReplyForm(false);
                      setReplyContent("");
                    }}
                    className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmittingReply}
                    className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReply ? "Posting..." : "Post Reply"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-200">
              {replies.map((reply) => (
                <Reply key={reply.id} reply={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Reply Component
const Reply = ({ reply }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const getAuthorName = () => {
    if (reply.profiles?.full_name) return reply.profiles.full_name;
    if (reply.author_name) return reply.author_name;
    return "Anonymous";
  };

  const getAuthorInitial = () => {
    const name = getAuthorName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-3"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
        {getAuthorInitial()}
      </div>

      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h5 className="font-semibold text-gray-900 text-sm">
            {getAuthorName()}
          </h5>
          <span className="text-xs text-gray-500">
            {formatDate(reply.created_at)}
          </span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
      </div>
    </motion.div>
  );
};

export default BlogComments;
