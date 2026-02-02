import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMM yyyy', { locale: es })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d MMM yyyy 'a las' HH:mm", { locale: es })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function isDeadlineNear(deadline: string | null): boolean {
  if (!deadline) return false
  const days = differenceInDays(new Date(deadline), new Date())
  return days >= 0 && days <= 7
}

export function isDeadlineOverdue(deadline: string | null): boolean {
  if (!deadline) return false
  return differenceInDays(new Date(deadline), new Date()) < 0
}

export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null
  return differenceInDays(new Date(deadline), new Date())
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Status transition validation
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  backlog: ['proposal', 'cancelled'],
  proposal: ['approved', 'cancelled'],
  approved: ['in_progress', 'cancelled'],
  in_progress: ['testing', 'cancelled'],
  testing: ['in_progress', 'completed', 'cancelled'],
  completed: [],
  cancelled: ['backlog'],
}

export function canTransitionTo(currentStatus: string, newStatus: string): boolean {
  if (currentStatus === newStatus) return true
  const allowed = STATUS_TRANSITIONS[currentStatus] || []
  return allowed.includes(newStatus)
}

// Status display names (Spanish)
export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  proposal: 'Propuesta',
  approved: 'Aprobado',
  in_progress: 'En Progreso',
  testing: 'Testing',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  ca: 'Català',
}

// Calculate quote totals
export function calculateQuoteTotals(services: { hours: number; hourly_rate: number }[]) {
  const subtotal = services.reduce((sum, s) => sum + s.hours * s.hourly_rate, 0)
  const iva = subtotal * 0.21
  const total = subtotal + iva
  return { subtotal, iva, total }
}

// Generate unique ID for optimistic updates
export function generateOptimisticId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
