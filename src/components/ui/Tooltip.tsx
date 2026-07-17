import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

export function Tooltip({ text }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const tooltipNode = useMemo(() => {
    if (typeof document === 'undefined' || !isOpen) {
      return null;
    }

    return createPortal(
      <span
        style={{ top: position.top, left: position.left }}
        className="fixed w-64 p-2 text-sm text-white bg-slate-900 rounded-lg shadow-xl whitespace-normal break-words z-[9999]"
      >
        {text}
      </span>,
      document.body,
    );
  }, [isOpen, position.left, position.top, text]);

  const updatePosition = () => {
    if (!buttonRef.current || typeof window === 'undefined') {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 256;
    const margin = 8;
    const viewportWidth = window.innerWidth;

    const nextLeft = Math.min(
      Math.max(rect.left, margin),
      Math.max(margin, viewportWidth - tooltipWidth - margin),
    );

    setPosition({
      top: rect.bottom + margin,
      left: nextLeft,
    });
  };

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
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

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
        ref={buttonRef}
        type="button"
        aria-label="Mostrar ayuda"
        aria-expanded={isOpen}
        onMouseEnter={() => {
          if (!isTouchDevice) {
            updatePosition();
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
            updatePosition();
            setIsOpen((prev) => !prev);
          }
        }}
        className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 transition-colors hover:text-slate-600"
      >
        <Info className="h-4 w-4" />
      </button>
      {tooltipNode}
    </span>
  );
}
