const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatCompactCurrency(
  amount: number,
  currency: string,
): string {
  const normalizedCurrency = currency.trim().toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    if (!(error instanceof RangeError)) {
      throw error;
    }

    const formattedAmount = new Intl.NumberFormat("en-US", {
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);

    return `${formattedAmount} ${normalizedCurrency}`;
  }
}

export function formatRoomClose(iso: string | null): string {
  if (iso === null) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatRelativeUpdatedAt(iso: string, now = new Date()): string {
  const updatedAt = new Date(iso);
  if (Number.isNaN(updatedAt.getTime())) {
    return "—";
  }

  const elapsedHours = Math.max(
    0,
    Math.floor((now.getTime() - updatedAt.getTime()) / (60 * 60 * 1000)),
  );

  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const updatedDay = Date.UTC(
    updatedAt.getUTCFullYear(),
    updatedAt.getUTCMonth(),
    updatedAt.getUTCDate(),
  );
  const daysAgo = Math.max(
    0,
    Math.round((nowDay - updatedDay) / (24 * 60 * 60 * 1000)),
  );

  if (daysAgo === 1) {
    return "Yesterday";
  }

  return `${daysAgo} days ago`;
}

export function buildStartupDescriptor(
  sector: string | null,
  city: string | null,
  country: string | null,
): string {
  const location = [city, country]
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return [sector, location]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}
