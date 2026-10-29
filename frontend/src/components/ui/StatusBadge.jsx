import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  HelpCircle,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

const STATUS_MAP = {
  CLEARED: {
    label: 'Cleared',
    icon: CheckCircle2,
    className: 'bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62]',
  },
  VERIFIED: {
    label: 'Verified',
    icon: ShieldCheck,
    className: 'bg-[#E6F2EA] text-[#1F5E34] border-[#4C8A62]',
  },
  NEEDS_REVIEW: {
    label: 'Needs Review',
    icon: AlertCircle,
    className: 'bg-[#FBF3DC] text-[#8A5A0B] border-[#C99A3A]',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    icon: Clock,
    className: 'bg-[#FBF3DC] text-[#8A5A0B] border-[#C99A3A]',
  },
  DEFICIENT: {
    label: 'Deficient',
    icon: AlertTriangle,
    className: 'bg-[#F6E7E7] text-[#8F2D2D] border-[#B85C5C]',
  },
  MISMATCH_DETECTED: {
    label: 'Mismatch detected',
    icon: AlertTriangle,
    className: 'bg-[#F6E7E7] text-[#8F2D2D] border-[#B85C5C]',
  },
  EXPIRED: {
    label: 'Expired',
    icon: Clock,
    className: 'bg-[#F6E7E7] text-[#8F2D2D] border-[#B85C5C]',
  },
  VERIFICATION_PENDING: {
    label: 'Verification pending',
    icon: Clock,
    className: 'bg-[#FBF3DC] text-[#8A5A0B] border-[#C99A3A]',
  },
  SOURCE_UNAVAILABLE: {
    label: 'Source unavailable',
    icon: HelpCircle,
    className: 'bg-[#F2F4F7] text-[#475467] border-[#D0D5DD]',
  },
  MANUAL_REVIEW_REQUIRED: {
    label: 'Manual review required',
    icon: FileSearch,
    className: 'bg-[#EBF0FA] text-[#1F3A7A] border-[#98A2B3]',
  },
}

export default function StatusBadge({ status, className = '', showIcon = true, size = 'sm' }) {
  const normalizedKey = (status || '').toUpperCase().replace(/[-\s]/g, '_')
  const config = STATUS_MAP[normalizedKey] || {
    label: status || 'Unknown',
    icon: HelpCircle,
    className: 'bg-[#F2F4F7] text-[#475467] border-[#D0D5DD]',
  }

  const Icon = config.icon
  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-[2px] ${sizeClasses} ${config.className} ${className}`}
      role="status"
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  )
}
