import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { slideOffset, type Movie } from '../catalog';
import { siteContent } from '../content';
import { Icon } from './Icons';

export function Carousel({ movies, variant, paused, onSelect, onPositionChange, onReady }: {
  movies: Movie[];
  variant: 'hero' | 'taste';
  paused: boolean;
  onSelect: (movie: Movie) => void;
  onPositionChange?: (index: number) => void;
  onReady?: () => void;
}) {
  const hero = variant === 'hero';
  const initialIndex = Math.min(hero ? 1 : 2, movies.length - 1);
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
    if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPending(index);
    else { setEntrySide(slideOffset(index, current, movies.length)); setCurrent(index); }
    return true;
  }, [current, hero, movies.length, pending]);
  const step = useCallback((direction: number) => moveTo((current + direction + movies.length) % movies.length), [current, movies.length, moveTo]);

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
    const observer = new IntersectionObserver(entries => {
      setVisible(entries[0].isIntersecting);
      if (entries[0].isIntersecting) setEntered(true);
    }, { threshold: .25 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (paused || hovered || !visible || movies.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !root.current?.contains(document.activeElement) && Date.now() - lastInteraction.current > 6500) step(1);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, visible, movies.length, step]);

  function choose(index: number) { lastInteraction.current = Date.now(); return moveTo(index); }
  function imageReady(id: string) {
    setReadyImages(images => images.has(id) ? images : new Set(images).add(id));
    onReady?.();
  }
  const controls = <div className="glass-controls">
    <button disabled={pending !== null} aria-label={`Previous ${hero ? 'featured movie' : 'recommendation'}`} onClick={() => choose((current - 1 + movies.length) % movies.length)}><Icon name="arrow" className="reverse" /></button>
    <button disabled={pending !== null} aria-label={`Next ${hero ? 'featured movie' : 'recommendation'}`} onClick={() => choose((current + 1) % movies.length)}><Icon name="arrow" /></button>
  </div>;

  return <div ref={root} className={`carousel ${variant}-carousel${entered ? ' has-entered' : ''}${!hero && readyImages.has(movies[initialIndex].image) ? ' is-art-ready' : ''}${pending !== null ? ' is-changing' : ''}`}
    role="region" aria-roledescription="carousel" aria-label={hero ? 'Featured movies' : 'Recommended movies'}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onKeyDown={event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + movies.length) % movies.length;
      if (choose(next)) slides.current[next]?.focus({ preventScroll: true });
    }}>
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
          <img src={hero ? movie.backdrop ?? movie.image : movie.image} alt="" loading={hero && distance < 2 ? 'eager' : 'lazy'} fetchPriority={hero && offset === 0 ? 'high' : 'auto'}
            onLoad={() => imageReady(movie.image)} onError={() => imageReady(movie.image)} />
          <span className="slide-content" key={hero && offset === 0 ? 'featured' : 'preview'}>
            {hero && <span className="slide-kicker">{`${siteContent.brand.toUpperCase()} ${siteContent.hero.collectionLabel}`}</span>}
            <span className="slide-copy">{hero ? <>
              <span className="slide-title">{movie.title}</span>
              <span className="slide-meta">
                <span><Icon name="clock" /><span><small>{movie.categories.includes('TV Shows') ? 'Format' : 'Length'}</small>{movie.duration}</span></span>
                <span><Icon name="calendar" /><span><small>Year</small>{movie.year}</span></span>
                <span><Icon name="globe" /><span><small>Language</small>{movie.language}</span></span>
              </span>
            </> : <>
              <span className="taste-caption"><span className="slide-title">{movie.title}</span><span className="slide-genre">{movie.categories.includes('Anime') ? 'Anime' : movie.categories.includes('Animation') ? 'Animation' : movie.genre}</span></span>
              <span className="rating">★ {movie.rating}</span>
            </>}</span>
          </span>
        </>;
        return <button key={movie.id} ref={element => { slides.current[index] = element; }}
          className={`slide${offset === 0 ? ' is-center' : ''}${readyImages.has(movie.image) ? ' is-image-ready' : ''}`} style={style} data-side={offset < 0 ? 'previous' : offset > 0 ? 'next' : 'current'} aria-roledescription="slide"
          aria-hidden={hidden} tabIndex={hidden ? -1 : 0} aria-label={`${offset === 0 ? 'Explore' : 'Show'} ${movie.title}`}
          onClick={() => { if (!touchStart.current?.moved) { if (current === index) onSelect(movie); else choose(index); } }}>
          {hero ? artwork : <span className="taste-art">{artwork}</span>}
        </button>;
      })}
    </div>
    {hero ? controls : <div className="taste-navigation">{controls}<div className="dots" role="group" aria-label="Choose recommendation">
      {movies.map((movie, index) => <button key={movie.id} aria-label={`Show ${movie.title}`} aria-pressed={index === current} onClick={() => choose(index)} />)}
    </div></div>}
  </div>;
}
