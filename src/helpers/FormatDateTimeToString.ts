import format from "date-fns/format"
import ptBR from "date-fns/locale/pt-BR"

export default function formatDateTimeToString(
  date: Date,
  shortForm?: boolean
) {
  return shortForm
    ? format(date, "dd/MM/yyyy", { locale: ptBR })
    : format(date, "dd/MM/yyyy às kk:mm:ss", { locale: ptBR })
}