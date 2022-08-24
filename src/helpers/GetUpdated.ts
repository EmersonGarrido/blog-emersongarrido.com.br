import { formatDistance } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"

export default function getUpdatedTime(time: string): string {
  const updatedTime = new Date(time)
  const now = new Date()

  const timeDistance = formatDistance(updatedTime, now, {
    addSuffix: true,
    locale: ptBR,
  })

  return timeDistance
    .substring(0, 1)
    .toUpperCase()
    .concat(timeDistance.substring(1))
    .replace("cerca de ", "")
}