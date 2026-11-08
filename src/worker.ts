const prefix = '/react-movie-ui';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === prefix) {
      url.pathname += '/';
      return Response.redirect(url.href, 307);
    }

    const mounted = url.pathname.startsWith(prefix + '/');
    if (mounted) url.pathname = url.pathname.slice(prefix.length);
    const response = await env.ASSETS.fetch(new Request(url, request));
    const location = response.headers.get('Location');
    if (!mounted || !location) return response;

    const target = new URL(location, url);
    if (target.origin !== url.origin) return response;
    // Assets can redirect /index.html to /; keep that redirect inside the demo.
    target.pathname = prefix + target.pathname;
    const redirected = new Response(response.body, response);
    redirected.headers.set('Location', target.href);
    return redirected;
  },
};
