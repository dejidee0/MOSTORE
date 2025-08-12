"use client";

import React, { useState, useEffect } from "react";
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
  Reply,
  Send,
} from "lucide-react";

export default function BlogPostDetail({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  // ✅ Fetch comments
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("blog_comments")
      .select(
        `
        *,
        replies:blog_comments!parent_id(*)
      `
      )
      .eq("post_id", post?.id)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (!error) setComments(data || []);
  };

  // ✅ Check if user liked post
  const checkUserLike = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data } = await supabase
      .from("blog_likes")
      .select("id")
      .eq("post_id", post?.id)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  };

  // ✅ Handle post like
  const handleLike = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("Please log in to like posts.");

    if (isLiked) {
      await supabase
        .from("blog_likes")
        .delete()
        .eq("post_id", post?.id)
        .eq("user_id", user.id);
      setIsLiked(false);
    } else {
      await supabase
        .from("blog_likes")
        .insert({ post_id: post?.id, user_id: user.id });
      setIsLiked(true);
    }
  };

  // ✅ Handle new comment / reply
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("Please log in to comment.");

    const { error } = await supabase.from("blog_comments").insert({
      post_id: post?.id,
      parent_id: replyingTo?.id || null,
      user_id: user.id,
      author_name: user.user_metadata.full_name || "Guest",
      author_email: user.email,
      content: newComment,
      status: "approved",
    });

    if (!error) {
      setNewComment("");
      setReplyingTo(null);
      fetchComments();
    }
  };

  // ✅ Handle comment like
  const handleCommentLike = async (commentId) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return alert("Please log in to like comments.");

    const alreadyLiked = await supabase
      .from("blog_comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (alreadyLiked.data) {
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
  };

  // ✅ Real-time updates for comments
  useEffect(() => {
    fetchComments();
    checkUserLike();

    const channel = supabase
      .channel(`comments-${post?.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: `post_id=eq.${post?.id}`,
        },
        () => fetchComments()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [post?.id]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* Post Content */}
      <h1 className="text-3xl font-bold mb-4">{post?.title}</h1>
      {/* Featured Image */}
      {post?.featured_image && (
        <div className="mb-8">
          <Image
            src={post.featured_image}
            alt={post.title || "Blog post image"}
            width={1200}
            height={600}
            className="w-full h-96 object-cover rounded-2xl shadow-lg border border-gray-200"
            priority
          />
        </div>
      )}

      <p className="mb-6 text-gray-700">{post?.content}</p>

      {/* Like & Comment Counts */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-red-600"
        >
          <Heart
            className={`w-5 h-5 ${isLiked ? "fill-red-600" : "fill-none"}`}
          />
          {post?.likes_count || 0}
        </button>
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-5 h-5" />
          {post?.comments_count || 0}
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <p className="font-medium">{comment.author_name}</p>
            </div>
            <p className="text-gray-700 mb-2">{comment.content}</p>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <button
                onClick={() => handleCommentLike(comment.id)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" /> {comment.likes_count || 0}
              </button>
              <button
                onClick={() => setReplyingTo(comment)}
                className="flex items-center gap-1"
              >
                <Reply className="w-4 h-4" /> Reply
              </button>
            </div>

            {/* Replies */}
            {comment.replies?.length > 0 && (
              <div className="ml-10 mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="border p-3 rounded-lg">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="font-medium">{reply.author_name}</p>
                    </div>
                    <p className="text-gray-700 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <div className="mt-8">
        {replyingTo && (
          <p className="text-sm text-gray-500 mb-2">
            Replying to {replyingTo.author_name}{" "}
            <button
              onClick={() => setReplyingTo(null)}
              className="text-red-500"
            >
              Cancel
            </button>
          </p>
        )}
        <textarea
          className="w-full p-3 border rounded-lg mb-3"
          placeholder={
            replyingTo ? "Write your reply..." : "Write a comment..."
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleCommentSubmit}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Post
        </button>
      </div>

      {/* Read More Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 text-orange-600 font-medium group-hover:gap-3 transition-all mt-8"
      >
        <Link href={`/blog/${post?.id}`} className="flex items-center gap-2">
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.button>
    </div>
  );
}
