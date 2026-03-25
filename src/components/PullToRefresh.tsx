"use client";

import { useState, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null && !refreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        setPullY(Math.min(distance, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullY > 60 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen relative"
    >
      <div 
        className="absolute top-0 left-0 w-full flex justify-center overflow-hidden transition-all duration-300 ease-out z-50 pointer-events-none"
        style={{ height: pullY > 0 ? `${pullY}px` : (refreshing ? '60px' : '0px') }}
      >
        <div className="flex items-center justify-center pt-4">
          <Loader2 
            className={`w-6 h-6 text-blue-500 ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullY * 2}deg)` }} 
          />
        </div>
      </div>
      <div className="transition-transform duration-300 ease-out" style={{ transform: `translateY(${refreshing ? 60 : pullY * 0.5}px)` }}>
        {children}
      </div>
    </div>
  );
}
