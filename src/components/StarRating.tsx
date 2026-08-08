export default function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = !filled && star === Math.ceil(rating) && rating % 1 >= 0.5;
          return (
            <svg
              key={star}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill={filled ? "#C8A951" : "none"}
              stroke="#C8A951"
              strokeWidth="1.5"
              className="flex-shrink-0"
            >
              {partial ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="#C8A951" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill={`url(#half-${star})`}
                  />
                </>
              ) : (
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              )}
            </svg>
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className="text-[11px] text-nordstrom-gray-500">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
