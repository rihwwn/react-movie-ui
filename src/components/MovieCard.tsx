import type { Movie } from '../catalog';
import { Icon } from './Icons';

export function MovieCard({ movie, onSelect, duplicate = false }: {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  duplicate?: boolean;
}) {
  return <button className="movie-card" aria-label={`Explore ${movie.title}`}
    aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : 0} onClick={() => onSelect(movie)}>
    <img loading="lazy" src={movie.image} alt="" />
    <span className="movie-card-play"><Icon name="play" /></span>
    <span className="movie-card-copy"><span className="movie-card-title">{movie.title}</span>
      <span className="movie-card-meta"><span>{movie.year}</span><span>★ {movie.rating}</span></span>
    </span>
  </button>;
}
