import React, { useEffect, useRef, useState } from 'react';

/**
 * RevealAnimation - Scroll-triggered reveal animation wrapper
 * 
 * @param {string} direction - Animation direction: 'up', 'down', 'left', 'right', 'scale'
 * @param {number} delay - Animation delay in ms
 * @param {number} threshold - Intersection threshold (0-1)
 * @param {boolean} once - Only animate once
 */
const RevealAnimation = ({
    children,
    direction = 'up',
    delay = 0,
    threshold = 0.1,
    once = true,
    className = '',
}) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    const getAnimationClass = () => {
        switch (direction) {
            case 'left':
                return 'reveal-left';
            case 'right':
                return 'reveal-right';
            case 'scale':
                return 'reveal-scale';
            case 'down':
            case 'up':
            default:
                return 'reveal';
        }
    };

    return (
        <div
            ref={ref}
            className={`${getAnimationClass()} ${isVisible ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default RevealAnimation;
