
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { PostData } from '../types';

interface Props {
  post: PostData;
  onLike: () => void;
  onBookmark: () => void;
}

export const InstagramPost: React.FC<Props> = ({ post, onLike, onBookmark }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback(() => {
    if (scrollRef.current && !isDragging) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      // Precision check to avoid index flickering
      if (width > 0) {
        const index = Math.round(scrollPosition / width);
        if (index !== currentIndex) {
          setCurrentIndex(index);
        }
      }
    }
  }, [isDragging, currentIndex]);

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < post.images.length - 1) {
      scrollTo(currentIndex + 1);
    }
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollSnapType = 'none';
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      scrollRef.current.style.scrollBehavior = 'smooth';
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollRef.current.scrollLeft / width);
      scrollTo(index);
    }
  };

  const onMouseLeave = () => {
    if (isDragging) onMouseUp();
    setShowArrows(false);
  };

  const getAspectRatioClass = () => {
    switch (post.aspectRatio) {
      case '1:1': return 'aspect-square';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-video';
      default: return 'aspect-[4/5]';
    }
  };

  const themeClasses = post.isDarkMode 
    ? {
        bg: 'bg-black',
        border: 'border-[#262626]',
        text: 'text-white',
        subtext: 'text-gray-400',
        input: 'placeholder:text-gray-500',
        dotInactive: 'bg-[#262626]',
        navBtn: 'bg-white/10 hover:bg-white/20'
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        subtext: 'text-gray-500',
        input: 'placeholder:text-gray-400',
        dotInactive: 'bg-gray-300',
        navBtn: 'bg-white/90 hover:bg-white'
      };

  return (
    <div className={`${themeClasses.bg} border ${themeClasses.border} rounded-sm overflow-hidden select-none shadow-md transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.avatar} 
            alt={post.username} 
            className={`w-8 h-8 rounded-full border ${themeClasses.border} object-cover`}
          />
          <div className="flex flex-col">
            <span className={`text-sm font-semibold leading-none ${themeClasses.text}`}>
              {post.username}
            </span>
            <span className={`text-[11px] mt-0.5 ${themeClasses.subtext}`}>{post.location}</span>
          </div>
        </div>
        <button className={themeClasses.text}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Main Carousel Area */}
      <div 
        className={`relative group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {post.images.length === 0 ? (
            <div className={`w-full bg-gray-500/10 flex items-center justify-center text-gray-400 italic ${getAspectRatioClass()}`}>
              Nenhuma imagem selecionada
            </div>
          ) : (
            post.images.map((img, idx) => (
              <div key={img.id} className="w-full flex-shrink-0 snap-start relative">
                {/* Dynamic Aspect Ratio Container - Uses object-cover to Fill/Zoom */}
                <div className={`relative w-full bg-black overflow-hidden transition-all duration-300 ${getAspectRatioClass()}`}>
                  <img 
                    src={img.url} 
                    alt={`Slide ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation Buttons (Visíveis no Hover) */}
        {post.images.length > 1 && showArrows && !isDragging && (
          <>
            {currentIndex > 0 && (
              <button 
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={prev}
                className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-lg transition-all z-20 active:scale-90 ${themeClasses.navBtn}`}
              >
                <ChevronLeft size={20} className={themeClasses.text} />
              </button>
            )}
            {currentIndex < post.images.length - 1 && (
              <button 
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={next}
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-lg transition-all z-20 active:scale-90 ${themeClasses.navBtn}`}
              >
                <ChevronRight size={20} className={themeClasses.text} />
              </button>
            )}
          </>
        )}

        {/* Counter UI (Top Right) */}
        {post.images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-full pointer-events-none z-10">
            {currentIndex + 1}/{post.images.length}
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="px-3 pt-3 pb-4 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={onLike} className="transition-transform active:scale-125">
              <Heart 
                size={24} 
                className={post.isLiked ? 'fill-red-500 text-red-500' : themeClasses.text} 
              />
            </button>
            <button className={themeClasses.text}><MessageCircle size={24} /></button>
            <button className={themeClasses.text}><Send size={24} /></button>
          </div>
          
          {/* Centered Dots Indicator */}
          <div className="flex gap-[4px] absolute left-1/2 -translate-x-1/2 bottom-[-2px] sm:bottom-[unset]">
            {post.images.length > 1 && post.images.map((_, idx) => (
              <div 
                key={idx}
                className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-blue-500' : themeClasses.dotInactive
                }`}
              />
            ))}
          </div>

          <button onClick={onBookmark}>
            <Bookmark 
              size={24} 
              className={post.isBookmarked ? (post.isDarkMode ? 'fill-white text-white' : 'fill-black text-black') : themeClasses.text} 
            />
          </button>
        </div>

        <div className={`text-sm font-bold mb-1 ${themeClasses.text}`}>
          {post.likes.toLocaleString()} curtidas
        </div>

        <div className="text-sm leading-snug">
          <span className={`font-bold mr-2 ${themeClasses.text}`}>{post.username}</span>
          <span className={post.isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{post.caption}</span>
        </div>

        <div className={`text-[10px] uppercase mt-2 tracking-wide font-medium ${themeClasses.subtext}`}>
          HÁ 2 HORAS
        </div>
      </div>

      {/* Footer / Comments */}
      <div className={`border-t ${themeClasses.border} p-3 flex items-center`}>
        <input 
          type="text" 
          placeholder="Adicione um comentário..."
          className={`flex-1 text-sm outline-none bg-transparent ${themeClasses.text} ${themeClasses.input}`}
        />
        <button className="text-blue-500 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity ml-2">
          Publicar
        </button>
      </div>
    </div>
  );
};
