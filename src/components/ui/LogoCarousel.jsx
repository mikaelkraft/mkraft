import { useEffect, useState, useRef } from "react";

const LogoCarousel = ({
  images = [],
  autoPlay = true,
  speed = 3000,
  showDots = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);

  // Create infinite loop by duplicating images
  const infiniteImages =
    images.length > 0 ? [...images, ...images, ...images] : [];
  const startIndex = images.length; // Start from the middle set

  useEffect(() => {
    if (images.length > 0) {
      setCurrentIndex(startIndex);
    }
  }, [images.length, startIndex]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // If we've reached the end of the last set, reset to the beginning of the middle set
        if (nextIndex >= infiniteImages.length) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(startIndex);
          }, 50);
          return startIndex;
        }

        // If we've completed the middle set, smoothly transition
        if (nextIndex >= startIndex + images.length) {
          setTimeout(() => {
            setIsTransitioning(false);
            setCurrentIndex(startIndex);
          }, speed);
        }

        return nextIndex;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, images.length, speed, infiniteImages.length, startIndex]);

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-surface/20 rounded-lg border border-border-accent/20">
        <p className="text-text-secondary">No logos to display</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="flex items-center justify-center h-32 p-4 bg-surface/20 rounded-lg border border-border-accent/20">
        <Image
          src={images[0]}
          alt="Logo"
          className="max-h-20 max-w-full object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>
    );
  }

  const itemWidth = 100 / Math.min(images.length, 4);

  return (
    <div className="relative overflow-hidden rounded-lg bg-surface/20 border border-border-accent/20">
      {/* Infinite scroll container */}
      <div className="flex h-32 items-center">
        <div
          ref={carouselRef}
          className={`flex transition-transform duration-1000 ease-in-out ${isTransitioning ? "" : "transition-none"}`}
          style={{
            transform: `translateX(-${currentIndex * itemWidth}%)`,
            width: `${infiniteImages.length * itemWidth}%`,
          }}
        >
          {infiniteImages.map((image, index) => (
            <div
              key={`${index}-${image}`}
              className="flex-shrink-0 flex items-center justify-center p-4 group"
              style={{ width: `${100 / infiniteImages.length}%` }}
            >
              <Image
                src={image}
                alt={`Logo ${(index % images.length) + 1}`}
                className="max-h-20 max-w-full object-contain filter hover:brightness-110 transition-all duration-300 group-hover:scale-110 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots - only show if requested and more than 4 images */}
      {showDots && images.length > 4 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(startIndex + index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                (currentIndex - startIndex) % images.length === index
                  ? "bg-primary scale-125"
                  : "bg-border-accent/40 hover:bg-border-accent/60"
              }`}
              aria-label={`View logo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlays for seamless effect */}
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-surface/20 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-surface/20 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default LogoCarousel;
