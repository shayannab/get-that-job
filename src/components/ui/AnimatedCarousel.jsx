import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * AnimatedCarousel - A smooth, auto-advancing carousel component
 * 
 * @param {Array} items - Array of items to display (can be components or content)
 * @param {boolean} autoPlay - Whether to auto-advance slides
 * @param {number} interval - Time between auto-advances in ms
 * @param {boolean} showDots - Whether to show navigation dots
 * @param {boolean} showArrows - Whether to show navigation arrows
 * @param {function} renderItem - Function to render each item
 */
const AnimatedCarousel = ({
    items = [],
    autoPlay = true,
    interval = 5000,
    showDots = true,
    showArrows = true,
    renderItem,
    className = '',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goToSlide = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    const goToNext = useCallback(() => {
        goToSlide((currentIndex + 1) % items.length);
    }, [currentIndex, items.length, goToSlide]);

    const goToPrev = useCallback(() => {
        goToSlide((currentIndex - 1 + items.length) % items.length);
    }, [currentIndex, items.length, goToSlide]);

    useEffect(() => {
        if (!autoPlay || isPaused || items.length <= 1) return;

        const timer = setInterval(goToNext, interval);
        return () => clearInterval(timer);
    }, [autoPlay, isPaused, interval, goToNext, items.length]);

    if (items.length === 0) return null;

    return (
        <div
            className={`carousel ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Carousel Inner */}
            <div
                className="carousel-inner"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item, index) => (
                    <div key={index} className="carousel-slide">
                        {renderItem ? renderItem(item, index) : item}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {showArrows && items.length > 1 && (
                <>
                    <button
                        className="carousel-arrow prev"
                        onClick={goToPrev}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        className="carousel-arrow next"
                        onClick={goToNext}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Navigation Dots */}
            {showDots && items.length > 1 && (
                <div className="carousel-dots">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnimatedCarousel;
