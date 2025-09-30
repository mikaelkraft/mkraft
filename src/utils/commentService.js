import supabase from "./supabase";
import { api } from "./api/client";
const USE_API = import.meta.env.VITE_USE_API === "true";

class CommentService {
  // Get comments for a blog post
  async getComments(blogPostId) {
    try {
      if (USE_API) {
        const data = await api.get("/comments", { postId: blogPostId });
        return { success: true, data: data || [] };
      }
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("blog_post_id", blogPostId)
        .eq("is_approved", true)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const replies = await this.getReplies(comment.id);
          return {
            ...comment,
            replies: replies.success ? replies.data : [],
          };
        }),
      );

      return { success: true, data: commentsWithReplies };
    } catch (_error) {
      const error = _error; // alias for readability when constructing messages
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
      return { success: false, error: "Failed to load comments" };
    }
  }

  // Get replies for a comment
  async getReplies(parentCommentId) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("parent_comment_id", parentCommentId)
        .eq("is_approved", true)
        .order("created_at", { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (_error) {
      const error = _error;
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
      return { success: false, error: "Failed to load replies" };
    }
  }

  // Create new comment (public access - no auth required)
  async createComment(commentData) {
    try {
      if (USE_API) {
        // API reads IP/user agent from headers
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/comments",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(commentData),
          },
        );
        if (!res.ok) {
          const msg = await res.text();
          return { success: false, error: msg || "Failed to create comment" };
        }
        const data = await res.json();
        return { success: true, data };
      }
      // Get visitor IP and user agent for tracking
      const visitorIp = await this.getVisitorIp();
      const userAgent = navigator.userAgent || "";

      const { data, error } = await supabase
        .from("comments")
        .insert({
          ...commentData,
          visitor_ip: visitorIp,
          user_agent: userAgent,
          is_approved: true, // Auto-approve for now, could add moderation later
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update comment count for blog post
      await this.updateCommentCount(commentData.blog_post_id);

      return { success: true, data };
    } catch (_error) {
      const error = _error;
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
      return { success: false, error: "Failed to create comment" };
    }
  }

  // Update comment (admin only)
  async updateComment(commentId, updates) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select()
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
      return { success: false, error: "Failed to update comment" };
    }
  }

  // Delete comment (admin only)
  async deleteComment(commentId) {
    try {
      // Get comment details first to update blog post count
      const { data: comment } = await supabase
        .from("comments")
        .select("blog_post_id")
        .eq("id", commentId)
        .single();

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update comment count for blog post
      if (comment?.blog_post_id) {
        await this.updateCommentCount(comment.blog_post_id);
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
      return { success: false, error: "Failed to delete comment" };
    }
  }

  // Toggle like for comment
  async toggleLike(commentId, visitorIp, userAgent = "") {
    try {
      if (USE_API) {
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/likes/toggle",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              content_type: "comment",
              content_id: commentId,
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
        content_type: "comment",
        content_id: commentId,
        visitor_ip_addr: visitorIp,
        user_agent_str: userAgent,
      });
      if (error) {
        return { success: false, error: error.message };
      }
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

  // Check if user has liked comment
  async checkIfLiked(commentId, visitorIp) {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("comment_id", commentId)
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

  // Get all comments (admin only)
  async getAllComments() {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          blog_post:blog_posts(title, slug)
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
      return { success: false, error: "Failed to load comments" };
    }
  }

  // Approve/disapprove comment (admin only)
  async moderateComment(commentId, isApproved) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .update({
          is_approved: isApproved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update comment count for blog post
      if (data?.blog_post_id) {
        await this.updateCommentCount(data.blog_post_id);
      }

      return { success: true, data };
    } catch (_error) {
      if (
        _error?.message?.includes("Failed to fetch") ||
        _error?.message?.includes("NetworkError") ||
        (_error?.name === "TypeError" && _error?.message?.includes("fetch"))
      ) {
        return {
          success: false,
          error:
            "Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.",
        };
      }
      return { success: false, error: "Failed to moderate comment" };
    }
  }

  // Update comment count for blog post
  async updateCommentCount(blogPostId) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id")
        .eq("blog_post_id", blogPostId)
        .eq("is_approved", true);

      if (error) {
        // Silently skip count update but surface via warn for observability
        console.warn("Failed to count comments:", error);
        return;
      }

      const commentCount = data?.length || 0;

      await supabase
        .from("blog_posts")
        .update({ comment_count: commentCount })
        .eq("id", blogPostId);
    } catch (_error) {
      console.warn("Failed to update comment count:", _error); // Removed unused variable
    }
  }

  // Get visitor IP (fallback method)
  async getVisitorIp() {
    try {
      // Try to get IP from a public API
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || "unknown";
    } catch {
      // Fallback to a simple hash of user agent and timestamp
      const fallback = `${navigator.userAgent || "unknown"}-${Date.now()}`;
      return btoa(fallback).substring(0, 15);
    }
  }

  // Subscribe to real-time comment updates
  subscribeToComments(blogPostId, callback) {
    const channel = supabase
      .channel(`comments:${blogPostId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `blog_post_id=eq.${blogPostId}`,
        },
        callback,
      )
      .subscribe();

    return channel;
  }

  // Unsubscribe from real-time updates
  unsubscribeFromComments(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
}

const commentService = new CommentService();
export default commentService;
