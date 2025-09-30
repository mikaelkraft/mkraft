import supabase from "./supabase";
import { api } from "./api/client";
const USE_API = import.meta.env.VITE_USE_API === "true";

class BlogService {
  // Full text / heuristic search (API first, fallback to supabase includes)
  async searchPosts(q, options = {}) {
    try {
      if (!q || !q.trim()) return { success: true, data: [] };
      if (USE_API) {
        const data = await api.get("/blog/search", {
          q,
          limit: options.limit || 10,
        });
        return { success: true, data: data || [] };
      }
      // Fallback: use existing published post ilike search
      return await this.getPublishedPosts({
        search: q,
        limit: options.limit || 10,
      });
    } catch (e) {
      return { success: false, error: "Search failed" };
    }
  }
  // Get all published blog posts (public access)
  async getPublishedPosts(options = {}) {
    try {
      if (USE_API) {
        const data = await api.get("/blog", {
          published: true,
          search: options.search,
          category: options.category,
          tag: options.tag,
          limit: options.limit,
        });
        return { success: true, data: data || [] };
      }
      let query = supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .eq("status", "published");

      // Apply search filter
      if (options.search) {
        query = query.or(
          `title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%,content.ilike.%${options.search}%`,
        );
      }

      // Apply category filter
      if (options.category) {
        query = query.eq("category", options.category);
      }

      // Apply tag filter
      if (options.tag) {
        query = query.contains("tags", [options.tag]);
      }

      // Apply sorting
      switch (options.sortBy) {
        case "oldest":
          query = query.order("published_at", { ascending: true });
          break;
        case "most-liked":
          query = query.order("like_count", { ascending: false });
          break;
        case "most-commented":
          query = query.order("comment_count", { ascending: false });
          break;
        case "relevance":
          query = query.order("view_count", { ascending: false });
          break;
        default: // newest
          query = query.order("published_at", { ascending: false });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1,
        );
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to load blog posts" };
    }
  }

  // Get all blog posts (admin access)
  async getAllPosts() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to load blog posts" };
    }
  }

  // Get featured blog posts
  async getFeaturedPosts() {
    try {
      if (USE_API) {
        const data = await api.get("/blog", {
          published: true,
          featured: true,
        });
        return { success: true, data: data || [] };
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .eq("status", "published")
        .eq("featured", true)
        .order("published_at", { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to load featured posts" };
    }
  }

  // Get single blog post by slug with comments
  async getPostBySlug(slug) {
    try {
      if (USE_API) {
        const data = await api.get("/blog/by-slug", { slug });
        // Increment view count via API
        if (data?.post_id) {
          try {
            await this.incrementViewCount(data.post_id);
          } catch {}
        }
        return { success: true, data };
      }
      const { data, error } = await supabase.rpc(
        "get_blog_post_with_comments",
        {
          post_slug: slug,
        },
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: "Blog post not found" };
      }

      const post = data[0];

      // Increment view count
      await this.incrementViewCount(post.post_id);

      return { success: true, data: post };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to load blog post" };
    }
  }

  // Get single blog post by ID
  async getPost(postId) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .eq("id", postId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to load blog post" };
    }
  }

  // Create new blog post (admin only)
  async createPost(postData) {
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (!user || authErr)
        return { success: false, error: "Authentication required" };
      // Generate slug from title
      const slug =
        postData.slug && postData.slug.trim()
          ? postData.slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : postData.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/blog",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ ...postData, slug }),
          },
        );
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, data };
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          ...postData,
          slug,
          author_id: user.id,
          published_at:
            postData.published_at ??
            (postData.status === "published" ? new Date().toISOString() : null),
        })
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to create blog post" };
    }
  }

  // Update blog post (admin only)
  async updatePost(postId, updates) {
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (!user || authErr)
        return { success: false, error: "Authentication required" };
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Update slug if title changed
      if (typeof updates.slug === "string") {
        updateData.slug = updates.slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/(^-|-$)/g, "");
      } else if (updates.title) {
        updateData.slug = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // Set published_at if status changed to published
      if (typeof updates.published_at !== "undefined") {
        updateData.published_at = updates.published_at;
      } else if (updates.status === "published" && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        const url = new URL(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/blog",
          window.location.origin,
        );
        url.searchParams.set("id", postId);
        const res = await fetch(url.toString(), {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, data };
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", postId)
        .select(
          `
          *,
          author:user_profiles(full_name, email)
        `,
        )
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to update blog post" };
    }
  }

  // Delete blog post (admin only)
  async deletePost(postId) {
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (!user || authErr)
        return { success: false, error: "Authentication required" };
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        const url = new URL(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/blog",
          window.location.origin,
        );
        url.searchParams.set("id", postId);
        const res = await fetch(url.toString(), {
          method: "DELETE",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) return { success: false, error: await res.text() };
        return { success: true };
      }
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to delete blog post" };
    }
  }

  // Increment view count
  async incrementViewCount(postId) {
    try {
      if (USE_API) {
        await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/views/increment",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              content_type: "blog_post",
              content_id: postId,
            }),
          },
        );
        return;
      }
      await supabase.rpc("increment_view_count", {
        content_type: "blog_post",
        content_id: postId,
      });
    } catch (error) {
      // Silently fail view count increment
      console.log("Failed to increment view count:", error);
    }
  }

  // Toggle like for blog post
  async toggleLike(postId, visitorIp, userAgent = "") {
    try {
      if (USE_API) {
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/likes/toggle",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              content_type: "blog_post",
              content_id: postId,
              visitor_ip: visitorIp,
              user_agent: userAgent,
            }),
          },
        );
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, liked: !!data.liked };
      }
      const { data, error } = await supabase.rpc("toggle_like", {
        content_type: "blog_post",
        content_id: postId,
        visitor_ip_addr: visitorIp,
        user_agent_str: userAgent,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, liked: data };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to toggle like" };
    }
  }

  // Check if user has liked post
  async checkIfLiked(postId, visitorIp) {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("blog_post_id", postId)
        .eq("visitor_ip", visitorIp)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        return { success: false, error: error.message };
      }

      return { success: true, liked: !!data };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to check like status" };
    }
  }

  // Get blog statistics
  async getBlogStats() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("status, view_count, like_count, comment_count")
        .eq("status", "published");

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = data?.reduce(
        (acc, post) => {
          acc.total += 1;
          acc.totalViews += post.view_count || 0;
          acc.totalLikes += post.like_count || 0;
          acc.totalComments += post.comment_count || 0;
          return acc;
        },
        { total: 0, totalViews: 0, totalLikes: 0, totalComments: 0 },
      ) || { total: 0, totalViews: 0, totalLikes: 0, totalComments: 0 };

      return { success: true, data: stats };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to get blog statistics" };
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("status", "published")
        .not("category", "is", null);

      if (error) {
        return { success: false, error: error.message };
      }

      // Safely derive unique non-empty categories; avoid calling filter on undefined and remove redundant fallback
      const categories = data
        ? [...new Set(data.map((post) => post.category).filter(Boolean))]
        : [];

      return { success: true, data: categories };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to get categories" };
    }
  }

  // Get all tags
  async getTags() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("tags")
        .eq("status", "published")
        .not("tags", "is", null);

      if (error) {
        return { success: false, error: error.message };
      }

      const allTags = data?.flatMap((post) => post.tags || []) || [];
      const uniqueTags = [...new Set(allTags)];

      return { success: true, data: uniqueTags };
    } catch (error) {
      if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        (error?.name === "TypeError" && error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to get tags" };
    }
  }

  // Get related posts by slug (API only for now)
  async getRelatedPosts(slug) {
    try {
      if (USE_API) {
        const data = await api.get("/blog/related", { slug });
        return { success: true, data: data || [] };
      }
      // Fallback heuristic client-side (Supabase mode): fetch published posts & filter by tag overlap
      const published = await this.getPublishedPosts({ limit: 50 });
      if (!published.success)
        return { success: false, error: "Failed to fetch base posts" };
      const target = published.data.find((p) => p.slug === slug);
      if (!target) return { success: true, data: [] };
      const tags = target.tags || [];
      const related = published.data
        .filter((p) => p.slug !== slug)
        .map((p) => ({
          ...p,
          __score: (p.tags || []).filter((t) => tags.includes(t)).length,
        }))
        .filter((p) => p.__score > 0)
        .sort((a, b) => b.__score - a.__score)
        .slice(0, 3);
      return { success: true, data: related };
    } catch (e) {
      return { success: false, error: "Failed to load related posts" };
    }
  }
}

const blogService = new BlogService();
export default blogService;
