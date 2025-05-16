
import { GetSpeseOptions, GetMovimentiOptions, SpesaPersonale, MovimentoAziendale } from "@/lib/types/spese";

export type { GetSpeseOptions, GetMovimentiOptions };

export interface GetSpeseResponse {
  data: SpesaPersonale[];
  count: number;
  error: Error | null;
}

export interface GetMovimentiResponse {
  data: MovimentoAziendale[];
  count: number;
  error: Error | null;
}
