import React from 'react';

/**
 * SmoothTransition - Wrapper for smooth page/component transitions
 * 
 * @param {boolean} isVisible - Whether the content is visible
 * @param {string} type - Transition type: 'fade', 'slide', 'scale'
 * @param {number} duration - Transition duration in ms
 */
const SmoothTransition = ({
    children,
    isVisible = true,
    type = 'fade',
    duration = 300,
    className = '',
}) => {
    const getTransitionStyles = () => {
        const baseStyles = {
            transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        };

        if (!isVisible) {
            switch (type) {
                case 'slide':
                    return {
                        ...baseStyles,
                        opacity: 0,
                        transform: 'translateY(20px)',
                    };
                case 'scale':
                    return {
                        ...baseStyles,
                        opacity: 0,
                        transform: 'scale(0.95)',
                    };
                case 'fade':
                default:
                    return {
                        ...baseStyles,
                        opacity: 0,
                    };
            }
        }

        return {
            ...baseStyles,
            opacity: 1,
            transform: 'translateY(0) scale(1)',
        };
    };

    return (
        <div className={className} style={getTransitionStyles()}>
            {children}
        </div>
    );
};

export default SmoothTransition;
