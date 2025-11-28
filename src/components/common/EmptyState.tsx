interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="text-neon-blue/50 mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-md">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg font-medium rounded-lg hover:shadow-neon transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
