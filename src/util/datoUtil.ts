import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const isoDatoFormatNorsk = "DD.MM.YYYY HH:mm";
const datoFormatNorsk = "DD.MM.YYYY";
const ISO_DATO_FORMAT = "YYYY-MM-DD";

export function isoDatoTilNorskDato(isoDato: string | undefined): string {
  if (!isoDato) {
    return "";
  }

  return dayjs(isoDato).tz("Europe/Oslo", true).format(isoDatoFormatNorsk);
}

export function toIsoDate(date: string): string {
  return dayjs(new Date(date)).format(ISO_DATO_FORMAT);
}

export function tilNorskDato(dato: Date): string {
  return dayjs(dato).format(datoFormatNorsk);
}
