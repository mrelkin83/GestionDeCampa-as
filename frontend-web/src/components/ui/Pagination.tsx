import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Mostrar solo algunas páginas alrededor de la actual
  const visiblePages = pages.filter(page => {
    return (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    )
  })

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="text-sm text-gray-700">
        Página <span className="font-medium">{currentPage}</span> de{' '}
        <span className="font-medium">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {visiblePages.map((page, index) => {
            const prevPage = visiblePages[index - 1]
            const showEllipsis = prevPage && page - prevPage > 1

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "px-3 py-1 rounded-lg border",
                    page === currentPage
                      ? "bg-primary-600 text-white border-primary-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {page}
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
