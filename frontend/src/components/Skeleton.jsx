import './Skeleton.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-line-sm" style={{ marginBottom: '0.5rem' }} />
      <div className="skeleton-line skeleton-line-lg" style={{ marginBottom: '0.25rem' }} />
      <div className="skeleton-bar" />
      <div className="skeleton-btn" />
    </div>
  );
}
