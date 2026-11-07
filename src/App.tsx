import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogQuery, filterTitles, type Category, type Movie } from './catalog';
import { siteContent as content } from './content';
import { Icon, IconDefinitions } from './components/Icons';
import { Carousel } from './components/Carousel';
import { MovieRows } from './components/MovieRows';
import { SearchDialog } from './components/Dialogs';
import { TitlePage } from './components/TitlePage';

type OpenDialog = { type: 'search' | 'list' } | null;
const tabs: Exclude<Category, 'Kids'>[] = ['Movies', 'TV Shows', 'Animation', 'Anime'];
const tabId = (category: Category) => `tab-${category.toLowerCase().replaceAll(' ', '-')}`;

function readWatchlist(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('react-movie-ui-watchlist') || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : [];
  } catch { return []; }
}

function Lines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>);
}

function Brand({ onHome }: { onHome: () => void }) {
  return <a className="brand" href="/#home" onClick={event => { event.preventDefault(); onHome(); }} aria-label={`${content.brand} home`}>{content.brand}<span className="brand-dot">✳</span></a>;
}

function SectionHeading({ id, copy }: { id: string; copy: { eyebrow: string; title: string; description: string } }) {
  return <div className="section-heading reveal"><p className="eyebrow">{copy.eyebrow}</p><h2 id={id}>{copy.title}</h2><p>{copy.description}</p></div>;
}

export default function App() {
  const query = useQuery(catalogQuery);
  const catalog = query.data ?? [];
  const [category, setCategory] = useState<Category>('Movies');
  const [activeNav, setActiveNav] = useState<Category | 'Home'>('Home');
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [titleId, setTitleId] = useState(() => new URLSearchParams(window.location.search).get('title') || null);
  const [saved, setSaved] = useState(readWatchlist);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(reducedMotion);
  const [heroPosition, setHeroPosition] = useState(1);
  const [heroReady, setHeroReady] = useState(false);
  const [toast, setToast] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const homeScroll = useRef<number | null>(null);
  const selectedMovie = catalog.find(movie => movie.id === titleId);
  const relatedMovies = selectedMovie ? catalog.filter(movie => movie.id !== selectedMovie.id && movie.genre.split(' · ').some(genre => selectedMovie.genre.includes(genre))).slice(0, 4) : [];
  const heroMovies = content.hero.movieIds.map(id => catalog.find(movie => movie.id === id)).filter((movie): movie is Movie => !!movie);
  const tasteMovies = content.taste.movieIds.map(id => catalog.find(movie => movie.id === id)).filter((movie): movie is Movie => !!movie);
  const featureMovie = catalog.find(movie => movie.id === content.feature.movieId);
  const featuredIds = new Set<string>([...content.hero.movieIds, ...content.taste.movieIds, content.feature.movieId]);
  const freshMovies = catalog.filter(movie => !featuredIds.has(movie.id));
  const savedMovies = catalog.filter(movie => saved.includes(movie.id));

  useEffect(() => {
    const navigate = () => { setTitleId(new URLSearchParams(window.location.search).get('title') || null); setDialog(null); };
    window.addEventListener('popstate', navigate);
    return () => window.removeEventListener('popstate', navigate);
  }, []);
  useEffect(() => {
    if (titleId) {
      const section = document.getElementById(window.location.hash.slice(1));
      if (section) section.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    }
    else if (homeScroll.current !== null) window.scrollTo({ top: homeScroll.current, behavior: 'instant' });
    else document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [titleId]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event: MediaQueryListEvent) => { setReducedMotion(event.matches); setPaused(event.matches); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    root.current?.querySelectorAll('.reveal:not(.visible)').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [query.data, category, titleId]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function goHome(hash = 'popular') {
    const url = new URL(window.location.href);
    url.searchParams.delete('title'); url.hash = hash;
    window.history.pushState(null, '', url);
    homeScroll.current = null;
    setTitleId(null); setDialog(null);
    if (!titleId) document.getElementById(hash)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
  }
  function selectCategory(next: Category) { setCategory(next); setActiveNav(next); if (titleId) goHome(); }
  function openMovie(movie: Movie) {
    if (!titleId) homeScroll.current = window.scrollY;
    const url = new URL(window.location.href);
    url.searchParams.set('title', movie.id); url.hash = '';
    window.history.pushState(null, '', url);
    setTitleId(movie.id); setDialog(null);
  }
  function toggleSaved(movie: Movie) {
    const removing = saved.includes(movie.id);
    const next = removing ? saved.filter(id => id !== movie.id) : [...saved, movie.id];
    setSaved(next);
    try {
      localStorage.setItem('react-movie-ui-watchlist', JSON.stringify(next));
      setToast(removing ? 'Removed from your list' : 'Saved for your next movie night');
    } catch { setToast('Saved for this visit. Browser storage is unavailable.'); }
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selectCategory(tabs[next]);
    const buttons = event.currentTarget.parentElement?.querySelectorAll('button');
    buttons?.[next].focus();
  }
  const motionPaused = paused || reducedMotion || dialog !== null;

  return <div ref={root} className={`app js-motion${titleId || heroReady || query.isError || (!query.isPending && !heroMovies.length) ? ' hero-ready' : ''}${motionPaused ? ' motion-paused' : ''}`}>
    <title>{selectedMovie ? `${selectedMovie.title} (${selectedMovie.year}) — ${content.brand}` : `${content.brand} — ${content.metaTitle}`}</title><meta name="description" content={selectedMovie?.description ?? content.metaDescription} />
    <a className="skip-link" href={titleId ? '#title-content' : '#popular'}>{titleId ? 'Skip to title' : 'Skip to movies'}</a><IconDefinitions />
    <header className="header shell" id="home"><Brand onHome={() => goHome('home')} />
      <nav className="nav-pill" aria-label="Main navigation">
        <a href="/#home" className={activeNav === 'Home' && !titleId ? 'active' : ''} aria-current={activeNav === 'Home' && !titleId ? 'page' : undefined} onClick={event => { event.preventDefault(); setActiveNav('Home'); goHome('home'); }}>Home</a>
        {(['Movies', 'TV Shows', 'Kids'] as const).map((item, index) => <a key={item} href="#popular" className={activeNav === item ? 'active' : ''}
          aria-current={activeNav === item ? 'page' : undefined} onClick={event => { event.preventDefault(); selectCategory(item); if (!titleId) goHome(); }}>{['Movies', 'Series', 'Kids'][index]}</a>)}
      </nav><div className="header-actions"><button className="search-button" aria-label="Search movies" onClick={() => setDialog({ type: 'search' })}><Icon name="search" /></button>
        <button className="list-button" onClick={() => setDialog({ type: 'list' })}><span className="button-label">My list <span className="list-count">{savedMovies.length}</span></span></button></div>
    </header>
    <main>
      {titleId ? selectedMovie ? <TitlePage key={selectedMovie.id} movie={selectedMovie} saved={saved.includes(selectedMovie.id)} onSave={() => toggleSaved(selectedMovie)} onBack={() => goHome()} onSelect={openMovie} related={relatedMovies} reducedMotion={reducedMotion} />
        : <section className="title-status shell" id="title-content" aria-live="polite"><p className="eyebrow">YOUR NEXT STORY</p><h1>{query.isPending ? 'Loading title details…' : query.isError ? 'This story is taking a little break.' : 'Title not found'}</h1><p>{query.isError ? query.error.message : query.isPending ? 'Getting everything ready for you.' : 'This title is not part of the demo collection.'}</p>{query.isError && <button className="button yellow" onClick={() => void query.refetch()}>Try again</button>}<button className="button outline" onClick={() => goHome()}>Back to collection</button></section>
        : <>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-pattern" aria-hidden="true" />
        <div className="hero-copy"><p className="eyebrow intro">{content.hero.eyebrow}</p>
          <h1 id="hero-title"><span className="intro">{content.hero.title}</span><span className="intro">{content.hero.titleBeforeBrand} <strong>{content.brand}</strong></span></h1>
          <p className="hero-description intro"><Lines lines={content.hero.description} /></p>
          <div className="hero-actions"><a className="button yellow" href="#popular"><span className="button-label">{content.hero.primaryAction}</span></a><a className="button outline" href="#taste"><span className="button-label">{content.hero.secondaryAction}</span></a></div>
        </div>
        {heroMovies.length > 0 ? <Carousel movies={heroMovies} variant="hero" paused={motionPaused} onSelect={openMovie} onPositionChange={setHeroPosition} onReady={() => setHeroReady(true)} />
          : <div className="carousel hero-carousel"><div className="carousel-stage"><p className="empty-state" role="status">{query.isPending ? 'Loading the collection…' : 'The collection is taking a little break.'}</p></div></div>}
        <div className="hero-bottom shell"><span>{content.hero.caption}</span><div className="hero-pagination"><span>{String(heroMovies.length ? heroPosition + 1 : 0).padStart(2, '0')} / {String(heroMovies.length).padStart(2, '0')}</span>
          <button aria-label={paused ? 'Resume automatic motion' : 'Pause automatic motion'} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</button></div><a href="#different" className="scroll-cue">Scroll to discover <span>↓</span></a></div>
      </section>
      <section className="difference shell section" id="different" aria-labelledby="difference-title"><SectionHeading id="difference-title" copy={content.difference} />
        <div className="benefits">{content.difference.cards.map((card, index) => <article className="benefit reveal" key={card.title}><div className="benefit-icon"><svg viewBox="0 0 64 64" aria-hidden="true">
          {index === 0 ? <><rect x="12" y="15" width="40" height="36" rx="9" fill="currentColor" opacity=".35" /><path d="M14 22h36M19 40h12M10 55 55 10" /></>
            : index === 1 ? <><rect x="11" y="11" width="42" height="42" rx="13" fill="currentColor" opacity=".35" /><path d="M20 34h9m7 0h8M20 43h18m5 0h1" /></>
              : <><circle cx="32" cy="32" r="23" fill="currentColor" opacity=".35" /><path d="M19 28v9m8-16v22m8-27v32m8-23v14" /></>}
        </svg></div><h3>{card.title}</h3><p><Lines lines={card.description} /></p></article>)}</div>
      </section>
      <section className="taste section" id="taste" aria-labelledby="taste-title"><SectionHeading id="taste-title" copy={content.taste} />
        {tasteMovies.length > 0 && <Carousel movies={tasteMovies} variant="taste" paused={motionPaused} onSelect={openMovie} />}
      </section>
      <section className="feature shell section" aria-labelledby="feature-title"><div className="feature-copy reveal"><p className="eyebrow">{content.feature.eyebrow}</p>
        <h2 id="feature-title">{content.feature.title[0]}<br />{content.feature.title[1]}<br /><span>{content.feature.title[2]}</span></h2><p>{content.feature.description}</p>
        <button className="button white" disabled={!featureMovie} onClick={() => { if (featureMovie) openMovie(featureMovie); }}>{content.feature.action}<Icon name="arrow" /></button><div className="wave-decoration" aria-hidden="true">〰<br />〰<br />〰</div></div>
        <button className="feature-art reveal" disabled={!featureMovie} aria-label={`Explore ${featureMovie?.title ?? 'featured movie'}`} onClick={() => { if (featureMovie) openMovie(featureMovie); }}>
          <img src={featureMovie?.backdrop ?? featureMovie?.image} loading="lazy" alt={`${featureMovie?.title ?? 'Featured movie'} artwork`} /><span className="feature-play-icon"><Icon name="play" /></span>
          <span className="feature-art-caption">{featureMovie?.title.toUpperCase()}<span>{content.feature.caption}</span></span></button>
      </section>
      <section className="popular shell section" id="popular" aria-labelledby="popular-title"><SectionHeading id="popular-title" copy={content.popular} />
        <div className="filter-tabs reveal" role="tablist" aria-label="Movie categories">{tabs.map((tab, index) => <button key={tab} role="tab" id={tabId(tab)} aria-controls="movie-grid"
          aria-selected={category === tab} tabIndex={category === tab || (category === 'Kids' && index === 0) ? 0 : -1}
          onClick={() => selectCategory(tab)} onKeyDown={event => tabKey(event, index)}>{tab}</button>)}</div>
        {query.isPending && <p className="catalog-status" role="status">Loading the collection…</p>}
        {query.isError && <div className="catalog-status" role="alert"><p>{query.error.message}</p><button className="button outline" onClick={() => void query.refetch()}>Try again</button></div>}
        <div className="movie-grid" id="movie-grid" role="tabpanel" aria-labelledby={category === 'Kids' ? 'popular-title' : tabId(category)} tabIndex={0}>
          {query.data && <MovieRows movies={filterTitles(freshMovies, category)} onSelect={openMovie} />}</div>
        <div className="catalog-footer"><p className="demo-caption">{content.popular.caption}</p><button id="catalog-motion-toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▷ Resume movement' : 'Ⅱ Pause movement'}</button></div>
      </section>
      <section className="newsletter shell reveal" aria-labelledby="newsletter-title"><div className="newsletter-inner"><p className="eyebrow">{content.banner.eyebrow}</p><h2 id="newsletter-title"><Lines lines={content.banner.title} /></h2>
        <div className="newsletter-bottom"><p><Lines lines={content.banner.description} /></p><a className="newsletter-link" href="#popular">{content.banner.action}<span><Icon name="arrow" /></span></a></div></div></section>
      </>}
    </main>
    <footer className="footer shell"><div className="footer-top"><div className="footer-brand"><Brand onHome={() => goHome('home')} /><p><Lines lines={content.footer.description} /></p><span className="demo-tag"><span /> INTERACTIVE DEMO</span></div>
      <div><h3>Discover</h3>{(['Movies', 'TV Shows', 'Kids'] as const).map((item, index) => <a key={item} href="#popular" onClick={() => selectCategory(item)}>{['Movies', 'Series', 'For the family'][index]}</a>)}</div>
      <div><h3>Your {content.brand}</h3><button onClick={() => setDialog({ type: 'list' })}>My watchlist</button><button onClick={() => setDialog({ type: 'search' })}>Find a movie</button><a href="/#taste" onClick={event => { event.preventDefault(); goHome('taste'); }}>Our recommendations</a></div>
      <div><h3>Explore</h3><a href="/#different" onClick={event => { event.preventDefault(); goHome('different'); }}>The experience</a><a href="/#popular" onClick={event => { event.preventDefault(); goHome(); }}>The collection</a><a href="/#home" onClick={event => { event.preventDefault(); goHome('home'); }}>Back to top ↑</a></div></div>
      <div className="footer-bottom"><span>© 2026 {content.brand}</span><span>{content.footer.note}</span></div>
    </footer>
    {dialog && <SearchDialog key={dialog.type} movies={dialog.type === 'list' ? savedMovies : catalog} listMode={dialog.type === 'list'} onSelect={openMovie} onClose={() => setDialog(null)} />}
    <div className={`toast${toast ? ' visible' : ''}`} role="status">{toast}</div>
  </div>;
}
