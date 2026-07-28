import React from 'react';

export default function Preloader({ message = 'Loading...', fullScreen = true }) {
    // Split message into array for dot animation on the word "Loading"
    const dotParts = message.split('');
    const containerClasses = fullScreen
        ? 'fixed inset-0 z-[9999] bg-white'
        : 'absolute inset-0 z-20 bg-white';

    return (
        <div
            className={containerClasses}
            role="status"
            aria-live="polite"
        >
            {/* Table-based centering — no flex/grid used */}
            <table className="h-full w-full">
                <tbody>
                    <tr>
                        <td className="h-full w-full align-middle text-center">
                            {/* NAI water-pouring animation */}
                            <div className="nai-preloader-wrapper">
                                <span className="nai-preloader-outline" aria-hidden="true">NAI</span>
                                <span className="nai-preloader-fill" aria-hidden="true">NAI</span>
                            </div>
                            {/* Loading message with animated dots under the NAI logo */}
                            <table className="mx-auto">
                                <tbody>
                                    <tr>
                                        <td className="pt-6 text-center">
                                            <span className="text-sm font-medium tracking-wider text-black/60">
                                                {dotParts.map((char, i) => {
                                                    // Animate only the '.' characters as dots
                                                    if (char === '.') {
                                                        return (
                                                            <span key={i} className="nai-preloader-dot">.</span>
                                                        );
                                                    }
                                                    return <span key={i}>{char}</span>;
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

