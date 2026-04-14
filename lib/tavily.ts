// Cliente Tavily — búsqueda de señales públicas para perfiles de identidad

const TAVILY_API_URL = "https://api.tavily.com/search";

export interface TavilySignal {
  title: string;
  url: string;
  content: string;
  score: number;
}

async function search(query: string): Promise<TavilySignal[]> {
  const res = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({ query, max_results: 5, search_depth: "advanced" }),
  });

  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  const data = await res.json();
  return data.results as TavilySignal[];
}

export async function searchPersonSignals(name: string, country: string) {
  const queries = [
    `"${name}" ${country} fraude estafa sanciones`,
    `"${name}" ${country} noticias crédito finanzas`,
    `"${name}" ${country} redes sociales LinkedIn`,
  ];

  const results = await Promise.all(queries.map(search));
  return results.flat();
}
