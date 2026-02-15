'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AttendanceForm } from '@/components/attendance-form'
import {
  getCourseById,
  getRecordByCourseAndDate,
  saveAttendanceRecord,
} from '@/lib/storage'
import type { Course, AttendanceRecord, StudentAttendance } from '@/lib/types'

export default function AttendanceDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.id as string
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [course, setCourse] = useState<Course | null>(null)
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const c = getCourseById(courseId)
    if (!c) {
      router.push('/asistencia')
      return
    }
    setCourse(c)
    const record = getRecordByCourseAndDate(courseId, date)
    if (record) setExistingRecord(record)
  }, [courseId, date, router])

  const handleSave = (records: StudentAttendance[]) => {
    setSaving(true)
    const record: AttendanceRecord = {
      id: existingRecord?.id || crypto.randomUUID(),
      courseId,
      date,
      records,
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
    }
    saveAttendanceRecord(record)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/asistencia')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pase de Lista</h1>
          <p className="text-muted-foreground capitalize">
            {course.name} &mdash; {formattedDate}
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Asistencia guardada correctamente.
        </div>
      )}

      {course.students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Esta clase no tiene alumnos registrados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {existingRecord ? 'Editar asistencia' : 'Registrar asistencia'}
            </CardTitle>
            <CardDescription>
              {course.students.length} alumnos en la lista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceForm
              students={course.students}
              initialRecords={existingRecord?.records || []}
              onSave={handleSave}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
