"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";
import type { ReviewItem } from "@/lib/product-data";

function RatingBar({ star, pct }: { star: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-nordstrom-gray-700 w-3 text-right">{star}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#C8A951" stroke="#C8A951" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <div className="flex-1 h-1.5 bg-nordstrom-gray-200 overflow-hidden">
        <div className="h-full bg-nordstrom-black transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-nordstrom-gray-500 w-6 text-right">{pct}%</span>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="py-6 border-b border-nordstrom-gray-200 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <StarRating rating={review.rating} />
          <p className="text-xs font-medium text-nordstrom-black mt-1.5">{review.title}</p>
        </div>
        {review.verified && (
          <span className="text-[9px] tracking-widest uppercase text-nordstrom-gray-500 border border-nordstrom-gray-200 px-1.5 py-0.5 flex-shrink-0 ml-3">
            Verified
          </span>
        )}
      </div>
      <p className="text-xs text-nordstrom-gray-700 leading-relaxed mb-3">{review.body}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-[10px] text-nordstrom-gray-500">{review.author} · {review.date}</span>
        <span className="text-[10px] text-nordstrom-gray-500">Size: {review.size}</span>
        <button className="text-[10px] text-nordstrom-gray-500 hover:text-nordstrom-black transition-colors">
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
}

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: ReviewItem[];
}

const SORT_OPTIONS = ["Most Helpful", "Most Recent", "Highest Rating", "Lowest Rating"];

export default function ReviewsSection({ rating, reviewCount, breakdown, reviews }: ReviewsSectionProps) {
  const [sort, setSort] = useState("Most Helpful");
  const [filterStar, setFilterStar] = useState<number | null>(null);

  const filtered = filterStar
    ? reviews.filter((r) => r.rating === filterStar)
    : reviews;

  return (
    <section className="py-10 border-t border-nordstrom-gray-200">
      <h2 className="text-lg font-light text-nordstrom-black mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Overall score */}
        <div className="flex flex-col items-center justify-center py-6 border border-nordstrom-gray-200">
          <p className="text-5xl font-light text-nordstrom-black">{rating.toFixed(1)}</p>
          <StarRating rating={rating} />
          <p className="text-xs text-nordstrom-gray-500 mt-2">{reviewCount.toLocaleString()} reviews</p>
          <button className="mt-4 text-xs tracking-widest uppercase border border-nordstrom-black px-5 py-2 hover:bg-nordstrom-black hover:text-white transition-colors">
            Write a Review
          </button>
        </div>

        {/* Rating breakdown */}
        <div className="md:col-span-2 flex flex-col justify-center gap-2 px-2">
          {([5, 4, 3, 2, 1] as const).map((star) => (
            <button
              key={star}
              onClick={() => setFilterStar(filterStar === star ? null : star)}
              className={`block w-full transition-opacity ${filterStar && filterStar !== star ? "opacity-40" : ""}`}
            >
              <RatingBar star={star} pct={breakdown[star]} />
            </button>
          ))}
        </div>
      </div>

      {/* Sort + filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-nordstrom-gray-200">
        <div className="flex items-center gap-2">
          {filterStar && (
            <button
              onClick={() => setFilterStar(null)}
              className="flex items-center gap-1.5 text-xs border border-nordstrom-gray-300 px-3 py-1.5 hover:border-nordstrom-black"
            >
              {filterStar} star
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <p className="text-xs text-nordstrom-gray-500">
            {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="review-sort" className="text-xs text-nordstrom-gray-500">Sort:</label>
          <select
            id="review-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs border border-nordstrom-gray-300 px-3 py-1.5 bg-white focus:outline-none hover:border-nordstrom-black transition-colors"
          >
            {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Review cards */}
      <div>
        {filtered.length === 0 ? (
          <p className="text-sm text-nordstrom-gray-500 py-8 text-center">No reviews match that filter.</p>
        ) : (
          filtered.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </section>
  );
}
