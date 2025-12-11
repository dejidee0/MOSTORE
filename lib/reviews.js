/**
 * Reviews Utility Functions
 * Handles all review-related operations for the Mostore platform
 */

import { supabase } from "./supabase-client"; // Adjust import path as needed

/**
 * Check if a user has purchased a specific product
 * @param {string} userId - The user's UUID
 * @param {number} productId - The product's ID
 * @returns {Promise<boolean>} - True if user has purchased the product
 */
export async function hasUserPurchasedProduct(userId, productId) {
  try {
    if (!userId || !productId) {
      return false;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", userId)
      .eq("payment_status", "success") // Only count successful payments
      .limit(1);

    if (error) throw error;

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking product purchase:", error);
    return false;
  }
}

/**
 * Check if a user has already reviewed a product
 * @param {string} userId - The user's UUID
 * @param {number} productId - The product's ID
 * @returns {Promise<boolean>} - True if user has already reviewed
 */
export async function hasUserReviewedProduct(userId, productId) {
  try {
    if (!userId || !productId) {
      return false;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product", productId)
      .limit(1);

    if (error) throw error;

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking user review:", error);
    return false;
  }
}

/**
 * Create a new review for a product
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.productId - The product's ID
 * @param {string} reviewData.userId - The user's UUID
 * @param {string} reviewData.review - The review text
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {boolean} reviewData.anonymous - Whether review is anonymous
 * @returns {Promise<Object>} - Created review or error
 */
export async function createReview({
  productId,
  userId,
  review,
  rating,
  anonymous = false,
}) {
  try {
    // Validate required fields
    if (!productId || !userId || !review) {
      throw new Error("Product ID, User ID, and review text are required");
    }

    // Check if user has purchased the product
    const hasPurchased = await hasUserPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      throw new Error("You must purchase this product before leaving a review");
    }

    // Check if user has already reviewed this product
    const hasReviewed = await hasUserReviewedProduct(userId, productId);
    if (hasReviewed) {
      throw new Error("You have already reviewed this product");
    }

    // Create the review
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product: productId,
        user_id: userId,
        review: review,
        review_count: rating || null,
        anonymous: anonymous,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all reviews from the platform
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Object>} - Reviews data or error
 */
export async function fetchAllReviews({ limit = 50, offset = 0 } = {}) {
  try {
    const { data, error, count } = await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          username
        ),
        products:product (
          id,
          name,
          images
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: count || 0,
      hasMore: count > offset + limit,
    };
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Fetch reviews for a specific product
 * @param {number} productId - The product's ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Object>} - Product reviews or error
 */
export async function fetchProductReviews(
  productId,
  { limit = 20, offset = 0 } = {}
) {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const { data, error, count } = await supabase
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          username
        )
      `,
        { count: "exact" }
      )
      .eq("product", productId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: count || 0,
      hasMore: count > offset + limit,
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get the total number of reviews for a product
 * @param {number} productId - The product's ID
 * @returns {Promise<number>} - Number of reviews
 */
export async function getProductReviewCount(productId) {
  try {
    if (!productId) {
      return 0;
    }

    const { count, error } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("product", productId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Error getting product review count:", error);
    return 0;
  }
}

/**
 * Get average rating for a product
 * @param {number} productId - The product's ID
 * @returns {Promise<Object>} - Average rating and count
 */
export async function getProductAverageRating(productId) {
  try {
    if (!productId) {
      return { average: 0, count: 0 };
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("review_count")
      .eq("product", productId)
      .not("review_count", "is", null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, curr) => acc + (curr.review_count || 0), 0);
    const average = sum / data.length;

    return {
      average: parseFloat(average.toFixed(1)),
      count: data.length,
    };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return { average: 0, count: 0 };
  }
}

/**
 * Get reviews by a specific user
 * @param {string} userId - The user's UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - User reviews or error
 */
export async function fetchUserReviews(
  userId,
  { limit = 20, offset = 0 } = {}
) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data, error, count } = await supabase
      .from("reviews")
      .select(
        `
        *,
        products:product (
          id,
          name,
          images
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: count || 0,
      hasMore: count > offset + limit,
    };
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update a review
 * @param {number} reviewId - The review's ID
 * @param {string} userId - The user's UUID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated review or error
 */
export async function updateReview(reviewId, userId, updates) {
  try {
    if (!reviewId || !userId) {
      throw new Error("Review ID and User ID are required");
    }

    // Verify the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError) throw fetchError;

    if (existingReview.user_id !== userId) {
      throw new Error("You can only edit your own reviews");
    }

    // Update the review
    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a review
 * @param {number} reviewId - The review's ID
 * @param {string} userId - The user's UUID (for authorization)
 * @returns {Promise<Object>} - Success status or error
 */
export async function deleteReview(reviewId, userId) {
  try {
    if (!reviewId || !userId) {
      throw new Error("Review ID and User ID are required");
    }

    // Verify the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (fetchError) throw fetchError;

    if (existingReview.user_id !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    // Delete the review
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get rating distribution for a product
 * @param {number} productId - The product's ID
 * @returns {Promise<Object>} - Rating distribution (1-5 stars)
 */
export async function getProductRatingDistribution(productId) {
  try {
    if (!productId) {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("review_count")
      .eq("product", productId)
      .not("review_count", "is", null);

    if (error) throw error;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (data) {
      data.forEach((review) => {
        const rating = review.review_count;
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });
    }

    return distribution;
  } catch (error) {
    console.error("Error getting rating distribution:", error);
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
}

/**
 * Check if user can review a product
 * @param {string} userId - The user's UUID
 * @param {number} productId - The product's ID
 * @returns {Promise<Object>} - Eligibility status with reason
 */
export async function canUserReviewProduct(userId, productId) {
  try {
    if (!userId || !productId) {
      return {
        canReview: false,
        reason: "Invalid user or product",
      };
    }

    const hasPurchased = await hasUserPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return {
        canReview: false,
        reason: "You must purchase this product before leaving a review",
      };
    }

    const hasReviewed = await hasUserReviewedProduct(userId, productId);
    if (hasReviewed) {
      return {
        canReview: false,
        reason: "You have already reviewed this product",
      };
    }

    return {
      canReview: true,
      reason: "You can review this product",
    };
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return {
      canReview: false,
      reason: "Error checking eligibility",
    };
  }
}
