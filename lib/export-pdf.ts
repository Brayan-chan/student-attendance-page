import type { Course, AttendanceRecord, AttendanceStatus } from './types'
import { STATUS_CONFIG } from './types'

export async function exportToPdf(
  course: Course,
  records: AttendanceRecord[],
  dateRange?: { from: string; to: string }
) {
  const { default: jsPDF } = await import('jspdf')
  await import('jspdf-autotable')

  const filteredRecords = dateRange
    ? records.filter((r) => r.date >= dateRange.from && r.date <= dateRange.to)
    : records

  const sortedRecords = [...filteredRecords].sort((a, b) => a.date.localeCompare(b.date))

  const doc = new jsPDF({ orientation: 'landscape' })

  // Header
  doc.setFontSize(16)
  doc.text(`Reporte de Asistencia - ${course.name}`, 14, 15)
  doc.setFontSize(10)
  doc.text(
    `Periodo: ${dateRange ? `${dateRange.from} a ${dateRange.to}` : 'Todas las fechas'}`,
    14,
    22
  )
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 28)
  doc.text(`Total de alumnos: ${course.students.length}`, 14, 34)

  // Table
  const headers = ['Alumno', 'Presentes', 'Ausentes', 'Retardos', 'Justificados', '% Asistencia']
  const body = course.students.map((student) => {
    let presentes = 0
    let ausentes = 0
    let retardos = 0
    let justificados = 0

    sortedRecords.forEach((record) => {
      const attendance = record.records.find((a) => a.studentId === student.id)
      if (attendance?.status === 'presente') presentes++
      else if (attendance?.status === 'ausente') ausentes++
      else if (attendance?.status === 'retardo') retardos++
      else if (attendance?.status === 'justificado') justificados++
    })

    const total = sortedRecords.length
    const pct = total > 0 ? Math.round(((presentes + retardos) / total) * 100) : 0

    return [student.name, presentes, ausentes, retardos, justificados, `${pct}%`]
  })

  ;(doc as any).autoTable({
    head: [headers],
    body,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  })

  doc.save(`asistencia_${course.name.replace(/\s+/g, '_')}.pdf`)
}
