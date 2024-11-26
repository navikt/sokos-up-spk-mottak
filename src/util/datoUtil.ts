import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const datoFormatNorsk = "DD.MM.YYYY HH:mm";

export function isoDatoTilNorskDato(isoDato: string | undefined): string {
  if (!isoDato) {
    return "";
  }

  return dayjs(isoDato).tz("Europe/Oslo", true).format(datoFormatNorsk);
}

export function norskDatoTilIsoDato(norskDato?: string): string {
  return dayjs(norskDato, "DD.MM.YYYY", true).format("YYYY-MM-DD");
}

export function dagensDato(): string {
  return dayjs().tz("Europe/Oslo").format(datoFormatNorsk);
}

export function isInvalidDateFormat(norskDato: string): boolean {
  const oppgittDato = dayjs(norskDato, datoFormatNorsk, true);
  return !oppgittDato.isValid();
}

export function isDateInThePast(norskDato: string): boolean {
  const oppgittDato = dayjs(norskDato, datoFormatNorsk, true);
  return oppgittDato.isBefore(dayjs().startOf("day"));
}
