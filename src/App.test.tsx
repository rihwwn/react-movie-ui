import './test-setup';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import data from '../public/catalog.json';
import { catalogQuery, parseCatalog } from './catalog';
import { Carousel } from './components/Carousel';
import { MovieRows } from './components/MovieRows';
import App from './App';

const clients: QueryClient[] = [];
function renderApp(cached = true) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  if (cached) client.setQueryData(catalogQuery.queryKey, parseCatalog(data));
  return render(<QueryClientProvider client={client}><App /></QueryClientProvider>);
}
beforeEach(() => { localStorage.clear(); window.history.replaceState(null, '', '/'); });
afterEach(() => { cleanup(); clients.splice(0).forEach(client => client.clear()); mock.restoreAll(); });

test('category tabs keep moving rows in sync and hide duplicate cards from keyboard navigation', () => {
  renderApp();
  const panel = screen.getByRole('tabpanel');
  assert.equal(panel.querySelectorAll('.movie-row').length, 2);
  const cards = within(panel).getAllByRole('button');
  assert.equal(cards.length, 10);
  const featuredTitles = new Set([...document.querySelectorAll('.slide, .feature-art')]
    .map(card => card.getAttribute('aria-label')!.replace(/^(Explore|Show) /, '')));
  cards.forEach(card => assert.equal(featuredTitles.has(card.getAttribute('aria-label')!.replace(/^Explore /, '')), false));
  panel.querySelectorAll<HTMLButtonElement>('[aria-hidden="true"].movie-card').forEach(card => assert.equal(card.tabIndex, -1));
  fireEvent.click(screen.getByRole('tab', { name: 'Anime' }));
  assert.deepEqual(within(panel).getAllByRole('button').map(button => button.getAttribute('aria-label')), ['Explore The Irregular at Magic High School: Yotsuba Succession Arc']);
  assert.equal(panel.querySelectorAll('.movie-card').length, 1);
  fireEvent.click(screen.getByRole('button', { name: /Pause movement/ }));
  assert.ok(document.querySelector('.app.motion-paused'));
  assert.ok(screen.getByRole('button', { name: /Resume movement/ }));
});

test('short collections show each poster once in a manually scrollable row', () => {
  const movies = parseCatalog(data).slice(0, 4);
  let selected = '';
  render(<MovieRows movies={movies} onSelect={movie => { selected = movie.id; }} />);
  assert.equal(document.querySelectorAll('.movie-row.is-static').length, 1);
  assert.equal(document.querySelectorAll('.movie-card').length, 4);
  assert.equal(document.querySelectorAll('.movie-group[aria-hidden="true"], .movie-card[aria-hidden="true"]').length, 0);
  const cards = screen.getAllByRole('button');
  assert.deepEqual(cards.map(card => card.querySelector('img')?.getAttribute('src')), movies.map(movie => movie.image));
  fireEvent.click(cards[2]);
  assert.equal(selected, movies[2].id);
});

test('search, movie details and a persisted watchlist work through React state', () => {
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));
  let dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: ' hoppers ' } });
  assert.equal(within(dialog).getAllByRole('button', { name: /^Explore / }).length, 1);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Explore Hoppers' }));
  const page = screen.getByRole('article', { name: 'Hoppers' });
  assert.equal(screen.queryByRole('dialog'), null);
  assert.equal(new URLSearchParams(window.location.search).get('title'), 'hoppers');
  assert.ok(within(page).getByRole('heading', { name: 'Hoppers', level: 1 }));
  fireEvent.click(within(page).getByRole('button', { name: /My list/ }));
  assert.deepEqual(JSON.parse(localStorage.getItem('react-movie-ui-watchlist')!), ['hoppers']);
  fireEvent.click(within(page).getByRole('button', { name: 'Back to collection' }));
  fireEvent.click(screen.getByRole('button', { name: 'My list 1' }));
  assert.equal(within(screen.getByRole('dialog')).getAllByRole('button', { name: /^Explore / }).length, 1);
});

test('storage failures keep the watchlist usable for this visit', () => {
  localStorage.setItem('react-movie-ui-watchlist', 'malformed');
  renderApp();
  fireEvent.click(within(screen.getByRole('tabpanel')).getByRole('button', { name: 'Explore Digger' }));
  mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('storage denied'); });
  fireEvent.click(within(screen.getByRole('article', { name: 'Digger' })).getByRole('button', { name: /My list/ }));
  assert.ok(screen.getByRole('button', { name: 'My list 1' }));
  assert.ok(screen.getByText(/Saved for this visit/));
});

test('carousel selection opens a full title page and playback stops when leaving it', async () => {
  const play = mock.method(HTMLMediaElement.prototype, 'play', async () => {});
  const pause = mock.method(HTMLMediaElement.prototype, 'pause', () => {});
  renderApp();
  const carousel = screen.getByRole('region', { name: 'Featured movies' });
  fireEvent.click(within(carousel).getByRole('button', { name: 'Next featured movie' }));
  await waitFor(() => assert.ok(within(carousel).getByRole('button', { name: 'Explore Toy Story 5' })));
  fireEvent.click(within(carousel).getByRole('button', { name: 'Explore Toy Story 5' }));
  const page = screen.getByRole('article', { name: 'Toy Story 5' });
  assert.ok(within(page).getByRole('heading', { name: 'Toy Story 5', level: 1 }));
  assert.equal(page.querySelector('.title-backdrop')?.getAttribute('src'), data.find(movie => movie.id === 'toy-story')?.backdrop);
  const watch = within(page).getByRole('button', { name: 'Watch demo' });
  fireEvent.click(watch);
  fireEvent.click(watch);
  assert.equal(play.mock.callCount(), 2);
  assert.equal(page.querySelector<HTMLElement>('.title-player')?.hidden, false);
  fireEvent.click(within(page).getByRole('button', { name: 'Back to collection' }));
  assert.equal(pause.mock.callCount(), 1);
});

test('hero controls wrap in both directions and preserve selection with the refined card geometry', async () => {
  renderApp();
  const carousel = screen.getByRole('region', { name: 'Featured movies' });
  const previous = within(carousel).getByRole('button', { name: 'Previous featured movie' });
  const pivot = (slide: Element | null) => (slide as HTMLElement).style.getPropertyValue('--wave-origin');
  const leftPivot = pivot(carousel.querySelector('.slide[data-side="previous"]'));
  assert.equal(leftPivot, '100%');
  const first = carousel.querySelector('.slide.is-center')!;
  fireEvent.click(previous);
  await waitFor(() => assert.equal(carousel.querySelector('.slide.is-center')?.getAttribute('aria-label'), 'Explore The Odyssey'));
  assert.equal(first.getAttribute('data-side'), 'next');
  assert.equal(pivot(first), '0%');
  assert.equal(pivot(carousel.querySelector('.slide.is-center')), leftPivot);
  fireEvent.click(previous);
  await waitFor(() => assert.equal(carousel.querySelector('.slide.is-center')?.getAttribute('aria-label'), 'Explore The Apothecary Diaries · Season 3'));
  const current = carousel.querySelector('.slide.is-center')!;
  assert.equal(current.getAttribute('data-side'), 'current');
  assert.equal(current.querySelectorAll('.slide-meta use').length, 3);
  assert.match(current.querySelector('.slide-meta')!.textContent!, /FormatSeason 3.*Japanese/);
  const rightPivot = pivot(carousel.querySelector('.slide[data-side="next"]'));
  assert.equal(rightPivot, '0%');
  fireEvent.keyDown(current, { key: 'ArrowRight' });
  await waitFor(() => assert.equal(carousel.querySelector('.slide.is-center')?.getAttribute('aria-label'), 'Explore The Odyssey'));
  assert.equal(current.getAttribute('data-side'), 'previous');
  assert.equal(pivot(current), '100%');
  assert.equal(pivot(carousel.querySelector('.slide.is-center')), rightPivot);
  assert.equal(carousel.querySelector('.slide[data-side="next"]')?.getAttribute('aria-label'), 'Show Spider-Man: Brand New Day');
});

test('hero fades copy before one continuous move and replays it without replacing images', async () => {
  render(<Carousel movies={parseCatalog(data).slice(0, 3)} variant="hero" paused onSelect={() => {}} />);
  const carousel = screen.getByRole('region', { name: 'Featured movies' });
  const first = carousel.querySelector<HTMLButtonElement>('.slide.is-center')!;
  const firstImage = first.querySelector('img')!;
  const firstCopy = first.querySelector('.slide-content');
  assert.equal(first.classList.contains('is-image-ready'), false);
  fireEvent.load(firstImage);
  assert.equal(first.classList.contains('is-image-ready'), true);

  const next = within(carousel).getByRole('button', { name: 'Next featured movie' });
  fireEvent.click(next);
  assert.equal(carousel.querySelector('.slide.is-center'), first);
  assert.ok(carousel.classList.contains('is-changing'));
  assert.equal((next as HTMLButtonElement).disabled, true);
  fireEvent.click(next);
  await waitFor(() => assert.equal(carousel.querySelector('.slide.is-center') === first, false));
  assert.equal(carousel.classList.contains('is-changing'), false);
  assert.equal(first.getAttribute('data-side'), 'previous');
  assert.equal(first.querySelector('img'), firstImage);
  assert.notEqual(first.querySelector('.slide-content'), firstCopy);

  const incoming = carousel.querySelector('.slide.is-center')!;
  assert.equal(incoming.classList.contains('is-image-ready'), false);
  fireEvent.error(incoming.querySelector('img')!);
  assert.ok(incoming.classList.contains('is-image-ready'));
  fireEvent.click(within(carousel).getByRole('button', { name: 'Previous featured movie' }));
  await waitFor(() => assert.equal(carousel.querySelector('.slide.is-center') === first, true));
  assert.ok(first.classList.contains('is-image-ready'));
  assert.notEqual(first.querySelector('.slide-content'), firstCopy);
});

test('reduced motion skips the hero transition delay', () => {
  const matchMedia = window.matchMedia;
  mock.method(window, 'matchMedia', (query: string) => ({ ...matchMedia(query), matches: true }));
  render(<Carousel movies={parseCatalog(data).slice(0, 3)} variant="hero" paused onSelect={() => {}} />);
  const carousel = screen.getByRole('region', { name: 'Featured movies' });
  const first = carousel.querySelector('.slide.is-center');
  fireEvent.click(within(carousel).getByRole('button', { name: 'Next featured movie' }));
  assert.notEqual(carousel.querySelector('.slide.is-center'), first);
  assert.equal(carousel.classList.contains('is-changing'), false);
});

test('hero intro starts after artwork settles and also recovers from failed artwork', () => {
  for (const event of ['load', 'error'] as const) {
    renderApp();
    const app = document.querySelector('.app')!;
    assert.equal(app.classList.contains('hero-ready'), false);
    const carousel = screen.getByRole('region', { name: 'Featured movies' });
    assert.equal(carousel.querySelector('.slide.is-center img')?.getAttribute('src'), data.find(movie => movie.id === 'spider-man')?.backdrop);
    fireEvent[event](carousel.querySelector('.slide.is-center img')!);
    assert.equal(app.classList.contains('hero-ready'), true);
    assert.equal(screen.getByRole('link', { name: 'Get started' }).getAttribute('href'), '#popular');
    assert.equal(screen.getByRole('link', { name: 'Explore picks' }).getAttribute('href'), '#taste');
    cleanup();
  }
});

test('recommendation controls, dots and keyboard stay in sync without restarting artwork entry', () => {
  renderApp();
  const carousel = screen.getByRole('region', { name: 'Recommended movies' });
  const dots = within(carousel).getByRole('group', { name: 'Choose recommendation' });
  const first = within(carousel).getByRole('button', { name: 'Explore The Social Reckoning' });
  const artwork = first.querySelector('.taste-art');
  const entryDelay = first.style.getPropertyValue('--entry-delay');
  assert.equal(first.querySelector('.slide-genre')?.textContent, 'Drama · Thriller');
  fireEvent.load(first.querySelector('img')!);
  assert.ok(carousel.classList.contains('is-art-ready'));

  fireEvent.click(within(carousel).getByRole('button', { name: 'Previous recommendation' }));
  assert.ok(within(carousel).getByRole('button', { name: "Explore Frieren: Beyond Journey's End · Season 2" }));
  assert.equal(first.querySelector('.taste-art'), artwork);
  assert.equal(first.style.getPropertyValue('--entry-delay'), entryDelay);
  const wildwood = within(dots).getByRole('button', { name: 'Show Wildwood' });
  fireEvent.click(wildwood);
  assert.equal(wildwood.getAttribute('aria-pressed'), 'true');
  assert.equal(within(dots).getAllByRole('button', { pressed: true }).length, 1);
  fireEvent.keyDown(carousel.querySelector('.slide.is-center')!, { key: 'ArrowRight' });
  assert.equal(document.activeElement?.getAttribute('aria-label'), 'Explore Witch Hat Atelier');
  fireEvent.click(within(carousel).getByRole('button', { name: 'Next recommendation' }));
  assert.ok(within(carousel).getByRole('button', { name: 'Explore Hoppers' }));
  fireEvent.click(within(carousel).getByRole('button', { name: 'Previous recommendation' }));
  fireEvent.click(within(carousel).getByRole('button', { name: 'Explore Witch Hat Atelier' }));
  assert.ok(screen.getByRole('heading', { name: 'Witch Hat Atelier', level: 1 }));
});

test('recommendation entry waits for its center image and viewport, then stays entered after scrolling away', () => {
  let reportVisibility: (visible: boolean) => void = () => { throw new Error('Carousel was not observed'); };
  mock.method(globalThis, 'IntersectionObserver', function (callback: IntersectionObserverCallback) {
    const observer = { observe() {}, disconnect() {}, unobserve() {} };
    reportVisibility = visible => callback([{ isIntersecting: visible } as IntersectionObserverEntry], observer as unknown as IntersectionObserver);
    return observer;
  } as unknown as typeof IntersectionObserver);
  const movies = parseCatalog(data).slice(0, 3).map(movie => ({ ...movie, categories: movie.categories.filter(category => category !== 'Animation'), genre: 'Mystery' }));
  render(<Carousel movies={movies} variant="taste" paused onSelect={() => {}} />);
  const carousel = screen.getByRole('region', { name: 'Recommended movies' });
  assert.equal(carousel.classList.contains('has-entered'), false);
  fireEvent.load(carousel.querySelector('.slide:not(.is-center) img')!);
  assert.equal(carousel.classList.contains('is-art-ready'), false);
  fireEvent.error(carousel.querySelector('.slide.is-center img')!);
  assert.ok(carousel.classList.contains('is-art-ready'));
  assert.equal(carousel.querySelector('.slide.is-center .slide-genre')?.textContent, 'Mystery');
  act(() => reportVisibility(true));
  assert.ok(carousel.classList.contains('has-entered'));
  act(() => reportVisibility(false));
  assert.ok(carousel.classList.contains('has-entered'));
});

test('failed API requests show a retry action that reloads through React Query', async () => {
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  renderApp(false);
  const retry = await screen.findByRole('button', { name: 'Try again' });
  assert.match(screen.getByRole('alert').textContent!, /could not be loaded/);
  assert.ok(document.querySelector('.app.hero-ready'));
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify(data)));
  fireEvent.click(retry);
  await waitFor(() => assert.equal(within(screen.getByRole('tabpanel')).getAllByRole('button').length, 10));
  assert.equal(fetch.mock.callCount(), 2);
});

test('direct series links support season selection, the full episode guide and playback', () => {
  window.history.replaceState(null, '', '/?title=dragons');
  const play = mock.method(HTMLMediaElement.prototype, 'play', async () => {});
  renderApp();
  assert.ok(screen.getByRole('heading', { name: 'House of the Dragon · Season 3', level: 1 }));
  assert.equal(document.activeElement?.id, 'title-heading');
  const guide = screen.getByRole('region', { name: /^Episodes/ });
  const season = within(guide).getByRole('combobox');
  assert.equal((season as HTMLSelectElement).value, '3');
  assert.equal(within(guide).getAllByRole('listitem').length, 4);
  fireEvent.change(season, { target: { value: '1' } });
  fireEvent.click(within(guide).getByRole('button', { name: 'Show all 10 episodes ↓' }));
  assert.equal(within(guide).getAllByRole('listitem').length, 10);
  fireEvent.click(within(guide).getByRole('button', { name: 'Play S1 E6' }));
  assert.ok(screen.getByRole('heading', { name: 'S1 E6 · Demo preview' }));
  assert.equal(play.mock.callCount(), 1);
  fireEvent.change(season, { target: { value: '3' } });
  assert.equal(within(guide).getAllByRole('listitem').length, 4);
  assert.ok(within(guide).getByRole('button', { name: 'Show all 8 episodes ↓' }));
});

test('browser back and forward restore the collection and title, and direct links survive remounting', async () => {
  renderApp();
  fireEvent.click(within(screen.getByRole('tabpanel')).getByRole('button', { name: 'Explore Digger' }));
  assert.equal(window.location.search, '?title=digger');
  window.history.back();
  await screen.findByRole('region', { name: 'Featured movies' });
  assert.equal(window.location.search, '');
  window.history.forward();
  await screen.findByRole('heading', { name: 'Digger', level: 1 });
  cleanup();
  renderApp();
  assert.ok(screen.getByRole('heading', { name: 'Digger', level: 1 }));
  assert.equal(document.querySelector('title')?.textContent, 'Digger (2026) — Movie UI');
});

test('direct title links recover from fetch errors and unknown titles return to the collection', async () => {
  window.history.replaceState(null, '', '/?title=spider-man');
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  renderApp(false);
  const retry = await screen.findByRole('button', { name: 'Try again' });
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify(data)));
  fireEvent.click(retry);
  await screen.findByRole('heading', { name: 'Spider-Man: Brand New Day', level: 1 });
  cleanup();
  window.history.replaceState(null, '', '/?title=missing-title');
  renderApp();
  assert.ok(screen.getByRole('heading', { name: 'Title not found' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back to collection' }));
  assert.ok(screen.getByRole('region', { name: 'Featured movies' }));
  assert.equal(window.location.search, '');
});

test('preview playback failures are recoverable on the title page', async () => {
  window.history.replaceState(null, '', '/?title=odyssey');
  const play = mock.method(HTMLMediaElement.prototype, 'play', async () => { throw new Error('blocked'); });
  renderApp();
  fireEvent.click(screen.getByRole('button', { name: 'Watch demo' }));
  await screen.findByText(/Use the player controls/);
  play.mock.mockImplementation(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Watch demo' }));
  assert.equal(screen.queryByText(/Use the player controls/), null);
  assert.equal(play.mock.callCount(), 2);
});
