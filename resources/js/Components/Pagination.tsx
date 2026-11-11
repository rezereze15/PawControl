interface PaginationProps {
  itemCount: number
  totalEntries: number
  lastPage: number
  className: string
  summaryClassName?: string
}

export default function Pagination({
  itemCount,
  totalEntries,
  lastPage,
  className,
  summaryClassName = "text-sm text-gray-500",
}: PaginationProps) {
  return (
    <div className={className}>
      <p className={summaryClassName}>
        Showing 1 to {itemCount} of {totalEntries} entries
      </p>
      <div className="flex items-center gap-1">
        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
          &lt; Previous
        </button>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`w-8 h-8 text-xs rounded-lg font-semibold ${
              page === 1
                ? "bg-[#1a0a3c] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        <span className="px-1 text-gray-400 text-xs">...</span>
        <button className="w-8 h-8 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
          {lastPage}
        </button>
        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
          Next &gt;
        </button>
      </div>
    </div>
  )
}
