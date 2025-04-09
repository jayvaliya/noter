import React from 'react';

interface LoadingProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    fullScreen?: boolean;
}

const Loading = ({ size = 'medium', color = 'emerald-500', fullScreen = false }: LoadingProps) => {
    // Map sizes to dimensions
    const dimensions = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12',
    };

    // Use spinner fallback - more reliable than Lottie which requires external files
    const spinnerClass = `animate-spin rounded-full ${dimensions[size]} border-2 border-t-transparent border-${color}`;

    // Decide if this should be centered on screen
    if (fullScreen) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className={spinnerClass}></div>
            </div>
        );
    }

    // Regular inline spinner
    return <div className={spinnerClass}></div>;
};

export default Loading;