import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    isLoading?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    children,
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-neon-blue to-neon-cyan text-dark-bg hover:shadow-neon',
        secondary: 'glass border border-neon-blue/30 text-white hover:border-neon-blue',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'text-neon-blue hover:bg-dark-surface',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
