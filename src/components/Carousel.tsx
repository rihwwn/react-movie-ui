import { CinemaCarousel } from '@rihwwn/meeu-carousel';
import type { Movie } from '../catalog';
import { siteContent } from '../content';
import { Icon } from './Icons';

export function Carousel({ movies, variant, ...callbacks }: {
  movies: Movie[];
  variant: 'hero' | 'taste';
  paused: boolean;
  onSelect: (movie: Movie) => void;
  onPositionChange?: (index: number) => void;
  onReady?: () => void;
}) {
  const items = movies.map(movie => ({ ...movie,
    subtitle: movie.categories.includes('Anime') ? 'Anime' : movie.categories.includes('Animation') ? 'Animation' : movie.genre,
    metadata: [
      { label: movie.categories.includes('TV Shows') ? 'Format' : 'Length', value: movie.duration, icon: <Icon name="clock" /> },
      { label: 'Year', value: String(movie.year), icon: <Icon name="calendar" /> },
      { label: 'Language', value: movie.language, icon: <Icon name="globe" /> },
    ],
  }));
  return <CinemaCarousel items={items} variant={variant} initialIndex={variant === 'hero' ? 1 : 2}
    eyebrow={`${siteContent.brand.toUpperCase()} ${siteContent.hero.collectionLabel}`} {...callbacks} />;
}
