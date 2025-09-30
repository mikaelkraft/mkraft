import supabase from "./supabase";
import { api } from "./api/client";
const USE_API = import.meta.env.VITE_USE_API === "true";

class SlideService {
  // Get all published slides (public access)
  async getPublishedSlides() {
    try {
      if (USE_API) {
        const data = await api.get("/slides", { published: true });
        return { success: true, data: data || [] };
      }
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });

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
      return { success: false, error: "Failed to load slides" };
    }
  }

  // Get all slides (admin access)
  async getAllSlides() {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("display_order", { ascending: true });

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
      return { success: false, error: "Failed to load slides" };
    }
  }

  // Get single slide by ID
  async getSlide(slideId) {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("id", slideId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Increment view count
      await this.incrementViewCount(slideId);

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
      return { success: false, error: "Failed to load slide" };
    }
  }

  // Create new slide (admin only)
  async createSlide(slideData) {
    try {
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        if (!token) return { success: false, error: "Authentication required" };
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/slides",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(slideData),
          },
        );
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, data };
      }
      // Get the next display order
      const { data: maxOrderData } = await supabase
        .from("hero_slides")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

      const { data, error } = await supabase
        .from("hero_slides")
        .insert({
          ...slideData,
          display_order: slideData.display_order || nextOrder,
        })
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
      return { success: false, error: "Failed to create slide" };
    }
  }

  // Update slide (admin only)
  async updateSlide(slideId, updates) {
    try {
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        if (!token) return { success: false, error: "Authentication required" };
        const url = new URL(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/slides",
          window.location.origin,
        );
        url.searchParams.set("id", slideId);
        const res = await fetch(url.toString(), {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });
        if (!res.ok) return { success: false, error: await res.text() };
        const data = await res.json();
        return { success: true, data };
      }
      const { data, error } = await supabase
        .from("hero_slides")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slideId)
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
      return { success: false, error: "Failed to update slide" };
    }
  }

  // Delete slide (admin only)
  async deleteSlide(slideId) {
    try {
      if (USE_API) {
        const token = (await supabase.auth.getSession()).data.session
          ?.access_token;
        if (!token) return { success: false, error: "Authentication required" };
        const url = new URL(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/slides",
          window.location.origin,
        );
        url.searchParams.set("id", slideId);
        const res = await fetch(url.toString(), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { success: false, error: await res.text() };
        // Reorder not necessary server-side returns new order; client can ignore
        return { success: true };
      }
      const { error } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", slideId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Reorder remaining slides
      await this.reorderSlides();

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
      return { success: false, error: "Failed to delete slide" };
    }
  }

  // Reorder slide (admin only)
  async updateSlideOrder(slideId, newOrder) {
    try {
      // Get current slide
      const { data: currentSlide } = await supabase
        .from("hero_slides")
        .select("display_order")
        .eq("id", slideId)
        .single();

      if (!currentSlide) {
        return { success: false, error: "Slide not found" };
      }

      const _currentOrder = currentSlide.display_order; // prefixed underscore to signal intentional non-use

      // Get all slides to reorder
      const { data: allSlides } = await supabase
        .from("hero_slides")
        .select("id, display_order")
        .order("display_order", { ascending: true });

      if (!allSlides) {
        return { success: false, error: "Failed to get slides for reordering" };
      }

      // Create new order array
      const reorderedSlides = allSlides.filter((slide) => slide.id !== slideId);
      reorderedSlides.splice(newOrder - 1, 0, {
        id: slideId,
        display_order: newOrder,
      });

      // Update all slides with new orders
      const updates = reorderedSlides.map((slide, index) => ({
        id: slide.id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from("hero_slides")
          .update({
            display_order: update.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", update.id);
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
      return { success: false, error: "Failed to reorder slide" };
    }
  }

  // Reorder all slides to fix gaps
  async reorderSlides() {
    try {
      const { data: slides } = await supabase
        .from("hero_slides")
        .select("id")
        .order("display_order", { ascending: true });

      if (!slides) return;

      for (let i = 0; i < slides.length; i++) {
        await supabase
          .from("hero_slides")
          .update({
            display_order: i + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", slides[i].id);
      }
    } catch (error) {
      console.warn("Failed to reorder slides:", error);
    }
  }

  // Increment view count
  async incrementViewCount(slideId) {
    try {
      if (USE_API) {
        await fetch(
          (import.meta.env.VITE_API_BASE_URL || "/api") + "/views/increment",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              content_type: "hero_slide",
              content_id: slideId,
            }),
          },
        );
        return;
      }
      await supabase.rpc("increment_view_count", {
        content_type: "hero_slide",
        content_id: slideId,
      });
    } catch (error) {
      // Silently fail view count increment
      console.warn("Failed to increment slide view count:", error);
    }
  }

  // Get slide statistics
  async getSlideStats() {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("status, view_count")
        .eq("status", "published");

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = data?.reduce(
        (acc, slide) => {
          acc.total += 1;
          acc.totalViews += slide.view_count || 0;
          return acc;
        },
        { total: 0, totalViews: 0 },
      ) || { total: 0, totalViews: 0 };

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
      return { success: false, error: "Failed to get slide statistics" };
    }
  }

  // Bulk update slide status (admin only)
  async bulkUpdateStatus(slideIds, status) {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .in("id", slideIds)
        .select();

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
      return { success: false, error: "Failed to bulk update slides" };
    }
  }
}

const slideService = new SlideService();
export default slideService;
