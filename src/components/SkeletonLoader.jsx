export function SkeletonCard() {
  return (
    <div className="p-4 border-border/50 bg-card/80 card-hover rounded-lg animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <div className="w-5 h-5 bg-muted rounded"></div>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-muted rounded mb-2 w-12"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSocialLinks() {
  return (
    <div className="p-4 border-border/50 bg-card/80 rounded-lg animate-pulse">
      <div className="h-4 bg-muted rounded mb-3 w-24"></div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 rounded-lg bg-muted"></div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonContactSection() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
      <SkeletonSocialLinks />
    </div>
  );
}