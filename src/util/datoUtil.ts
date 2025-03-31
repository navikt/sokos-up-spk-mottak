import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const NORSK_DATO_TID = "DD.MM.YYYY HH:mm";
const NORSK_DATO = "DD.MM.YYYY";
const ISO_DATO_FORMAT = "YYYY-MM-DD";

export function isoDatoTilNorskDato(isoDato: string | undefined): string {
  if (!isoDato) {
    return "";
  }

  return dayjs(isoDato).tz("Europe/Oslo", true).format(NORSK_DATO_TID);
}

export function toIsoDate(date: string): string {
  return dayjs(date, NORSK_DATO, true).format(ISO_DATO_FORMAT);
}

export function tilNorskDato(dato: Date): string {
  return dayjs(dato).format(NORSK_DATO);
}

export function isIsoDate(date: string): boolean {
  return dayjs(date).isValid();
}
