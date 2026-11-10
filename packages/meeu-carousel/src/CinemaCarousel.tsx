'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
export interface CarouselMetadata {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface CarouselItem {
  id: string;
  title: string;
  image: string;
  backdrop?: string;
  subtitle?: string;
  rating?: string | number;
  metadata?: readonly CarouselMetadata[];
}

export interface CinemaCarouselProps<T extends CarouselItem = CarouselItem> {
  items: readonly T[];
  variant?: 'hero' | 'taste';
  paused?: boolean;
  autoplay?: boolean;
  interval?: number;
  initialIndex?: number;
  eyebrow?: string;
  className?: string;
  onSelect?: (item: T) => void;
  onPositionChange?: (index: number) => void;
  onReady?: () => void;
}

function slideOffset(index: number, current: number, count: number) {
  return ((index - current + Math.floor(count / 2) + count) % count) - Math.floor(count / 2);
}

function Arrow({ reverse = false }: { reverse?: boolean }) {
  return <svg className={reverse ? 'reverse' : undefined} viewBox="0 0 32 24" aria-hidden="true"><path d="M2 12h27M19 2l10 10-10 10" /></svg>;
}

export function CinemaCarousel<T extends CarouselItem>(props: CinemaCarouselProps<T>) {
  if (!props.items.length) return null;
  // Reset navigation when the collection changes, including the loading-to-ready case.
  return <CarouselContent key={JSON.stringify(props.items.map(item => item.id)) + (props.variant ?? 'hero')} {...props} />;
}

function CarouselContent<T extends CarouselItem>({ items: movies, variant = 'hero', paused = false,
  autoplay = true, interval = 6500, initialIndex: start = 0, eyebrow, className = '',
  onSelect, onPositionChange, onReady,
}: CinemaCarouselProps<T>) {
  const hero = variant === 'hero';
  const initialIndex = Math.max(0, Math.min(Number.isFinite(start) ? Math.trunc(start) : 0, movies.length - 1));
  const autoplayInterval = Math.max(1000, Number.isFinite(interval) ? interval : 6500);
  const clipId = `meeu-curve-${useId()}`;
  const imageSource = (item: CarouselItem) => hero ? item.backdrop ?? item.image : item.image;
  const [reducedMotion, setReducedMotion] = useState(false);
  const [current, setCurrent] = useState(initialIndex);
  const [entrySide, setEntrySide] = useState(1);
  const [pending, setPending] = useState<number | null>(null);
  const [readyImages, setReadyImages] = useState<Set<string>>(() => new Set());
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hovered, setHovered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLButtonElement | null)[]>([]);
  const lastInteraction = useRef(0);
  const touchStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const moveTo = useCallback((index: number) => {
    if (index === current || pending !== null) return false;
    if (hero && !reducedMotion) setPending(index);
    else { setEntrySide(slideOffset(index, current, movies.length)); setCurrent(index); }
    return true;
  }, [current, hero, movies.length, pending, reducedMotion]);
  const step = useCallback((direction: number) => moveTo((current + direction + movies.length) % movies.length), [current, movies.length, moveTo]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { onPositionChange?.(current); }, [current, onPositionChange]);
  useEffect(() => {
    if (pending === null) return;
    const timer = window.setTimeout(() => {
      setEntrySide(slideOffset(pending, current, movies.length));
      setCurrent(pending);
      setPending(null);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [pending, current, movies.length]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); setEntered(true); return; }
    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0].isIntersecting);
      if (entries[0].isIntersecting) setEntered(true);
    }, { threshold: .25 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!autoplay || paused || reducedMotion || hovered || !visible || movies.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !root.current?.contains(document.activeElement) && Date.now() - lastInteraction.current > autoplayInterval) step(1);
    }, autoplayInterval);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayInterval, paused, reducedMotion, hovered, visible, movies.length, step]);

  function choose(index: number) { lastInteraction.current = Date.now(); return moveTo(index); }
  function imageReady(id: string) {
    setReadyImages(images => images.has(id) ? images : new Set(images).add(id));
    onReady?.();
  }
  const controls = <div className="glass-controls">
    <button type="button" disabled={pending !== null} aria-label={`Previous ${hero ? 'featured movie' : 'recommendation'}`} onClick={() => choose((current - 1 + movies.length) % movies.length)}><Arrow reverse /></button>
    <button type="button" disabled={pending !== null} aria-label={`Next ${hero ? 'featured movie' : 'recommendation'}`} onClick={() => choose((current + 1) % movies.length)}><Arrow /></button>
  </div>;

  return <div ref={root} className={`meeu-carousel carousel ${variant}-carousel ${className}${entered ? ' has-entered' : ''}${!hero && readyImages.has(imageSource(movies[initialIndex])) ? ' is-art-ready' : ''}${pending !== null ? ' is-changing' : ''}`}
    style={{ '--meeu-curve': `url("#${clipId}")` } as CSSProperties}
    role="region" aria-roledescription="carousel" aria-label={hero ? 'Featured movies' : 'Recommended movies'}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onKeyDown={event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + movies.length) % movies.length;
      if (choose(next)) slides.current[next]?.focus({ preventScroll: true });
    }}>
    <svg className="meeu-defs" aria-hidden="true"><defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><path d="M0,.15 Q0,.043 .045,.05 Q.5,.12 .955,.05 Q1,.043 1,.15 L1,.85 Q1,.95 .955,.957 Q.5,1.025 .045,.957 Q0,.95 0,.85 Z" /></clipPath></defs></svg>
    <div className="carousel-stage" onPointerDown={event => {
      if (event.isPrimary) touchStart.current = { x: event.clientX, y: event.clientY, moved: false };
    }} onPointerMove={event => {
      if (touchStart.current && Math.abs(event.clientX - touchStart.current.x) > 15) touchStart.current.moved = true;
    }} onPointerUp={event => {
      const start = touchStart.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
        lastInteraction.current = Date.now(); step(dx < 0 ? 1 : -1);
      }
      window.setTimeout(() => { if (touchStart.current === start) touchStart.current = null; }, 0);
    }} onPointerCancel={() => { touchStart.current = null; }}>
      {movies.map((movie, index) => {
        const offset = slideOffset(index, current, movies.length);
        const distance = Math.abs(offset);
        const hidden = hero && distance > 1;
        const style = {
          '--offset': offset, '--angle': `${offset * (hero ? -8 : -6)}deg`, '--skew': `${offset * (hero ? -4 : -3)}deg`,
          '--wave-origin': (offset || entrySide) < 0 ? '100%' : '0%',
          '--entry-delay': `${Math.abs(slideOffset(index, initialIndex, movies.length)) * .2}s`,
          '--scale': 1, '--opacity': hidden ? 0 : 1, '--z': 5 - distance,
        } as CSSProperties;
        const artwork = <>
          <img src={imageSource(movie)} alt="" loading={hero && distance < 2 ? 'eager' : 'lazy'} fetchPriority={hero && offset === 0 ? 'high' : 'auto'}
            onLoad={() => imageReady(imageSource(movie))} onError={() => imageReady(imageSource(movie))} />
          <span className="slide-content" key={hero && offset === 0 ? 'featured' : 'preview'}>
            {hero && eyebrow && <span className="slide-kicker">{eyebrow}</span>}
            <span className="slide-copy">{hero ? <>
              <span className="slide-title">{movie.title}</span>
              {movie.metadata?.length ? <span className="slide-meta">
                {movie.metadata.map((meta, index) => <span key={index}>{meta.icon}<span><small>{meta.label}</small>{meta.value}</span></span>)}
              </span> : null}
            </> : <>
              <span className="taste-caption"><span className="slide-title">{movie.title}</span>{movie.subtitle && <span className="slide-genre">{movie.subtitle}</span>}</span>
              {movie.rating != null && <span className="rating">★ {movie.rating}</span>}
            </>}</span>
          </span>
        </>;
        return <button type="button" key={movie.id} ref={element => { slides.current[index] = element; }}
          className={`slide${offset === 0 ? ' is-center' : ''}${readyImages.has(imageSource(movie)) ? ' is-image-ready' : ''}`} style={style} data-side={offset < 0 ? 'previous' : offset > 0 ? 'next' : 'current'} aria-roledescription="slide"
          aria-hidden={hidden} tabIndex={hidden ? -1 : 0} aria-label={`${offset === 0 ? 'Explore' : 'Show'} ${movie.title}`}
          onClick={() => { if (!touchStart.current?.moved) { if (current === index) onSelect?.(movie); else choose(index); } }}>
          {hero ? artwork : <span className="taste-art">{artwork}</span>}
        </button>;
      })}
    </div>
    {movies.length > 1 && (hero ? controls : <div className="taste-navigation">{controls}<div className="dots" role="group" aria-label="Choose recommendation">
      {movies.map((movie, index) => <button type="button" key={movie.id} aria-label={`Show ${movie.title}`} aria-pressed={index === current} onClick={() => choose(index)} />)}
    </div></div>)}
  </div>;
}
