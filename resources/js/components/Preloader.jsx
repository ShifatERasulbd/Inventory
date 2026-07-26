import React from 'react';

export default function Preloader({ message = 'Loading...' }) {
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white"
            role="status"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-4">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"
                    aria-hidden="true"
                />
                <div className="text-sm font-medium">{message}</div>
            </div>
        </div>
    );
}

