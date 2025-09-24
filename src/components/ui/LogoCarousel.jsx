import React, { useEffect, useState } from 'react';
import Image from '../AppImage';

const LogoCarousel = ({ images = [], autoPlay = true, speed = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, images.length, speed]);

  if (!images.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-surface/20 rounded-lg border border-border-accent/20">
        <p className="text-text-secondary">No logos to display</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="flex items-center justify-center h-32 p-4">
        <Image
          src={images[0]}
          alt="Logo"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-surface/20 border border-border-accent/20">
      {/* Infinite scroll container */}
      <div className="flex h-32 items-center">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / Math.min(images.length, 4))}%)`,
            width: `${Math.max(images.length, 4) * (100 / Math.min(images.length, 4))}%`
          }}
        >
          {/* Render images in a continuous loop */}
          {[...images, ...images].map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center justify-center p-4"
              style={{ width: `${100 / Math.max(images.length, 4)}%` }}
            >
              <Image
                src={image}
                alt={`Logo ${(index % images.length) + 1}`}
                className="max-h-20 max-w-full object-contain filter hover:brightness-110 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      {images.length > 4 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-border-accent/40 hover:bg-border-accent/60'
              }`}
              aria-label={`View logo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LogoCarousel;