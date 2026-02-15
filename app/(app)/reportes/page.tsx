'use client'

import { useEffect, useState } from 'react'
import { FileSpreadsheet, FileText, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AttendanceBarChart, AttendancePieChart, AttendanceLineChart, AttendanceByGenderChart, AttendanceByDayOfWeekChart } from '@/components/attendance-chart'
import { AttendanceTable } from '@/components/attendance-table'
import { getCourses, getRecordsByCourse } from '@/lib/storage'
import type { Course, AttendanceRecord } from '@/lib/types'

export default function ReportesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  useEffect(() => {
    setCourses(getCourses())
  }, [])

  useEffect(() => {
    if (!selectedCourse) {
      setRecords([])
      return
    }
    let allRecords = getRecordsByCourse(selectedCourse)
    if (dateFrom) allRecords = allRecords.filter((r) => r.date >= dateFrom)
    if (dateTo) allRecords = allRecords.filter((r) => r.date <= dateTo)
    setRecords(allRecords)
  }, [selectedCourse, dateFrom, dateTo])

  const course = courses.find((c) => c.id === selectedCourse)

  const handleExportExcel = async () => {
    if (!course) return
    setExporting('excel')
    try {
      const { exportToExcel } = await import('@/lib/export-excel')
      await exportToExcel(
        course,
        records,
        dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined
      )
    } catch (err) {
      console.error('Error al exportar Excel:', err)
    } finally {
      setExporting(null)
    }
  }

  const handleExportPdf = async () => {
    if (!course) return
    setExporting('pdf')
    try {
      const { exportToPdf } = await import('@/lib/export-pdf')
      await exportToPdf(
        course,
        records,
        dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined
      )
    } catch (err) {
      console.error('Error al exportar PDF:', err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes de asistencia con graficas y exporta a Excel o PDF.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>Selecciona una clase y opcionalmente un rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="report-course">Clase</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="report-course">
                  <SelectValue placeholder="Selecciona una clase" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.section ? `- ${c.section}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date-from">Desde</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date-to">Hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {course && records.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportExcel}
                disabled={exporting !== null}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                {exporting === 'excel' ? 'Exportando...' : 'Exportar a Excel'}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportPdf}
                disabled={exporting !== null}
              >
                <FileText className="h-4 w-4 text-red-600" />
                {exporting === 'pdf' ? 'Exportando...' : 'Exportar a PDF'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedCourse ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Selecciona una clase para ver su reporte de asistencia.
            </p>
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay registros de asistencia para esta clase en el periodo seleccionado.
            </p>
          </CardContent>
        </Card>
      ) : course ? (
        <div className="flex flex-col gap-6">
          {/* Summary info */}
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total de registros</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Alumnos</p>
              <p className="text-2xl font-bold">{course.students.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Periodo</p>
              <p className="text-sm font-medium mt-1">
                {records.length > 0 &&
                  `${new Date([...records].sort((a, b) => a.date.localeCompare(b.date))[0].date + 'T12:00:00').toLocaleDateString('es-MX')} - ${new Date([...records].sort((a, b) => b.date.localeCompare(a.date))[0].date + 'T12:00:00').toLocaleDateString('es-MX')}`}
              </p>
            </div>
          </div>

          {/* Table */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Tabla resumen</h2>
            <AttendanceTable course={course} records={records} />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AttendancePieChart records={records} />
            <AttendanceLineChart course={course} records={records} />
          </div>

          <AttendanceBarChart course={course} records={records} />

          {/* Advanced Analytics */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Análisis Avanzado</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <AttendanceByGenderChart course={course} records={records} />
              <AttendanceByDayOfWeekChart records={records} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
