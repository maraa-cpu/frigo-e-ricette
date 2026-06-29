/** Badge punteggio anti-spreco */
import { Leaf } from 'lucide-react'
import { scoreColor } from '../utils'

interface AntiWasteScoreBadgeProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function AntiWasteScoreBadge({ score, showLabel = true, size = 'md' }: AntiWasteScoreBadgeProps) {
  const { bg, text, label } = scoreColor(score)
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border
        ${isSmall ? 'text-[10px] px-1.5 py-0.5 border-opacity-50' : 'text-xs px-2 py-0.5'}
        ${bg} ${text}`}
      title={`Score anti-spreco: ${score}/100`}
    >
      <Leaf size={isSmall ? 9 : 11} />
      <span>{score}</span>
      {showLabel && !isSmall && <span className="font-normal opacity-75">/ 100</span>}
      {showLabel && !isSmall && <span className="ml-0.5 font-normal">— {label}</span>}
    </span>
  )
}
