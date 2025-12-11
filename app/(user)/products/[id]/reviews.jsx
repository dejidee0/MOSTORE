"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { supabase } from "@/lib/supabase-client";
import { Star, Send, Edit2, Trash2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchProductReviews,
  getProductReviewCount,
  getProductAverageRating,
  getProductRatingDistribution,
  canUserReviewProduct,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/reviews";

const StarRating = ({
  rating,
  totalReviews,
  size = "sm",
  interactive = false,
  onRatingChange,
}) => {
  const stars = rating || 0;
  const reviews = totalReviews || 0;
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < stars ? "text-orange-400 fill-current" : "text-gray-300"
          } ${
            interactive
              ? "cursor-pointer hover:text-orange-300 transition-colors"
              : ""
          }`}
          onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
        />
      ))}
      {!interactive && (
        <span className="text-gray-500 text-sm ml-2">
          ({reviews} {reviews === 1 ? "Review" : "Reviews"})
        </span>
      )}
    </div>
  );
};

const RatingDistributionBar = ({ stars, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-16">
        <span className="text-sm text-gray-600">{stars}</span>
        <Star className="w-3 h-3 text-orange-400 fill-current" />
      </div>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
    </div>
  );
};

const ReviewCard = ({ review, currentUser, onEdit, onDelete }) => {
  const isOwnReview = currentUser && review.user_id === currentUser.id;
  const reviewerName = review.anonymous
    ? "Anonymous User"
    : review.profiles?.full_name || review.profiles?.username || "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{reviewerName}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        {isOwnReview && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(review)}
              className="text-blue-600 hover:text-blue-700 p-1"
              title="Edit review"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(review.id)}
              className="text-red-600 hover:text-red-700 p-1"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {review.review_count && (
        <StarRating rating={review.review_count} size="sm" />
      )}

      <p className="text-gray-700 leading-relaxed">{review.review}</p>
    </motion.div>
  );
};

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [canReview, setCanReview] = useState({ canReview: false, reason: "" });
  const [currentUser, setCurrentUser] = useState(null);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const { addToast } = useToast();

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();
  }, []);

  // Fetch reviews and review stats
  useEffect(() => {
    if (productId) {
      fetchReviewsData();
      fetchReviewStats();
    }
  }, [productId]);

  useEffect(() => {
    if (productId && currentUser) {
      checkReviewEligibility();
    }
  }, [productId, currentUser]);

  const fetchReviewsData = async () => {
    setReviewsLoading(true);
    try {
      const result = await fetchProductReviews(productId, { limit: 50 });
      if (result.success) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const count = await getProductReviewCount(productId);
      const avgRating = await getProductAverageRating(productId);
      const distribution = await getProductRatingDistribution(productId);

      setReviewCount(count);
      setAverageRating(avgRating);
      setRatingDistribution(distribution);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  const checkReviewEligibility = async () => {
    if (!currentUser || !productId) return;

    const eligibility = await canUserReviewProduct(currentUser.id, productId);
    setCanReview(eligibility);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      addToast("Please sign in to leave a review", "error");
      return;
    }

    if (!reviewText.trim()) {
      addToast("Please write a review", "error");
      return;
    }

    setSubmittingReview(true);

    try {
      if (editingReviewId) {
        // Update existing review
        const result = await updateReview(editingReviewId, currentUser.id, {
          review: reviewText,
          review_count: reviewRating,
          anonymous: isAnonymous,
        });

        if (result.success) {
          addToast("Review updated successfully!", "success");
          setShowReviewForm(false);
          setEditingReviewId(null);
          resetReviewForm();
          fetchReviewsData();
          fetchReviewStats();
        } else {
          addToast(result.error || "Failed to update review", "error");
        }
      } else {
        // Create new review
        const result = await createReview({
          productId: productId,
          userId: currentUser.id,
          review: reviewText,
          rating: reviewRating,
          anonymous: isAnonymous,
        });

        if (result.success) {
          addToast("Review submitted successfully!", "success");
          setShowReviewForm(false);
          resetReviewForm();
          fetchReviewsData();
          fetchReviewStats();
          checkReviewEligibility();
        } else {
          addToast(result.error || "Failed to submit review", "error");
        }
      }
    } catch (error) {
      addToast("An error occurred", "error");
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewText(review.review);
    setReviewRating(review.review_count || 5);
    setIsAnonymous(review.anonymous || false);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );
    if (!confirmed) return;

    try {
      const result = await deleteReview(reviewId, currentUser.id);

      if (result.success) {
        addToast("Review deleted successfully", "success");
        fetchReviewsData();
        fetchReviewStats();
        checkReviewEligibility();
      } else {
        addToast(result.error || "Failed to delete review", "error");
      }
    } catch (error) {
      addToast("An error occurred", "error");
      console.error("Error deleting review:", error);
    }
  };

  const resetReviewForm = () => {
    setReviewText("");
    setReviewRating(5);
    setIsAnonymous(false);
    setEditingReviewId(null);
  };

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <div className="w-4 h-6 bg-orange-500 rounded"></div>
          Customer Reviews
        </h2>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {averageRating.average.toFixed(1)}
            </div>
            <StarRating rating={averageRating.average} size="lg" />
            <p className="text-gray-600 mt-2">
              Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingDistributionBar
              key={stars}
              stars={stars}
              count={ratingDistribution[stars] || 0}
              total={reviewCount}
            />
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {currentUser ? (
        canReview.canReview ? (
          <div className="mb-6">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Write a Review
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Note:</strong> {canReview.reason}
            </p>
          </div>
        )
      ) : (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">
            <Link
              href="/signin"
              className="text-orange-500 font-semibold hover:underline"
            >
              Sign in
            </Link>{" "}
            to write a review. You must purchase this product first.
          </p>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingReviewId ? "Edit Your Review" : "Write Your Review"}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <StarRating
                  rating={reviewRating}
                  size="lg"
                  interactive
                  onRatingChange={setReviewRating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Post anonymously
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                >
                  {submittingReview
                    ? "Submitting..."
                    : editingReviewId
                    ? "Update Review"
                    : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    resetReviewForm();
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUser={currentUser}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export StarRating for use in the parent component
export { StarRating };
