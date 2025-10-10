import { formatIndianCurrency } from "@/lib/formatCurrency";

export function formatCurrency(value: number): string {
  return formatIndianCurrency(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return formatCurrency(Number(value));
    case 'percent':
      return formatPercent(Number(value));
    case 'number':
      return formatNumber(Number(value));
    case 'date':
      return formatDate(value);
    default:
      return String(value);
  }
}
