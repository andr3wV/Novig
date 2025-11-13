export function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="border rounded-none p-4 bg-card animate-pulse"
          >
            {/* Header */}
            <div className="space-y-2 mb-4">
              <div className="h-5 w-40 bg-muted rounded-none" />
              <div className="h-3 w-28 bg-muted rounded-none" />
            </div>
            {/* Stats row */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-10 w-24 bg-muted rounded-none" />
                <div className="h-3 w-32 bg-muted rounded-none" />
              </div>
              <div className="h-12 w-12 bg-muted rounded-none" />
            </div>
            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-6 w-20 bg-muted rounded-none" />
              ))}
            </div>
            {/* Chart placeholder */}
            <div className="h-64 w-full bg-muted rounded-none" />
          </div>
        ))}
      </div>
    </div>
  )
}


