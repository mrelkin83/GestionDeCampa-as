/**
 * Exporta datos a CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Si no se especifican columnas, usar todas las keys del primer objeto
  const cols = columns || Object.keys(data[0]).map(key => ({
    key: key as keyof T,
    label: key
  }))

  // Headers
  const headers = cols.map(col => col.label).join(',')

  // Rows
  const rows = data.map(row =>
    cols.map(col => {
      const value = row[col.key]

      // Manejar valores especiales
      if (value === null || value === undefined) {
        return ''
      }

      // Si contiene coma, comillas o salto de línea, escapar
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    }).join(',')
  )

  // Combinar
  const csv = [headers, ...rows].join('\n')

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exporta datos a Excel (usando CSV con formato especial)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  // Excel puede leer CSV con extensión .xls
  exportToCSV(data, filename, columns)
}

/**
 * Formatea una fecha para exportación
 */
export function formatDateForExport(date: string | Date | null | undefined): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Formatea un monto para exportación
 */
export function formatMoneyForExport(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0'

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Exporta tabla HTML a CSV
 */
export function exportTableToCSV(tableId: string, filename: string) {
  const table = document.getElementById(tableId) as HTMLTableElement
  if (!table) {
    throw new Error('Tabla no encontrada')
  }

  const rows: string[] = []

  // Headers
  const headerCells = table.querySelectorAll('thead th')
  const headers = Array.from(headerCells).map(cell => cell.textContent || '').join(',')
  rows.push(headers)

  // Body rows
  const bodyRows = table.querySelectorAll('tbody tr')
  bodyRows.forEach(row => {
    const cells = row.querySelectorAll('td')
    const values = Array.from(cells).map(cell => {
      const text = cell.textContent || ''
      // Escapar si contiene coma
      return text.includes(',') ? `"${text}"` : text
    })
    rows.push(values.join(','))
  })

  const csv = rows.join('\n')

  // Descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
