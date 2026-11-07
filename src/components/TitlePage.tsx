import { useEffect, useRef, useState } from 'react';
import type { Movie } from '../catalog';
import { titleDetails } from '../titleDetails';
import { siteContent } from '../content';
import { Icon } from './Icons';
import { MovieCard } from './MovieCard';

export function TitlePage({ movie, saved, onSave, onBack, onSelect, related, reducedMotion }: {
  movie: Movie;
  saved: boolean;
  onSave: () => void;
  onBack: () => void;
  onSelect: (movie: Movie) => void;
  related: Movie[];
  reducedMotion: boolean;
}) {
  const details = titleDetails[movie.id];
  const seasons = details?.seasonEpisodeCounts ?? [];
  const [season, setSeason] = useState(seasons.length || 1);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [episode, setEpisode] = useState<string | null>(null);
  const [videoError, setVideoError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const voiceCast = movie.categories.includes('Animation');
  const episodeCount = seasons[season - 1] ?? 0;
  const episodeTotal = seasons.reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    const player = video.current;
    return () => { player?.pause(); };
  }, []);
  useEffect(() => {
    if (playing) video.current?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' });
  }, [playing, episode, reducedMotion]);

  function playDemo(label: string | null = null) {
    setEpisode(label);
    setVideoError('');
    setPlaying(true);
    void video.current?.play().catch(() => setVideoError('Use the player controls to start the sample. If it does not load, please try again.'));
  }

  return <article className="title-page" id="title-content" aria-labelledby="title-heading">
    <div className="title-cover">
      <img className={`title-backdrop${movie.backdrop ? ' has-backdrop' : ''}`} src={movie.backdrop ?? movie.image} alt="" />
      <div className="shell title-cover-inner">
        <button className="title-back" onClick={onBack}><Icon name="arrow" className="reverse" /> Back to collection</button>
        <div className="title-hero-grid">
          <img className="title-poster" src={movie.image} alt={`${movie.title} poster`} />
          <div className="title-overview">
            <p className="eyebrow">EVERY STORY HAS MORE TO DISCOVER</p>
            <div className="title-badges"><span>{seasons.length ? 'TV Series' : 'Film'}</span>{movie.categories.includes('Anime') && <span>Anime</span>}<span>{movie.year}</span><span>{movie.duration}</span></div>
            <h1 ref={heading} tabIndex={-1} id="title-heading">{movie.title}</h1>
            <div className="title-genres">{movie.genre.split(' · ').map(genre => <span key={genre}>{genre}</span>)}</div>
            <div className="title-actions"><button className="button yellow" onClick={() => playDemo()}><Icon name="play" /> Watch demo</button>
              <button className="button outline" aria-pressed={saved} onClick={onSave}>{saved ? '✓ In my list' : '＋ My list'}</button></div>
            <p className="title-demo-note">Interactive preview · Scores and playback are illustrative.</p>
          </div>
          <aside className="title-score" aria-label="Demo viewer score"><span className="eyebrow">VIEWER SCORE</span><span className="title-score-star">★</span><strong>{movie.rating}<small> / 5</small></strong><span>Demo score</span></aside>
        </div>
        <div className="title-facts-strip"><div><small>ORIGINAL LANGUAGE</small><strong>{movie.language}</strong></div><div><small>{seasons.length ? 'DEMO SEASONS' : 'RELEASE YEAR'}</small><strong>{seasons.length || movie.year}</strong></div><div><small>{seasons.length ? 'DEMO EPISODES' : 'RUNNING TIME'}</small><strong>{seasons.length ? episodeTotal : movie.duration}</strong></div></div>
      </div>
    </div>
    <div className="shell title-body">
      <nav className="title-section-nav" aria-label="Title sections"><a href="#title-story">Storyline</a>{seasons.length > 0 && <a href="#title-episodes">Episodes</a>}<a href="#title-cast">Cast & crew</a><a href="#title-facts">Details</a></nav>
      <section className="title-player" hidden={!playing} aria-labelledby="preview-heading"><div className="title-section-heading"><div><p className="eyebrow">A LITTLE PREVIEW</p><h2 id="preview-heading">{episode ? `${episode} · Demo preview` : 'Your preview is ready'}</h2></div></div>
        <video ref={video} controls playsInline preload="none" poster={movie.backdrop ?? movie.image} onError={() => setVideoError('The sample video could not be loaded. Please try again.')}><source src="/assets/sample.mp4" type="video/mp4" />Your browser doesn't support video playback.</video>
        <p className="title-demo-note">Every title and episode plays the same sample clip in this demo.</p><p role="status" className="title-player-error">{videoError}</p></section>
      <div className="title-info-grid"><div>
        <section className="title-section" id="title-story" aria-labelledby="story-heading"><p className="eyebrow">BEHIND THE TITLE</p><h2 id="story-heading">Storyline</h2><p className="title-story">{movie.description}</p>
          {details && <div className="title-leads"><span>{details.leadLabel}</span><strong>{details.leads.join(' · ')}</strong></div>}</section>
        {seasons.length > 0 && <section className="title-section" id="title-episodes" aria-labelledby="episodes-heading"><div className="title-section-heading"><div><p className="eyebrow">ONE MORE CHAPTER</p><h2 id="episodes-heading">Episodes <span className="title-count">{episodeTotal}</span></h2></div>
          <label className="season-select">Season<select value={season} onChange={event => { setSeason(Number(event.target.value)); setExpanded(false); }}>{seasons.map((count, index) => <option key={index} value={index + 1}>Season {index + 1} · {count} episodes</option>)}</select></label></div>
          <p className="title-demo-note">Demo episode guide: season counts, episode entries and runtimes are sample data.</p>
          <ol className="episode-list">{Array.from({ length: expanded ? episodeCount : Math.min(4, episodeCount) }, (_, index) => {
            const label = `S${season} E${index + 1}`;
            return <li key={label} className={episode === label ? 'is-playing' : ''}><span className="episode-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><small>{label}</small><h3>Episode {index + 1}</h3><p>{voiceCast ? '24' : '52'} min · Demo chapter</p></div><button aria-label={`Play ${label}`} onClick={() => playDemo(label)}><Icon name="play" /></button></li>;
          })}</ol>
          {episodeCount > 4 && <button className="episode-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show fewer episodes ↑' : `Show all ${episodeCount} episodes ↓`}</button>}</section>}
        <section className="title-section" id="title-cast" aria-labelledby="cast-heading"><p className="eyebrow">THE PEOPLE BEHIND THE STORY</p><h2 id="cast-heading">{voiceCast ? 'Voice cast' : 'Top cast'}</h2><div className="title-cast-grid">{details?.cast.map(name => <article className="cast-person" key={name}><span className="cast-avatar" aria-hidden="true">{name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><div><h3>{name}</h3><p>{voiceCast ? 'Voice performance' : 'Cast'}</p></div></article>)}</div></section>
      </div><aside className="title-technical" id="title-facts" aria-labelledby="facts-heading"><p className="eyebrow">AT A GLANCE</p><h2 id="facts-heading">Title details</h2><dl><div><dt>Format</dt><dd>{seasons.length ? 'TV Series' : 'Feature film'}</dd></div><div><dt>Year</dt><dd>{movie.year}</dd></div><div><dt>Language</dt><dd>{movie.language}</dd></div>{details && <div><dt>Country of origin</dt><dd>{details.country}</dd></div>}<div><dt>Genres</dt><dd>{movie.genre}</dd></div><div><dt>{seasons.length ? 'Featured season' : 'Runtime'}</dt><dd>{movie.duration}</dd></div>{seasons.length > 0 && <><div><dt>Seasons in demo</dt><dd>{seasons.length}</dd></div><div><dt>Episodes in demo</dt><dd>{episodeTotal}</dd></div></>}</dl><span className="demo-tag">{siteContent.brand.toUpperCase()} DEMO COLLECTION</span></aside></div>
      {related.length > 0 && <section className="title-section title-related" aria-labelledby="related-heading"><p className="eyebrow">KEEP THE STORIES COMING</p><h2 id="related-heading">More to discover</h2><div className="title-related-grid">{related.map(title => <MovieCard key={title.id} movie={title} onSelect={onSelect} />)}</div></section>}
    </div>
  </article>;
}
