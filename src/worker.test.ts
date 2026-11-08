import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import worker from './worker';

test('the bare demo path redirects to its directory and keeps the title query', async () => {
  const fetch = mock.fn(async () => new Response('must not be called'));
  for (const method of ['GET', 'HEAD']) {
    const response = await worker.fetch(new Request('https://example.com/react-movie-ui?title=digger', { method }), { ASSETS: { fetch } });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('Location'), 'https://example.com/react-movie-ui/?title=digger');
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test('mounted assets keep query, method, range headers and the original response', async () => {
  const asset = new Response('clip', { status: 206, headers: { 'Content-Range': 'bytes 0-3/100' } });
  const fetch = mock.fn(async (_request: Request) => asset);
  const request = new Request('https://example.com/react-movie-ui/assets/sample.mp4?v=1', { method: 'HEAD', headers: { Range: 'bytes=0-3' } });
  const response = await worker.fetch(request, { ASSETS: { fetch } });
  const forwarded = fetch.mock.calls[0].arguments[0];
  assert.equal(forwarded.url, 'https://example.com/assets/sample.mp4?v=1');
  assert.equal(forwarded.method, 'HEAD');
  assert.equal(forwarded.headers.get('Range'), 'bytes=0-3');
  assert.equal(response, asset);
});

test('asset redirects stay under the public demo path and external redirects stay intact', async () => {
  for (const [location, expected] of [
    ['https://example.com/?title=digger', 'https://example.com/react-movie-ui/?title=digger'],
    ['/?title=digger', 'https://example.com/react-movie-ui/?title=digger'],
    ['https://other.example/path', 'https://other.example/path'],
  ]) {
    const fetch = async () => new Response(null, { status: 308, headers: { Location: location, 'Cache-Control': 'no-store' } });
    const response = await worker.fetch(new Request('https://example.com/react-movie-ui/index.html'), { ASSETS: { fetch } });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('Location'), expected);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('root hosting works and similar prefixes are not stripped', async () => {
  for (const path of ['/', '/catalog.json', '/react-movie-ui-other/catalog.json']) {
    const asset = new Response('not found', { status: 404 });
    const fetch = mock.fn(async (_request: Request) => asset);
    assert.equal(await worker.fetch(new Request('https://example.com' + path), { ASSETS: { fetch } }), asset);
    assert.equal(fetch.mock.calls[0].arguments[0].url, 'https://example.com' + path);
  }
});
