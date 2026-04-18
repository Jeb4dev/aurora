export async function fetchJson<T = unknown>(
  url: string,
  revalidate = 300,
): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate },
    headers: { "User-Agent": "space-weather/1.0 (aurora info-screen)" },
  });
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function safe<T>(
  fn: () => Promise<T>,
  errors: string[],
  label: string,
): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
