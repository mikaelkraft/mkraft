export function json(body, init = {}) {
  const status = init.status || 200;
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

export function error(message, status = 400, extra = {}) {
  return json({ error: message, ...extra }, { status });
}
