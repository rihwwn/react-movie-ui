import type { CSSProperties } from 'react';
import { splitMovieRows, type Movie } from '../catalog';
import { MovieCard } from './MovieCard';

export function MovieRows({ movies, onSelect }: { movies: Movie[]; onSelect: (movie: Movie) => void }) {
  if (!movies.length) return <p className="empty-state"><strong>More stories on the way.</strong>Try another category in this demo collection.</p>;
  return splitMovieRows(movies).map((row, rowIndex) => {
    const animated = row.length >= 5;
    return <div className={`movie-row reveal${animated ? '' : ' is-static'}`} key={`${rowIndex}-${row.map(movie => movie.id).join('-')}`}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.scrollLeft = 0; }}>
      <div className="movie-track" style={{ '--duration': `${row.length * 8}s` } as CSSProperties}>
        {(animated ? [0, 1] : [0]).map(copy => <div className="movie-group" key={copy} aria-hidden={copy === 1 || undefined}>
          {row.map(movie => <MovieCard key={movie.id}
            movie={movie} duplicate={copy === 1} onSelect={onSelect} />)}
        </div>)}
      </div>
    </div>;
  });
}
