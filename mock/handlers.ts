/* eslint-disable no-console */
import { HttpResponse, http } from "msw";
import jobtaskInfo from "./jobtaskInfo_info.json";

export const handlers = [
  http.post(
    "/spk-mottak-api/api/v1/readParseFileAndValidateTransactions",
    () => {
      const message =
        "ReadAndParseFile av filer har startet, sjekk logger for status";
      console.log(message);
      return HttpResponse.json(message, { status: 202 });
    },
  ),

  http.post(
    "/spk-mottak-api/api/v1/sendUtbetalingTransaksjonToOppdragZ",
    () => {
      const message =
        "SendUtbetalingTransaksjonTilOppdrag har startet, sjekk logger for status";
      console.log(message);
      return HttpResponse.json(message, { status: 202 });
    },
  ),

  http.post("/spk-mottak-api/api/v1/sendTrekkTransaksjonToOppdragZ", () => {
    const message =
      "SendTrekkTransaksjonTilOppdrag har startet, sjekk logger for status";
    console.log(message);
    return HttpResponse.json(message, { status: 202 });
  }),

  http.post("/spk-mottak-api/api/v1/avstemming", () => {
    const message =
      "GrensesnittAvstemming har startet, sjekk logger for status";
    console.log(message);
    return HttpResponse.json(message, { status: 202 });
  }),

  http.get("/spk-mottak-api/api/v1/jobTaskInfo", () => {
    return HttpResponse.json(jobtaskInfo, { status: 200 });
  }),
];
