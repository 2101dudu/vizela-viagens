"use client";

import React, { useState, useEffect, useRef } from "react";

interface CarouselProps {
  children: React.ReactNode;
}

export default function _Carousel({ children }: CarouselProps) {
  const items = React.Children.toArray(children);
  const totalSlides = items.length;

  // currentIndex tracks which slide (from the full list) is in the center.
  const [currentIndex, setCurrentIndex] = useState(0);
  // offset controls horizontal translation:
  // 0% shows the [left, center, right] window with center in place.
  // -33.33% slides leftward by one card (so center moves to left).
  // +33.33% slides rightward by one card.
  const [offset, setOffset] = useState(0);
  // Whether CSS transitions are enabled (used to disable transition when resetting offset).
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  // Prevent multiple navigation actions during an animation.
  const [animating, setAnimating] = useState(false);
  // Pause autoplay when the user hovers.
  const [isHovered, setIsHovered] = useState(false);
  // Ref for autoplay interval.
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  // Ref and state to fix container height based on center slide.
  const centerSlideRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Calculate indices for left and right slides.
  const leftIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  const rightIndex = (currentIndex + 1) % totalSlides;

  // Update the container height based on the center slide.
  useEffect(() => {
    if (centerSlideRef.current) {
      setContainerHeight(centerSlideRef.current.clientHeight);
    }
  }, [currentIndex, offset]);

  // Autoplay every 2 seconds when not hovered.
  useEffect(() => {
    if (!isHovered) {
      autoplayRef.current = setInterval(() => {
        handleNext();
      }, 2000);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, currentIndex]);

  // When a transition ends, update the current index and reset offset.
  const handleTransitionEnd = () => {
    if (offset === -33.33) {
      // We moved next: center slide becomes the right slide.
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    } else if (offset === 33.33) {
      // We moved previous: center slide becomes the left slide.
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
    // Disable transition to reset slider position instantly.
    setTransitionEnabled(false);
    setOffset(0);
    // Re-enable transition on next tick and allow interactions.
    setTimeout(() => {
      setTransitionEnabled(true);
      setAnimating(false);
    }, 20);
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setOffset(-33.33);
  };

  const handlePrev = () => {
    if (animating) return;
    setAnimating(true);
    setOffset(33.33);
  };

  // Clicking a dot jumps directly to that slide.
  // If the target slide is adjacent, animate the transition.
  // Otherwise, jump instantly.
  const handleDotClick = (index: number) => {
    if (index === currentIndex || animating) return;
    const nextIndex = (currentIndex + 1) % totalSlides;
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    if (index === nextIndex) {
      handleNext();
    } else if (index === prevIndex) {
      handlePrev();
    } else {
      setTransitionEnabled(false);
      setCurrentIndex(index);
      setOffset(0);
      setTimeout(() => {
        setTransitionEnabled(true);
      }, 20);
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: containerHeight || "auto" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider container: displays 3 slides side-by-side */}
      <div
        className="flex"
        style={{
          transform: `translateX(${offset}%)`,
          transition: transitionEnabled
            ? "transform 500ms ease-in-out"
            : "none",
          // Ensure container is wide enough to hold 3 slides,
          // each slide takes 33.33% of the parent.
          width: "100%",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* Left slide */}
        <div className="flex-shrink-0 w-1/3">{items[leftIndex]}</div>
        {/* Center slide */}
        <div className="flex-shrink-0 w-1/3" ref={centerSlideRef}>
          {items[currentIndex]}
        </div>
        {/* Right slide */}
        <div className="flex-shrink-0 w-1/3">{items[rightIndex]}</div>
      </div>

      {/* Navigation Arrows */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
        onClick={handlePrev}
      >
        &#8592;
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full"
        onClick={handleNext}
      >
        &#8594;
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-gray-800" : "bg-gray-400"
            }`}
            onClick={() => handleDotClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}
