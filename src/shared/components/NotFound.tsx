import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="widget-card widget-body text-center py-16 max-w-md mx-auto mt-12">
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-sm text-muted mb-6">There is nothing at this address.</p>
      <Link
        to="/"
        className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
      >
        Back to the dashboard
      </Link>
    </div>
  );
}
