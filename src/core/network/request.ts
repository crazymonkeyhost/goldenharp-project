export async function request(url: string, options: RequestOptions): Promise<Response> {
  const headers = {
    'Content-Type': 'text/plain',
    ...options.headers,
  };

  const query = options.query ? new URLSearchParams(options.query).toString() : '';

  const fullUrl = `${url}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: options.method === 'POST' && options.body ? new URLSearchParams(options.body).toString() : null,
    });

    return response;
  } catch (error) {
    throw new Error(`API request failed: ${error}`);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  query?: Record<string, string> | null;
  body?: Record<string, string> | string | null;
  headers?: Record<string, string>;
};
