import type { Course, AttendanceRecord, AttendanceStatus } from './types'
import { STATUS_CONFIG } from './types'

export async function exportToExcel(
  course: Course,
  records: AttendanceRecord[],
  dateRange?: { from: string; to: string }
) {
  const XLSX = await import('xlsx')

  const filteredRecords = dateRange
    ? records.filter((r) => r.date >= dateRange.from && r.date <= dateRange.to)
    : records

  const sortedRecords = [...filteredRecords].sort((a, b) => a.date.localeCompare(b.date))
  const dates = sortedRecords.map((r) => r.date)

  const rows = course.students.map((student) => {
    const row: Record<string, string | number> = {
      Alumno: student.name,
      Email: student.email || '',
    }

    let presentes = 0
    let ausentes = 0
    let retardos = 0
    let justificados = 0

    dates.forEach((date) => {
      const record = sortedRecords.find((r) => r.date === date)
      const attendance = record?.records.find((a) => a.studentId === student.id)
      const status = attendance?.status || '-'
      row[date] = status !== '-' ? STATUS_CONFIG[status as AttendanceStatus].label : '-'

      if (status === 'presente') presentes++
      else if (status === 'ausente') ausentes++
      else if (status === 'retardo') retardos++
      else if (status === 'justificado') justificados++
    })

    const total = dates.length
    row['Presentes'] = presentes
    row['Ausentes'] = ausentes
    row['Retardos'] = retardos
    row['Justificados'] = justificados
    row['% Asistencia'] = total > 0 ? Math.round(((presentes + retardos) / total) * 100) : 0

    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, course.name.slice(0, 31))
  XLSX.writeFile(wb, `asistencia_${course.name.replace(/\s+/g, '_')}.xlsx`)
}
