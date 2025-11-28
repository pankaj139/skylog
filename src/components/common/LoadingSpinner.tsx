export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-neon-blue border-t-transparent rounded-full animate-spin`}
            />
        </div>
    );
}
