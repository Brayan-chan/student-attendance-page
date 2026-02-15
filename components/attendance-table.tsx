'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Course, AttendanceRecord } from '@/lib/types'

export function AttendanceTable({
  course,
  records,
}: {
  course: Course
  records: AttendanceRecord[]
}) {
  const rows = course.students.map((student) => {
    let presente = 0
    let ausente = 0
    let retardo = 0
    let justificado = 0

    records.forEach((record) => {
      const attendance = record.records.find((r) => r.studentId === student.id)
      if (attendance?.status === 'presente') presente++
      else if (attendance?.status === 'ausente') ausente++
      else if (attendance?.status === 'retardo') retardo++
      else if (attendance?.status === 'justificado') justificado++
    })

    const total = records.length
    const pct = total > 0 ? Math.round(((presente + retardo) / total) * 100) : 0

    return { student, presente, ausente, retardo, justificado, pct }
  })

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>Alumno</TableHead>
            <TableHead className="text-center">Presentes</TableHead>
            <TableHead className="text-center">Ausentes</TableHead>
            <TableHead className="text-center">Retardos</TableHead>
            <TableHead className="text-center">Justificados</TableHead>
            <TableHead className="text-center">% Asist.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.student.id}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              <TableCell className="font-medium">{row.student.name}</TableCell>
              <TableCell className="text-center">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {row.presente}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-red-50 text-red-700 border-red-200">
                  {row.ausente}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  {row.retardo}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-sky-50 text-sky-700 border-sky-200">
                  {row.justificado}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    row.pct >= 80
                      ? 'text-emerald-600'
                      : row.pct >= 60
                        ? 'text-amber-600'
                        : 'text-red-600'
                  )}
                >
                  {row.pct}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
