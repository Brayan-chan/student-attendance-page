'use client'

import { useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { STATUS_CONFIG } from '@/lib/types'
import type { Student, AttendanceStatus, StudentAttendance } from '@/lib/types'

export function AttendanceForm({
  students,
  initialRecords,
  onSave,
  saving,
}: {
  students: Student[]
  initialRecords: StudentAttendance[]
  onSave: (records: StudentAttendance[]) => void
  saving: boolean
}) {
  const [records, setRecords] = useState<Map<string, StudentAttendance>>(() => {
    const map = new Map<string, StudentAttendance>()
    // Initialize from existing records or default to 'presente'
    students.forEach((s) => {
      const existing = initialRecords.find((r) => r.studentId === s.id)
      map.set(s.id, existing || { studentId: s.id, status: 'presente' })
    })
    return map
  })

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => {
      const next = new Map(prev)
      const current = next.get(studentId)
      next.set(studentId, { ...current!, status })
      return next
    })
  }

  const setNote = (studentId: string, note: string) => {
    setRecords((prev) => {
      const next = new Map(prev)
      const current = next.get(studentId)
      next.set(studentId, { ...current!, note: note || undefined })
      return next
    })
  }

  const markAllAs = (status: AttendanceStatus) => {
    setRecords((prev) => {
      const next = new Map(prev)
      students.forEach((s) => {
        const current = next.get(s.id)
        next.set(s.id, { ...current!, status })
      })
      return next
    })
  }

  const handleSave = () => {
    onSave(Array.from(records.values()))
  }

  const statusButtons: AttendanceStatus[] = ['presente', 'ausente', 'retardo', 'justificado']

  // Stats
  const allRecords = Array.from(records.values())
  const countByStatus = statusButtons.reduce(
    (acc, s) => ({ ...acc, [s]: allRecords.filter((r) => r.status === s).length }),
    {} as Record<AttendanceStatus, number>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Marcar todos:</span>
        {statusButtons.map((status) => (
          <Button
            key={status}
            variant="outline"
            size="sm"
            className={cn(
              'gap-1.5 text-xs',
              STATUS_CONFIG[status].color
            )}
            onClick={() => markAllAs(status)}
          >
            {STATUS_CONFIG[status].label}
          </Button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-muted/50 p-3">
        {statusButtons.map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                status === 'presente' && 'bg-emerald-500',
                status === 'ausente' && 'bg-red-500',
                status === 'retardo' && 'bg-amber-500',
                status === 'justificado' && 'bg-sky-500'
              )}
            />
            <span className="text-sm">
              {STATUS_CONFIG[status].label}: <strong>{countByStatus[status]}</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Student list */}
      <div className="flex flex-col gap-2">
        {students.map((student, idx) => {
          const record = records.get(student.id)
          return (
            <div
              key={student.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {idx + 1}
                </span>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={student.photoUrl} alt={student.name} />
                  <AvatarFallback className="text-xs">
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{student.name}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {statusButtons.map((status) => {
                  const isActive = record?.status === status
                  const config = STATUS_CONFIG[status]
                  return (
                    <button
                      key={status}
                      type="button"
                      className={cn(
                        'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all',
                        isActive
                          ? `${config.bgColor} ${config.color} ${config.borderColor} ring-1 ring-offset-1`
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                      style={isActive ? { ringColor: 'currentColor' } : undefined}
                      onClick={() => setStatus(student.id, status)}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>

              <Input
                placeholder="Nota..."
                className="h-8 w-full text-xs sm:w-32"
                value={record?.note || ''}
                onChange={(e) => setNote(student.id, e.target.value)}
              />
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="sticky bottom-0 flex justify-end border-t bg-background pt-4">
        <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar asistencia
        </Button>
      </div>
    </div>
  )
}
