import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string | ReactNode
  emptyState?: ReactNode
}

export default function Table<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  emptyState
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {/* Table Header Skeleton */}
          <div className="flex gap-4 pb-3 border-b border-gray-200">
            {columns.map((_, index) => (
              <Skeleton key={index} className="h-4 w-32" />
            ))}
          </div>

          {/* Table Rows Skeleton */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
              {columns.map((_, index) => (
                <Skeleton key={index} className="h-4 w-32" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    // If custom empty state is provided, use it
    if (emptyState) {
      return <div className="py-6">{emptyState}</div>
    }

    // If emptyMessage is a ReactNode, render it directly
    if (typeof emptyMessage !== 'string') {
      return <div className="py-6">{emptyMessage}</div>
    }

    // Fallback to simple text message
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-gray-50 transition-colors"
              )}
            >
              {columns.map((column, index) => (
                <td
                  key={index}
                  className={cn("px-6 py-4 whitespace-nowrap text-sm", column.className)}
                >
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : String(row[column.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
