const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-blue-100 text-blue-800',
  },
  EN_ROUTE_TO_PICKUP: {
    label: 'En Route',
    className: 'bg-blue-100 text-blue-800',
  },
  ARRIVED_AT_PICKUP: {
    label: 'At Pickup',
    className: 'bg-blue-100 text-blue-800',
  },
  PICKED_UP: {
    label: 'Picked Up',
    className: 'bg-blue-100 text-blue-800',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    className: 'bg-primary/10 text-primary',
  },
  ARRIVED_AT_DELIVERY: {
    label: 'Arrived',
    className: 'bg-primary/10 text-primary',
  },
  DELIVERED_REQUESTED: {
    label: 'Confirming',
    className: 'bg-primary/10 text-primary',
  },
  DELIVERED_CONFIRMED: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-error-container text-error',
  },
  DISPUTED: {
    label: 'Disputed',
    className: 'bg-tertiary/10 text-tertiary',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-surface-container text-on-surface-variant',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${config.className} ${className}`}
    >
      {config.label}
    </span>
  )
}
