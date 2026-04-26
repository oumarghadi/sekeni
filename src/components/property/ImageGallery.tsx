'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = React.useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-[500px] w-full overflow-hidden rounded-[2.5rem] bg-[var(--surface-low)] group">
        <img
          src={images[activeImage]}
          alt="Property"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute bottom-6 right-6">
           <button className="glass px-6 py-3 rounded-2xl text-xs font-bold text-[var(--primary)] shadow-lg hover:bg-white transition-all flex items-center gap-2">
             <Plus className="w-4 h-4" />
             عرض جميع الصور
           </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.slice(0, 4).map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(index)}
            className={cn(
              "relative h-32 rounded-2xl overflow-hidden ring-offset-2 transition-all",
              activeImage === index ? "ring-2 ring-[var(--secondary)]" : "opacity-60 hover:opacity-100"
            )}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                +{images.length - 4}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
