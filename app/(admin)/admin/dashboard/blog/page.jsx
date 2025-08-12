"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Calendar,
  Tag,
  Heart,
  MessageCircle,
  TrendingUp,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import useUserStore from "@/lib/stores/useUserStore";

/**
 * BlogAdmin component
 * - Real data using Supabase
 * - Image upload to storage bucket "blog-images" (adjust bucket name if needed)
 * - Create / Edit / Delete blog_posts
 * - Fetch categories from blog_categories
 * - Slug generation + uniqueness check
 * - Revamped sleek modal UI (glassmorphism)
 */

const BUCKET = "blog-images"; // change if your bucket is named differently

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, ""); // trim leading/trailing hyphens
}

export default function BlogAdmin() {
  const { user } = useUserStore();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category_id: "",
    featured_image_url: "",
    featured_image_file: null,
    status: "draft",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    tags: [],
  });

  // Stats derived from posts
  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      totalViews: posts.reduce((s, p) => s + (p.views_count || 0), 0),
      totalLikes: posts.reduce((s, p) => s + (p.likes_count || 0), 0),
      totalComments: posts.reduce((s, p) => s + (p.comments_count || 0), 0),
    };
  }, [posts]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    // Listen to changes in blog_posts to refresh UI in realtime (optional)
    const subscription = supabase
      .channel("public:blog_posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        (payload) => {
          // simple refresh - could be optimized
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("fetchCategories error", err);
    }
  }

  async function fetchPosts() {
    setIsLoading(true);
    try {
      // select all posts. We will map category name via local categories fetch
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("fetchPosts error", err);
    } finally {
      setIsLoading(false);
    }
  }

  // combine category name for UI convenience
  const postsWithCategory = useMemo(() => {
    if (!posts || !categories) return posts;
    return posts.map((p) => {
      const cat = categories.find((c) => c.id === p.category_id);
      return { ...p, category_name: cat?.name || "" };
    });
  }, [posts, categories]);

  // filtered view
  const filteredPosts = postsWithCategory.filter((post) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (post.title && post.title.toLowerCase().includes(q)) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(q));
    const matchesCategory =
      !filterCategory || post.category_id == filterCategory;
    const matchesStatus = !filterStatus || post.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // handle file input change
  const handleFileChange = async (file) => {
    if (!file) {
      setFormData((s) => ({
        ...s,
        featured_image_file: null,
        featured_image_url: "",
      }));
      return;
    }

    // Check file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Only image files are allowed");
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData((s) => ({
      ...s,
      featured_image_file: file,
      featured_image_url: preview,
    }));
  };

  const resetForm = () => {
    // revoke preview objectURLs if used
    if (
      formData?.featured_image_file &&
      formData.featured_image_url?.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.featured_image_url);
    }
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category_id: "",
      featured_image_url: "",
      featured_image_file: null,
      status: "draft",
      is_featured: false,
      meta_title: "",
      meta_description: "",
      tags: [],
    });
    setEditingPost(null);
    setShowPostForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category_id: post.category_id || "",
      featured_image_url: post.featured_image || "",
      featured_image_file: null,
      status: post.status || "draft",
      is_featured: !!post.is_featured,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      tags: post.tags || [],
    });
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleDelete = async (postId) => {
    if (
      !confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    )
      return;
    try {
      await supabase.from("blog_posts").delete().eq("id", postId);
      setPosts((p) => p.filter((x) => x.id !== postId));
    } catch (err) {
      console.error("delete error", err);
      alert("Failed to delete post. See console.");
    }
  };

  async function uploadImageIfNeeded(file, existingUrl) {
    if (!file) return existingUrl || null;

    try {
      const ext = file.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `posts/${filename}`;

      // First try to upload
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Explicitly set content type
        });

      if (uploadError) throw uploadError;

      // If successful, get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  // check slug uniqueness (excluding current editing post)
  async function isSlugUnique(slug, excludeId = null) {
    if (!slug) return false;
    const q = supabase.from("blog_posts").select("id").eq("slug", slug);
    const { data, error } = await q;
    if (error) {
      console.error("slug check error", error);
      return true; // let DB handle rejections later
    }
    if (!data) return true;
    if (data.length === 0) return true;
    if (excludeId) {
      return data.every((r) => r.id === excludeId);
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // basic validation
      if (!formData.title || !formData.slug || !formData.content) {
        alert("Please fill required fields: title, slug, content.");
        setIsLoading(false);
        return;
      }

      // ensure slug uniqueness
      const unique = await isSlugUnique(formData.slug, editingPost?.id);
      if (!unique) {
        alert("Slug already exists. Please change it.");
        setIsLoading(false);
        return;
      }

      // upload image if provided
      let finalImageUrl = formData.featured_image_url;
      if (formData.featured_image_file) {
        finalImageUrl = await uploadImageIfNeeded(
          formData.featured_image_file,
          formData.featured_image_url
        );
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        featured_image: finalImageUrl || null,
        author_id: user.id,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        status: formData.status || "draft",
        is_featured: formData.is_featured || false,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        // optionally compute read_time as words / 200
        read_time: formData.content
          ? Math.max(1, Math.round(formData.content.split(/\s+/).length / 200))
          : 0,
        updated_at: new Date().toISOString(),
      };

      if (editingPost) {
        // update
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingPost.id)
          .select()
          .single();
        if (error) throw error;
        // update local
        setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      } else {
        // create new (author_id left null by default - set if you want)
        payload.created_at = new Date().toISOString();
        if (payload.status === "published")
          payload.published_at = new Date().toISOString();

        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setPosts((prev) => [data, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("save post error", err);
      alert("Error saving post. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers for tags input (simple comma-separated)
  const handleTagsInput = (raw) => {
    const arr = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFormData((s) => ({ ...s, tags: arr }));
  };

  // A small helper to display a compact date
  const prettyDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-max bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Blog Management
          </h1>
          <p className="text-gray-600">
            Create, edit and manage posts backed by your database.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Total Posts"
            value={stats.total}
            icon={<Edit3 className="w-5 h-5 text-orange-600" />}
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={<Eye className="w-5 h-5 text-green-600" />}
          />
          <StatCard
            label="Drafts"
            value={stats.draft}
            icon={<EyeOff className="w-5 h-5 text-yellow-600" />}
          />
          <StatCard
            label="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            label="Total Likes"
            value={stats.totalLikes}
            icon={<Heart className="w-5 h-5 text-red-600" />}
          />
          <StatCard
            label="Comments"
            value={stats.totalComments}
            icon={<MessageCircle className="w-5 h-5 text-purple-600" />}
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 flex-1">
              <div className="relative w-full sm:w-auto">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  className="pl-10 pr-4 py-2 w-full sm:w-72 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg w-full sm:w-auto"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg w-full sm:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <motion.button
              onClick={() => setShowPostForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> New Post
            </motion.button>
          </div>
        </div>

        {/* Posts table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Post
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Category
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Stats
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left p-4 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      Loading posts...
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {post.featured_image ? (
                              // use next/image only for absolute/public urls
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {post.title}
                              </h3>
                              {post.is_featured && (
                                <Star className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category_name}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : post.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments_count || 0}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {post.published_at
                          ? prettyDate(post.published_at)
                          : prettyDate(post.created_at)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post Form Modal */}
        <AnimatePresence>
          {showPostForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto" // allow scrolling on the overlay itself
            >
              {/* glass overlay */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>

              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                className="relative max-w-3xl mx-auto mt-10 md:mt-20 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 max-h-screen overflow-y-auto" // scrollable form container
              >
                {/* sticky header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex items-center justify-between ">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingPost ? "Edit Post" : "New Post"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Publishing to your `blog_posts` table
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetForm}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      form="post-form"
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />{" "}
                      {isLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form
                    id="post-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setFormData((s) => ({
                              ...s,
                              title,
                              slug: generateSlug(title),
                            }));
                          }}
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Slug{" "}
                          <span className="text-gray-400 text-xs">
                            (editable)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData((s) => ({ ...s, slug: e.target.value }))
                          }
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          Preview:{" "}
                          <span className="text-orange-600 font-medium">
                            {typeof window !== "undefined"
                              ? `${window.location.origin}/blog/${formData.slug}`
                              : `/${formData.slug}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Excerpt
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            excerpt: e.target.value,
                          }))
                        }
                        rows={2}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            category_id: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.content}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            content: e.target.value,
                          }))
                        }
                        rows={8}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        Read time estimated:{" "}
                        <span className="font-medium">
                          {formData.content
                            ? Math.max(
                                1,
                                Math.round(
                                  formData.content.split(/\s+/).length / 200
                                )
                              )
                            : 0}{" "}
                          min
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Featured Image (URL or upload)
                        </label>
                        <input
                          type="text"
                          value={
                            formData.featured_image_url &&
                            !formData.featured_image_file
                              ? formData.featured_image_url
                              : ""
                          }
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              featured_image_url: e.target.value,
                              featured_image_file: null,
                            }))
                          }
                          placeholder="https://..."
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Upload image
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50">
                            <Upload className="w-4 h-4" /> Choose file
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e.target.files?.[0] || null)
                              }
                              className="hidden"
                            />
                          </label>
                          {formData.featured_image_url && (
                            <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={formData.featured_image_url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Meta title
                        </label>
                        <input
                          type="text"
                          value={formData.meta_title}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              meta_title: e.target.value,
                            }))
                          }
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        <label className="block text-sm font-medium text-gray-700 mt-2">
                          Meta description
                        </label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              meta_description: e.target.value,
                            }))
                          }
                          rows={2}
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              status: e.target.value,
                            }))
                          }
                          className="mt-1 border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="featured"
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) =>
                            setFormData((s) => ({
                              ...s,
                              is_featured: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="featured"
                          className="text-sm text-gray-700"
                        >
                          Featured
                        </label>
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          onChange={(e) => handleTagsInput(e.target.value)}
                          placeholder="cars,evs,mobility"
                          className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          Current tags: {formData.tags.join(", ") || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded-md border border-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                      >
                        {isLoading
                          ? "Saving..."
                          : editingPost
                            ? "Update Post"
                            : "Create Post"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Small subcomponents ---------- */

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
