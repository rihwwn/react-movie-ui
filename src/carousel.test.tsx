import './test-setup';
import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { CinemaCarousel } from '@rihwwn/meeu-carousel';

const items = [
  { id: 'a', title: 'First story', image: '/poster-a.jpg', backdrop: '/wide-a.jpg', url: '/a' },
  { id: 'b', title: 'Second story', image: '/poster-b.jpg', url: '/b' },
  { id: 'c', title: 'Third story', image: '/poster-c.jpg', url: '/c' },
];
afterEach(() => { cleanup(); mock.restoreAll(); Reflect.deleteProperty(document, 'hidden'); });

test('standalone instances own their SVG definitions and preserve custom item data', () => {
  let selected = '';
  render(<><CinemaCarousel items={items} autoplay={false} onSelect={item => { selected = item.url; }} />
    <CinemaCarousel items={items} variant="taste" autoplay={false} /></>);
  const clips = [...document.querySelectorAll('clipPath')].map(clip => clip.id);
  assert.equal(clips.length, 2);
  assert.equal(new Set(clips).size, 2);
  const hero = screen.getByRole('region', { name: 'Featured movies' });
  assert.ok(hero.getAttribute('style')?.includes(clips[0]));
  assert.equal(hero.querySelector('.slide-kicker'), null);
  assert.equal(hero.querySelector('.slide-meta'), null);
  assert.equal(hero.querySelector('.slide.is-center img')?.getAttribute('src'), '/wide-a.jpg');
  fireEvent.click(within(hero).getByRole('button', { name: 'Explore First story' }));
  assert.equal(selected, '/a');
  assert.equal(screen.getByRole('region', { name: 'Recommended movies' }).querySelector('.rating'), null);
});

test('empty, single-item and replaced collections recover without stale selection', async () => {
  const { container, rerender } = render(<CinemaCarousel items={[]} autoplay={false} />);
  assert.equal(container.children.length, 0);
  rerender(<CinemaCarousel items={items.slice(0, 1)} autoplay={false} initialIndex={20} />);
  assert.equal(screen.getAllByRole('button').length, 1);
  assert.ok(screen.getByRole('button', { name: 'Explore First story' }));
  rerender(<CinemaCarousel items={items} autoplay={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Next featured movie' }));
  await waitFor(() => assert.ok(screen.getByRole('button', { name: 'Explore Second story' })));
  rerender(<CinemaCarousel items={[items[2]]} autoplay={false} />);
  assert.equal(screen.getAllByRole('button').length, 1);
  assert.ok(screen.getByRole('button', { name: 'Explore Third story' }));
});

test('the actual image URL controls readiness when artwork changes', () => {
  const { container, rerender } = render(<CinemaCarousel items={items} autoplay={false} />);
  fireEvent.load(container.querySelector('.slide.is-center img')!);
  assert.ok(container.querySelector('.slide.is-center.is-image-ready'));
  rerender(<CinemaCarousel items={items.map(item => ({ ...item, backdrop: '/replacement-' + item.id + '.jpg' }))} autoplay={false} />);
  assert.equal(container.querySelector('.slide.is-center.is-image-ready'), null);
  fireEvent.load(container.querySelector('.slide.is-center img')!);
  assert.ok(container.querySelector('.slide.is-center.is-image-ready'));
});

test('using the carousel inside a form does not submit the surrounding form', () => {
  let submissions = 0;
  let selections = 0;
  render(<form onSubmit={event => { event.preventDefault(); submissions++; }}>
    <CinemaCarousel items={items} variant="taste" autoplay={false} onSelect={() => { selections++; }} />
  </form>);
  fireEvent.click(screen.getByRole('button', { name: 'Explore First story' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next recommendation' }));
  fireEvent.click(within(screen.getByRole('group')).getByRole('button', { name: 'Show Third story' }));
  assert.equal(selections, 1);
  assert.equal(submissions, 0);
});

test('autoplay advances only when enabled and respects reduced motion and focus', async () => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  let tick: () => void = () => { throw new Error('Autoplay was not registered'); };
  const timer = mock.method(window, 'setInterval', (callback: TimerHandler) => { tick = callback as () => void; return 123; });
  const { rerender } = render(<CinemaCarousel items={items} interval={1000} />);
  assert.ok(timer.mock.callCount() > 0);
  const first = screen.getByRole('button', { name: 'Explore First story' });
  first.focus(); act(() => tick());
  assert.ok(screen.getByRole('button', { name: 'Explore First story' }));
  first.blur(); act(() => tick());
  await waitFor(() => assert.ok(screen.getByRole('button', { name: 'Explore Second story' })));
  timer.mock.resetCalls();
  rerender(<CinemaCarousel items={items} paused interval={1000} />);
  assert.equal(timer.mock.callCount(), 0);
  cleanup();
  const original = window.matchMedia;
  mock.method(window, 'matchMedia', (query: string) => ({ ...original(query), matches: true }));
  timer.mock.resetCalls();
  render(<CinemaCarousel items={items} />);
  assert.equal(timer.mock.callCount(), 0);
});

test('server rendering works and missing IntersectionObserver leaves artwork usable', () => {
  assert.match(renderToString(<CinemaCarousel items={items} />), /First story/);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver')!;
  Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: undefined });
  try {
    render(<CinemaCarousel items={items} variant="taste" autoplay={false} />);
    const region = screen.getByRole('region');
    fireEvent.load(region.querySelector('.slide.is-center img')!);
    assert.ok(region.classList.contains('has-entered'));
    assert.ok(region.classList.contains('is-art-ready'));
  } finally { Object.defineProperty(globalThis, 'IntersectionObserver', descriptor); }
});
