import useSWRImmutable from "swr/immutable";
import { SpkResponse } from "../types/SpkResponse";
import { axiosFetcher, axiosPostFetcher } from "./apiConfig";

export const BASE_API_URL = "/spk-mottak-api/api/v1";

const swrConfig = {
  fetcher: <T>(url: string) => axiosFetcher<T>(BASE_API_URL, url),
  suspense: true,
  revalidateOnFocus: false,
  refreshInterval: 600000,
};

export function useGetjobTaskInfo() {
  return useSWRImmutable<SpkResponse>(`/jobTaskInfo`, swrConfig);
}

export async function postReadAndParseFile() {
  return await axiosPostFetcher(
    BASE_API_URL,
    "/readParseFileAndValidateTransactions",
  );
}

export async function postSendUtbetalingTransaksjon() {
  return await axiosPostFetcher(
    BASE_API_URL,
    "/sendUtbetalingTransaksjonToOppdragZ",
  );
}
export async function postSendTrekkTransaksjon() {
  return await axiosPostFetcher(
    BASE_API_URL,
    "/sendTrekkTransaksjonToOppdragZ",
  );
}
export async function postAvstemming() {
  return await axiosPostFetcher(BASE_API_URL, "/avstemming");
}
