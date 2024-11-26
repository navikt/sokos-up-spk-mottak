import dayjs from "dayjs";
import "dayjs/locale/nb";

export const isoDatoTilNorskDato = (isoDate: string): string => {
  return dayjs(isoDate).locale("nb").format("D. MMM YYYY HH:mm");
};
