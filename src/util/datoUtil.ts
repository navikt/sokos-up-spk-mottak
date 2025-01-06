import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const isoDatoFormatNorsk = "DD.MM.YYYY HH:mm";
const datoFormatNorsk = "DD.MM.YYYY";

export function isoDatoTilNorskDato(isoDato: string | undefined): string {
  if (!isoDato) {
    return "";
  }

  return dayjs(isoDato).tz("Europe/Oslo", true).format(isoDatoFormatNorsk);
}

export function norskDatoTilIsoDato(norskDato?: string): string {
  return dayjs(norskDato, "DD.MM.YYYY HH:mm", true).format("YYYY-MM-DD HH:mm");
}

export function tilNorskDato(dato: Date): string {
  return dayjs(dato).format(datoFormatNorsk);
}
