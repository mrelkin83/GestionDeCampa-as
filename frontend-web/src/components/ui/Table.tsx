import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
  emptyMessage?: string
}

export default function Table<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No hay datos para mostrar'
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (data.length === 0) {
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
