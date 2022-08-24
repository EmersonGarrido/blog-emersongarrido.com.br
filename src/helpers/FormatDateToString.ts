export default function formatDateToString(
  date: string,
  shortForm?: boolean
): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]
  const dateHour = date.split(" ")
  const data = dateHour[0].split("-")
  const month = parseInt(data[1], 10) - 1
  const hours = data[2].split("T")[1].split(":")[0];
  const minutes = data[2].split("T")[1].split(":")[1];
  return shortForm
    ? `${data[0]} de ${months[month]} de ${data[2]}`
    : `${data[2].split("T")[0]} de ${months[month]} de ${data[0]} às ${hours}:${minutes}`
}