import { formatDistanceToNow, format } from 'date-fns'

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })

export const formatDate = (date, fmt = 'dd MMM yyyy') => format(new Date(date), fmt)

export const formatSalary = (min, max) => {
  const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)} LPA` : `₹${n.toLocaleString()}`
  if (!min && !max) return 'Not disclosed'
  if (!max) return `${fmt(min)}+`
  return `${fmt(min)} – ${fmt(max)}`
}

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const capitalize = (str = '') =>
  str.split(' ').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

export const truncate = (str, n = 120) =>
  str?.length > n ? str.slice(0, n) + '…' : str

export const buildQueryString = (params) =>
  '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
  ).toString()
