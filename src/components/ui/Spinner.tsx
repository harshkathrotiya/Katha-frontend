export function Spinner({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full ${className}`}
            role="status"
            aria-label="loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
