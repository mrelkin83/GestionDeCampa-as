import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Table Header */}
      <div className="border-b border-gray-200 p-4 flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Table Rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 p-4 flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <Skeleton className="h-6 w-48" />

      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
