import { fetchApiSportsF1Live } from "./api-sports-f1.ts";
import { fetchApiSportsFootballLive } from "./api-sports-football.ts";
import { fetchApiSportsRugbyLive } from "./api-sports-rugby.ts";
import { fetchOpenF1Live } from "./openf1.ts";
import type { ProviderLiveUpdate } from "../types.ts";

export type ProviderFetchResult = {
  updates: ProviderLiveUpdate[];
  errors: string[];
};

export function apiSportsKey(
  env: NodeJS.Dict<string> = process.env,
): string {
  return (env.API_SPORTS_KEY ?? env.APISPORTS_KEY ?? "").trim();
}

/**
 * Pull live rows from configured providers. Missing keys skip that source.
 * API-Sports covers rugby + soccer + F1 with one key; OpenF1 is a no-key F1
 * fallback (live telemetry may require their paid plan).
 */
export async function fetchProviderUpdates(
  options: {
    fetchImpl?: typeof fetch;
    now?: Date;
    env?: NodeJS.Dict<string>;
    includeOpenF1?: boolean;
  } = {},
): Promise<ProviderFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? new Date();
  const env = options.env ?? process.env;
  const key = apiSportsKey(env);
  const errors: string[] = [];
  const jobs: Array<Promise<ProviderLiveUpdate[]>> = [];

  if (key) {
    jobs.push(
      fetchApiSportsRugbyLive(key, fetchImpl).catch((error: unknown) => {
        errors.push(error instanceof Error ? error.message : "rugby ingest failed");
        return [];
      }),
      fetchApiSportsFootballLive(key, fetchImpl).catch((error: unknown) => {
        errors.push(
          error instanceof Error ? error.message : "football ingest failed",
        );
        return [];
      }),
      fetchApiSportsF1Live(key, fetchImpl, now).catch((error: unknown) => {
        errors.push(error instanceof Error ? error.message : "F1 ingest failed");
        return [];
      }),
    );
  }

  const wantOpenF1 = options.includeOpenF1 ?? !key;
  if (wantOpenF1) {
    jobs.push(
      fetchOpenF1Live(fetchImpl, now).catch((error: unknown) => {
        errors.push(error instanceof Error ? error.message : "OpenF1 ingest failed");
        return [];
      }),
    );
  }

  if (jobs.length === 0) {
    return { updates: [], errors: ["No sports-data provider configured"] };
  }

  const batches = await Promise.all(jobs);
  return { updates: batches.flat(), errors };
}
