import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateInputMode = () => {
      setIsTouchDevice(!mediaQuery.matches);
      setIsOpen(false);
    };

    updateInputMode();

    const onMediaChange = () => updateInputMode();
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!isTouchDevice || !isOpen) {
        return;
      }

      if (!containerRef.current) {
        return;
      }

      const target = event.target as Node;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isTouchDevice]);

  return (
    <span ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Mostrar ayuda"
        aria-expanded={isOpen}
        onMouseEnter={() => {
          if (!isTouchDevice) {
            setIsOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            setIsOpen(false);
          }
        }}
        onClick={() => {
          if (isTouchDevice) {
            setIsOpen((prev) => !prev);
          }
        }}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600"
      >
        <Info className="h-4 w-4" />
      </button>
      {isOpen && (
        <span className="absolute left-0 top-full z-[100] mt-2 w-[200px] max-w-xs rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs leading-snug text-white shadow-xl whitespace-normal break-words">
          {text}
        </span>
      )}
    </span>
  );
}
