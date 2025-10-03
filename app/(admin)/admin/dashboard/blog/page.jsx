"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Heart,
  MessageCircle,
  TrendingUp,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Star,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Strikethrough,
  ImagePlus,
  Trash,
  GripVertical,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import useUserStore from "@/lib/stores/useUserStore";

const BUCKET = "blog-images";

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Rich Text Editor Component with Active State Indicators
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  const execCommand = useCallback(
    (command, value = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateActiveFormats();
    },
    [updateActiveFormats]
  );

  const insertHeading = useCallback(
    (level) => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        execCommand("formatBlock", `<h${level}>`);
      }
    },
    [execCommand]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  }, [onChange, updateActiveFormats]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const handleMouseUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleKeyUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;

      editorRef.current.innerHTML = value;

      // Restore cursor position if possible
      if (range && startOffset !== undefined) {
        try {
          const newRange = document.createRange();
          newRange.setStart(
            editorRef.current.firstChild || editorRef.current,
            Math.min(startOffset, editorRef.current.textContent.length)
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            isActive={activeFormats.bold}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            isActive={activeFormats.italic}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            isActive={activeFormats.underline}
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough"
            isActive={activeFormats.strikeThrough}
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton onClick={() => insertHeading(1)} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHeading(2)} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => insertHeading(3)} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            title="Align Left"
            isActive={activeFormats.justifyLeft}
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            title="Align Center"
            isActive={activeFormats.justifyCenter}
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            title="Align Right"
            isActive={activeFormats.justifyRight}
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet List"
            isActive={activeFormats.insertUnorderedList}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered List"
            isActive={activeFormats.insertOrderedList}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCommand("createLink", url);
            }}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<blockquote>")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<pre>")}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[400px] p-4 outline-none prose prose-sm max-w-none ${
          isFocused ? "ring-2 ring-orange-500 ring-inset" : ""
        }`}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      />
    </div>
  );
}

function ToolbarButton({ onClick, title, children, isActive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

// Optimized Image Gallery Manager Component
const ImageGalleryManager = React.memo(({ images, onChange, onUpload }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e, index) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;

      const newImages = [...images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedImage);

      onChange(newImages);
      setDraggedIndex(index);
    },
    [draggedIndex, images, onChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const removeImage = useCallback(
    (index) => {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [images, onChange]
  );

  const updateImageData = useCallback(
    (index, field, value) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      onChange(newImages);
    },
    [images, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Blog Images ({images.length})
        </label>
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <ImagePlus className="w-4 h-4" /> Add Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
            className="hidden"
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            No images yet. Click "Add Images" to upload.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {images.map((img, index) => (
            <ImageItem
              key={img.id}
              img={img}
              index={index}
              draggedIndex={draggedIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onRemove={removeImage}
              onUpdate={updateImageData}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ImageGalleryManager.displayName = "ImageGalleryManager";

// Optimized Image Item Component
const ImageItem = React.memo(
  ({
    img,
    index,
    draggedIndex,
    onDragStart,
    onDragOver,
    onDragEnd,
    onRemove,
    onUpdate,
  }) => {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDragEnd={onDragEnd}
        className={`bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:border-orange-300 transition-colors ${
          draggedIndex === index ? "opacity-50" : ""
        }`}
      >
        <div className="flex gap-4">
          <div className="flex-shrink-0 flex items-center">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Image description (alt text)"
              value={img.alt || ""}
              onChange={(e) => onUpdate(index, "alt", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={img.caption || ""}
              onChange={(e) => onUpdate(index, "caption", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
);

ImageItem.displayName = "ImageItem";

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
    images: [],
    status: "draft",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    tags: [],
  });

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

    const subscription = supabase
      .channel("public:blog_posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchCategories = useCallback(async () => {
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
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
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
  }, []);

  const postsWithCategory = useMemo(() => {
    if (!posts || !categories) return posts;
    return posts.map((p) => {
      const cat = categories.find((c) => c.id === p.category_id);
      return { ...p, category_name: cat?.name || "" };
    });
  }, [posts, categories]);

  const filteredPosts = useMemo(() => {
    return postsWithCategory.filter((post) => {
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
  }, [postsWithCategory, searchTerm, filterCategory, filterStatus]);

  const handleImageUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImages = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      if (!file.type.match("image.*")) {
        alert(`${file.name} is not an image file.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      validImages.push({
        id: `img-${Date.now()}-${Math.random()}`,
        url: preview,
        alt: "",
        caption: "",
        file: file,
      });
    }

    if (validImages.length > 0) {
      setFormData((s) => ({
        ...s,
        images: [...s.images, ...validImages],
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    formData.images.forEach((img) => {
      if (img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });

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
      images: [],
      status: "draft",
      is_featured: false,
      meta_title: "",
      meta_description: "",
      tags: [],
    });
    setEditingPost(null);
    setShowPostForm(false);
  }, [formData]);

  const handleEdit = useCallback((post) => {
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category_id: post.category_id || "",
      featured_image_url: post.featured_image || "",
      featured_image_file: null,
      images: post.images || [],
      status: post.status || "draft",
      is_featured: !!post.is_featured,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      tags: post.tags || [],
    });
    setEditingPost(post);
    setShowPostForm(true);
  }, []);

  const handleDelete = useCallback(async (postId) => {
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
  }, []);

  const handleFileChange = useCallback(async (file) => {
    if (!file) {
      setFormData((s) => ({
        ...s,
        featured_image_file: null,
        featured_image_url: "",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

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
  }, []);

  const uploadImageIfNeeded = useCallback(async (file, existingUrl) => {
    if (!file) return existingUrl || null;

    try {
      const ext = file.name.split(".").pop();
      const filename = `${uuidv4()}.${ext}`;
      const path = `posts/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }, []);

  const uploadMultipleImages = useCallback(async (images) => {
    const uploadPromises = images.map(async (img) => {
      if (img.file) {
        try {
          const ext = img.file.name.split(".").pop();
          const filename = `${uuidv4()}.${ext}`;
          const path = `posts/${filename}`;

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, img.file, {
              cacheControl: "3600",
              upsert: false,
              contentType: img.file.type,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from(BUCKET).getPublicUrl(path);

          return {
            id: img.id,
            url: publicUrl,
            alt: img.alt,
            caption: img.caption,
          };
        } catch (error) {
          console.error("Image upload error:", error);
          return null;
        }
      }
      return img;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean);
  }, []);

  const isSlugUnique = useCallback(async (slug, excludeId = null) => {
    if (!slug) return false;
    const q = supabase.from("blog_posts").select("id").eq("slug", slug);
    const { data, error } = await q;
    if (error) {
      console.error("slug check error", error);
      return true;
    }
    if (!data) return true;
    if (data.length === 0) return true;
    if (excludeId) {
      return data.every((r) => r.id === excludeId);
    }
    return false;
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (!formData.title || !formData.slug || !formData.content) {
          alert("Please fill required fields: title, slug, content.");
          setIsLoading(false);
          return;
        }

        const unique = await isSlugUnique(formData.slug, editingPost?.id);
        if (!unique) {
          alert("Slug already exists. Please change it.");
          setIsLoading(false);
          return;
        }

        let finalImageUrl = formData.featured_image_url;
        if (formData.featured_image_file) {
          finalImageUrl = await uploadImageIfNeeded(
            formData.featured_image_file,
            formData.featured_image_url
          );
        }

        const uploadedGalleryImages = await uploadMultipleImages(
          formData.images
        );

        const payload = {
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          featured_image: finalImageUrl || null,
          images: uploadedGalleryImages,
          author_id: user?.id || null,
          category_id: formData.category_id
            ? Number(formData.category_id)
            : null,
          status: formData.status || "draft",
          is_featured: formData.is_featured || false,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          read_time: formData.content
            ? Math.max(
                1,
                Math.round(
                  formData.content.replace(/<[^>]*>/g, "").split(/\s+/).length /
                    200
                )
              )
            : 0,
          updated_at: new Date().toISOString(),
        };

        if (editingPost) {
          const { data, error } = await supabase
            .from("blog_posts")
            .update(payload)
            .eq("id", editingPost.id)
            .select()
            .single();
          if (error) throw error;
          setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        } else {
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
    },
    [
      formData,
      editingPost,
      user,
      isSlugUnique,
      uploadImageIfNeeded,
      uploadMultipleImages,
      resetForm,
    ]
  );

  const prettyDate = useCallback((iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Blog Management
          </h1>
          <p className="text-gray-600">
            Create and manage your blog posts with rich formatting
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Total"
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
            label="Views"
            value={stats.totalViews.toLocaleString()}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            label="Likes"
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
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
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
                className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
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
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> New Post
            </motion.button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
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
                      No posts found. Create your first post!
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      prettyDate={prettyDate}
                    />
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
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={resetForm}
              ></div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative max-w-5xl mx-auto my-8 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white/95 backdrop-blur-lg px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingPost ? "Edit Post" : "Create New Post"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Write engaging content with rich formatting
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetForm}
                      className="text-gray-600 hover:text-gray-800 p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      form="post-form"
                      type="submit"
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />{" "}
                      {isLoading ? "Saving..." : "Save Post"}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form
                    id="post-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Title and Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="Enter post title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug{" "}
                          <span className="text-gray-400 text-xs">
                            (auto-generated, editable)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData((s) => ({ ...s, slug: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          placeholder="post-url-slug"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          URL:{" "}
                          <span className="text-orange-600 font-medium">
                            /blog/{formData.slug || "your-slug"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt{" "}
                        <span className="text-gray-400 text-xs">
                          (short summary)
                        </span>
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) =>
                          setFormData((s) => ({
                            ...s,
                            excerpt: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Brief description of your post..."
                      />
                    </div>

                    {/* Category and Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Settings
                        </label>
                        <div className="flex items-center gap-4 h-10">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_featured}
                              onChange={(e) =>
                                setFormData((s) => ({
                                  ...s,
                                  is_featured: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">
                              Featured
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image{" "}
                        <span className="text-gray-400 text-xs">
                          (main cover image)
                        </span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="url"
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
                            placeholder="https://example.com/image.jpg"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 w-full justify-center">
                            <Upload className="w-4 h-4" /> Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e.target.files?.[0] || null)
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      {formData.featured_image_url && (
                        <div className="mt-3 w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={formData.featured_image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) =>
                          setFormData((s) => ({ ...s, content }))
                        }
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Estimated read time:{" "}
                        <span className="font-medium">
                          {formData.content
                            ? Math.max(
                                1,
                                Math.round(
                                  formData.content
                                    .replace(/<[^>]*>/g, "")
                                    .split(/\s+/).length / 200
                                )
                              )
                            : 0}{" "}
                          min
                        </span>
                      </p>
                    </div>

                    {/* Image Gallery */}
                    <ImageGalleryManager
                      images={formData.images}
                      onChange={(images) =>
                        setFormData((s) => ({ ...s, images }))
                      }
                      onUpload={handleImageUpload}
                    />

                    {/* SEO Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        SEO Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Title
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
                            placeholder="SEO-optimized title (60 characters max)"
                            maxLength={60}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {formData.meta_title.length}/60 characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meta Description
                          </label>
                          <textarea
                            value={formData.meta_description}
                            onChange={(e) =>
                              setFormData((s) => ({
                                ...s,
                                meta_description: e.target.value,
                              }))
                            }
                            placeholder="Brief description for search engines (160 characters max)"
                            maxLength={160}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {formData.meta_description.length}/160 characters
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
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

// Optimized Post Row Component
const PostRow = React.memo(({ post, onEdit, onDelete, prettyDate }) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
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
              {post.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
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
            onClick={() => onEdit(post)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

PostRow.displayName = "PostRow";

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
