import useSWRImmutable from "swr/immutable";
import { SpkResponse } from "../types/SpkResponse";
import { axiosFetcher } from "./apiConfig";

export const BASE_API_URL = "/spk-mottak-api/api/v1";

const swrConfig = {
  fetcher: <T>(url: string) => axiosFetcher<T>(BASE_API_URL, url),
  suspense: true,
  revalidateOnFocus: false,
  refreshInterval: 120000,
};

export function useGetReadParseFile() {
  return useSWRImmutable<SpkResponse>(
    `/readParseFileAndValidateTransactions`,
    swrConfig,
  );
}

export function useGetSendUtbetalingTransaksjon() {
  return useSWRImmutable<SpkResponse>(
    `/sendUtbetalingTransaksjonToOppdragZ`,
    swrConfig,
  );
}

export function useGetSendTrekkTransaksjon() {
  return useSWRImmutable<SpkResponse>(
    `/sendTrekkTransaksjonToOppdragZ`,
    swrConfig,
  );
}

export function useGetAvstemming() {
  return useSWRImmutable<SpkResponse>(`/avstemming`, swrConfig);
}
