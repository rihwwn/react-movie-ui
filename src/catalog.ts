import { queryOptions } from '@tanstack/react-query';

export const categories = ['Movies', 'TV Shows', 'Animation', 'Anime', 'Kids'] as const;
export type Category = typeof categories[number];

export interface Movie {
  id: string;
  title: string;
  image: string;
  backdrop?: string;
  year: number;
  duration: string;
  language: string;
  rating: string;
  categories: Category[];
  genre: string;
  description: string;
}

function isMovie(value: unknown): value is Movie {
  if (typeof value !== 'object' || value === null) return false;
  const movie = value as Record<string, unknown>;
  const artworkPath = /^assets\/[a-z-]+\.(?:webp|jpg|png|svg)$/;
  return ['id', 'title', 'image', 'duration', 'language', 'rating', 'genre', 'description'].every(key =>
    typeof movie[key] === 'string' && movie[key].length > 0) &&
    typeof movie.image === 'string' && artworkPath.test(movie.image) &&
    (movie.backdrop === undefined || typeof movie.backdrop === 'string' && artworkPath.test(movie.backdrop)) &&
    Number.isInteger(movie.year) && Array.isArray(movie.categories) &&
    movie.categories.every(category => categories.some(allowed => allowed === category));
}

export function parseCatalog(value: unknown): Movie[] {
  if (!Array.isArray(value) || !value.length || !value.every(isMovie) ||
      new Set(value.map(movie => movie.id)).size !== value.length) {
    throw new Error('The collection is unavailable. Please try again later.');
  }
  return value;
}

export async function loadCatalog(signal?: AbortSignal): Promise<Movie[]> {
  // shortcut: the demo reads local JSON; replace this endpoint and image validation with the real API contract.
  const response = await fetch('catalog.json', { signal });
  if (!response.ok) throw new Error('The collection could not be loaded. Please try again.');
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new Error('The collection returned an invalid response. Please try again.'); }
  return parseCatalog(data);
}

export const catalogQuery = queryOptions({
  queryKey: ['catalog'],
  queryFn: ({ signal }) => loadCatalog(signal),
  staleTime: 60_000,
});

export function filterTitles(titles: Movie[], category: Category | null = 'Movies', query = '') {
  const search = query.trim().toLowerCase();
  return titles.filter(movie => (!category || movie.categories.includes(category)) &&
    `${movie.title} ${movie.genre}`.toLowerCase().includes(search));
}

export function splitMovieRows(titles: Movie[]) {
  if (!titles.length) return [];
  if (titles.length < 10) return [titles];
  const middle = Math.ceil(titles.length / 2);
  return [titles.slice(0, middle), titles.slice(middle)];
}
