import { getStore } from '@netlify/blobs';

const KEY_RE = /^tbc:[a-zA-Z0-9_-]+(:[a-zA-Z0-9_-]+)?$/;
const MAX_BYTES = 20000;

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') || '';

  if (!KEY_RE.test(key)) {
    return new Response(JSON.stringify({ error: 'invalid key' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const store = getStore('toddler-book-club');

  if (req.method === 'GET') {
    const value = await store.get(key);
    return new Response(JSON.stringify({ value: value ?? null }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  if (req.method === 'POST') {
    const body = await req.text();
    if (body.length > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'payload too large' }), {
        status: 413,
        headers: { 'content-type': 'application/json' }
      });
    }
    try {
      JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: 'body must be JSON' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    await store.set(key, body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: '/api/store' };
