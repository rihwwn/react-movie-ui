import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import { readFile } from 'node:fs/promises';
import data from '../public/catalog.json';
import { siteContent } from './content';
import { titleDetails } from './titleDetails';
import { catalogQuery, filterTitles, loadCatalog, parseCatalog, splitMovieRows } from './catalog';

const catalog = parseCatalog(data);
afterEach(() => mock.restoreAll());

test('search and category filters work together', () => {
  assert.equal(filterTitles(catalog).length, 18);
  assert.deepEqual(filterTitles(catalog, null, '  HOPPERS  ').map(movie => movie.id), ['hoppers']);
  assert.deepEqual(filterTitles(catalog, 'Anime').map(movie => movie.id), ['irregular', 'apothecary', 'witch-hat', 'frieren']);
  assert.equal(filterTitles(catalog, 'TV Shows', 'fantasy').length, 4);
  assert.equal(filterTitles(catalog, 'Movies', 'no-such-title').length, 0);
});

test('moving rows preserve all filtered titles', () => {
  for (const count of [0, 1, 2, 5, 9, 10]) {
    const titles = catalog.slice(0, count);
    const rows = splitMovieRows(titles);
    assert.deepEqual(rows.flat(), titles);
    assert.ok(rows.length <= 2 && rows.every(row => row.length));
  }
});

test('API validation rejects malformed and duplicate movie records', async () => {
  assert.throws(() => parseCatalog([{ ...catalog[0], title: null }]), /unavailable/);
  assert.throws(() => parseCatalog([catalog[0], catalog[0]]), /unavailable/);
  assert.throws(() => parseCatalog([{ ...catalog[0], categories: ['unknown'] }]), /unavailable/);
  assert.throws(() => parseCatalog([{ ...catalog[0], language: undefined }]), /unavailable/);
  for (const backdrop of ['https://example.com/art.jpg', 'assets/../private.jpg']) {
    assert.throws(() => parseCatalog([{ ...catalog[0], backdrop }]), /unavailable/);
  }
  mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(loadCatalog(), /could not be loaded/);
  mock.method(globalThis, 'fetch', async () => new Response('not JSON'));
  await assert.rejects(loadCatalog(), /invalid response/);
});

test('React Query caches catalog requests and supplies an abort signal', async () => {
  const fetch = mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, init?: RequestInit) => {
    assert.ok(init?.signal instanceof AbortSignal);
    return new Response(JSON.stringify(data));
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  try {
    await client.fetchQuery(catalogQuery);
    await client.fetchQuery(catalogQuery);
    assert.equal(fetch.mock.callCount(), 1);
  } finally { client.clear(); }
});

test('curated titles resolve and all artwork, fonts and sample video are available', async () => {
  assert.deepEqual(Object.keys(titleDetails).sort(), catalog.map(movie => movie.id).sort());
  for (const movie of catalog) {
    const details = titleDetails[movie.id];
    assert.ok(details.cast.length && details.leads.length && details.country);
    assert.equal(!!details.seasonEpisodeCounts, movie.categories.includes('TV Shows'));
    details.seasonEpisodeCounts?.forEach(count => assert.ok(Number.isInteger(count) && count > 0));
  }
  const featuredIds = [...siteContent.hero.movieIds, ...siteContent.taste.movieIds, siteContent.feature.movieId];
  assert.equal(new Set(featuredIds).size, featuredIds.length);
  for (const id of featuredIds) {
    assert.ok(catalog.some(movie => movie.id === id), id);
  }
  for (const file of [...catalog.flatMap(movie => movie.backdrop ? [movie.image, movie.backdrop] : [movie.image]), 'assets/outfit-300.ttf', 'assets/outfit-400.ttf', 'assets/outfit-700.ttf', 'assets/sample.mp4']) {
    assert.ok((await readFile(new URL(`../public/${file}`, import.meta.url))).length > 1000, file);
  }
});
