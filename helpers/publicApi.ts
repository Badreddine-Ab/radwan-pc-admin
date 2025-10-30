export const PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_HOST || '').replace(/\/+$/,'');
export const apiUrl = (path: string) =>
  `${PUBLIC_API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
