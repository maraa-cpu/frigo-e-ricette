/** Badge colorato per la scadenza di un ingrediente */
import { Clock } from 'lucide-react'
import { daysUntilExpiration, expirationLabel, expirationColor } from '../utils'

interface ExpirationBadgeProps {
  expirationDate: string
  small?: boolean
}

export function ExpirationBadge({ expirationDate, small = false }: ExpirationBadgeProps) {
  const days = daysUntilExpiration(expirationDate)
  const colorClass = expirationColor(days)
  const label = expirationLabel(days)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium
        ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}
        ${colorClass}`}
    >
      <Clock size={small ? 9 : 11} />
      {label}
    </span>
  )
}
