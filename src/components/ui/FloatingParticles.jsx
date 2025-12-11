import React, { useMemo } from 'react';

/**
 * FloatingParticles - Scattered animated particles effect
 * Inspired by Google Antigravity landing page
 */
const FloatingParticles = ({
    count = 100,
    color = '#3b82f6',
    minSize = 2,
    maxSize = 5,
    className = '',
    speed = 'slow', // 'slow', 'medium', 'fast'
}) => {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: minSize + Math.random() * (maxSize - minSize),
            delay: Math.random() * 5,
            duration: speed === 'fast' ? 2 + Math.random() * 2 : speed === 'medium' ? 4 + Math.random() * 3 : 6 + Math.random() * 4,
            opacity: 0.3 + Math.random() * 0.7,
        }));
    }, [count, minSize, maxSize, speed]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full animate-float"
                    style={{
                        left: particle.left,
                        top: particle.top,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: color,
                        opacity: particle.opacity,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default FloatingParticles;
