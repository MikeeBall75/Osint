import { prisma } from "./prisma";

interface SearchResult {
  source: string;
  data: Record<string, unknown>;
  error?: string;
}

export async function executeSearch(
  query: string,
  queryType: "email" | "phone"
): Promise<SearchResult[]> {
  const integrations = await prisma.apiIntegration.findMany({
    where: {
      enabled: true,
      OR: [{ type: queryType }, { type: "both" }],
    },
  });

  const results = await Promise.allSettled(
    integrations.map(async (integration) => {
      const headers: Record<string, string> = JSON.parse(
        integration.headers || "{}"
      );
      const endpoint = integration.endpointTemplate.replace(
        /\{\{query\}\}/g,
        encodeURIComponent(query)
      );
      const url = `${integration.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const mapping: Record<string, string> = JSON.parse(
        integration.responseMapping || "{}"
      );
      const mapped = applyMapping(data, mapping);

      return {
        source: integration.name,
        data: mapped,
      };
    })
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      source: integrations[i].name,
      data: {},
      error: result.reason?.message || "Unknown error",
    };
  });
}

function applyMapping(
  data: unknown,
  mapping: Record<string, string>
): Record<string, unknown> {
  if (Object.keys(mapping).length === 0) {
    return { raw: data };
  }

  const result: Record<string, unknown> = {};
  for (const [key, path] of Object.entries(mapping)) {
    result[key] = extractValue(data, path);
  }
  return result;
}

function extractValue(data: unknown, path: string): unknown {
  const parts = path.replace(/^\$\./, "").split(".");
  let current: unknown = data;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!isNaN(index)) {
        current = current[index];
        continue;
      }
      const remainingPath = parts.slice(i).join(".");
      return current.map((item) => extractValue(item, remainingPath));
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
