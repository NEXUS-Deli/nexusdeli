export function formatDateTimeBR(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    // Format is like "dd/mm/yyyy, hh:mm" or "dd/mm/yyyy hh:mm" depending on browser environment
    // We clean up any comma
    return formatter.format(date).replace(",", "");
  } catch (e) {
    return "—";
  }
}
