export default {
  shortDateTime: (value: string, locale = navigator.language, options: Intl.DateTimeFormatOptions = {}) => {
    if (!value) return value

    const date = new Date(value)
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: "${value}"`)
      return value
    }
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }

    return date.toLocaleString(locale, { ...defaultOptions, ...options })
  },
}
