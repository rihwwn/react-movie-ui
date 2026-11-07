import { useEffect, useRef, useState, type ReactNode } from 'react';
import { filterTitles, type Movie } from '../catalog';
import { Icon } from './Icons';
import { MovieCard } from './MovieCard';

function Dialog({ className, labelledBy, closeLabel, onClose, children }: {
  className: string;
  labelledBy: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);
  return <dialog ref={ref} className={className} aria-labelledby={labelledBy}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <button className="close-button" aria-label={closeLabel} onClick={onClose}><Icon name="close" /></button>
    {children}
  </dialog>;
}

export function SearchDialog({ movies, listMode, onSelect, onClose }: {
  movies: Movie[];
  listMode: boolean;
  onSelect: (movie: Movie) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const titles = filterTitles(movies, null, query);
  return <Dialog className="search-dialog" labelledBy="search-title" closeLabel="Close search" onClose={onClose}>
    <p className="eyebrow">YOUR NEXT FAVORITE IS OUT THERE</p>
    <h2 id="search-title">{listMode ? 'Saved for a good night.' : 'Find your story.'}</h2>
    <label className="search-field"><Icon name="search" /><input autoFocus type="search" aria-label="Search titles"
      autoComplete="off" placeholder={listMode ? 'Search your saved stories…' : 'Search movies, stories, moods…'}
      value={query} onChange={event => setQuery(event.target.value)} /></label>
    <p className="search-count" role="status">{titles.length} {titles.length === 1 ? 'story' : 'stories'} {listMode ? 'in your list' : 'to explore'}</p>
    <div className="search-results">{titles.map(movie => <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />)}
      {!titles.length && <p className="empty-state"><strong>{listMode && !movies.length ? 'Your next favorites live here.' : 'No stories found.'}</strong>
        {listMode && !movies.length ? 'Open a movie and choose “My list” to save it for later.' : 'Try a title or a mood, like adventure or comedy.'}</p>}
    </div>
  </Dialog>;
}
