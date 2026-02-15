'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QrScanner } from '@/components/qr-scanner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getCourseById,
  getAttendanceRecords,
  saveAttendanceRecord,
  getActiveSession,
  createSession,
  updateSession,
  closeSession,
  updateCourse,
  getSystemSettings,
} from '@/lib/storage'
import type { Course, AttendanceSession, AttendanceStatus, StudentAttendance, AttendanceRecord } from '@/lib/types'
import Link from 'next/link'

export default function QrAttendancePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const courseId = params.id as string
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [course, setCourse] = useState<Course | null>(null)
  const [session, setSession] = useState<AttendanceSession | null>(null)
  const [scannedRecords, setScannedRecords] = useState<Map<string, StudentAttendance>>(new Map())
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadedCourse = getCourseById(courseId)
    if (loadedCourse) {
      setCourse(loadedCourse)
      // Check for active session
      const activeSession = getActiveSession(courseId)
      if (activeSession && activeSession.date === date) {
        setSession(activeSession)
        // Load existing scanned records
        const records = new Map<string, StudentAttendance>()
        activeSession.scannedStudents.forEach((studentId) => {
          // Find in existing attendance record if exists
          const existingRecord = getAttendanceRecords().find(
            r => r.courseId === courseId && r.date === date
          )
          const studentRecord = existingRecord?.records.find(r => r.studentId === studentId)
          if (studentRecord) {
            records.set(studentId, studentRecord)
          }
        })
        setScannedRecords(records)
      }
    }
  }, [courseId, date])

  const handleStartSession = () => {
    const settings = getSystemSettings()
    const newSession: AttendanceSession = {
      id: crypto.randomUUID(),
      courseId,
      date,
      startedAt: new Date().toISOString(),
      isActive: true,
      scannedStudents: [],
      tardyThresholdMinutes: settings.tardyThresholdMinutes,
    }
    createSession(newSession)
    setSession(newSession)
  }

  const handleScan = (studentId: string, status: AttendanceStatus, scannedAt: string) => {
    if (!session) return

    // Add to scanned records
    const newRecord: StudentAttendance = {
      studentId,
      status,
      scannedAt,
    }
    
    const updatedRecords = new Map(scannedRecords)
    updatedRecords.set(studentId, newRecord)
    setScannedRecords(updatedRecords)

    // Update session
    const updatedSession = {
      ...session,
      scannedStudents: [...session.scannedStudents, studentId],
    }
    updateSession(updatedSession)
    setSession(updatedSession)

    // Check if student needs retardo conversion (3 retardos = 1 falta)
    if (status === 'retardo' && course) {
      const student = course.students.find(s => s.id === studentId)
      if (student) {
        const newTardies = (student.accumulatedTardies || 0) + 1
        const updatedStudents = course.students.map(s => {
          if (s.id === studentId) {
            return { ...s, accumulatedTardies: newTardies }
          }
          return s
        })
        const updatedCourse = { ...course, students: updatedStudents }
        updateCourse(updatedCourse)
        setCourse(updatedCourse)
      }
    }
  }

  const handleCloseSession = async () => {
    if (!session || !course) return

    setSaving(true)

    try {
      // Mark unscanned students as absent
      const allRecords: StudentAttendance[] = course.students.map((student) => {
        const existing = scannedRecords.get(student.id)
        if (existing) {
          return existing
        }
        // Not scanned = absent
        return {
          studentId: student.id,
          status: 'ausente' as AttendanceStatus,
        }
      })

      // Check for 3 tardies = 1 falta rule
      const updatedStudents = course.students.map(student => {
        const tardies = student.accumulatedTardies || 0
        if (tardies >= 3) {
          // Convert 3 tardies to 1 absence
          const studentRecord = allRecords.find(r => r.studentId === student.id)
          if (studentRecord && studentRecord.status === 'retardo') {
            // This is the 3rd tardy, mark as absent
            studentRecord.status = 'ausente'
            studentRecord.note = (studentRecord.note || '') + ' (Convertido por 3 retardos)'
          }
          // Reset counter
          return { ...student, accumulatedTardies: 0 }
        }
        return student
      })

      // Save updated course with tardy counters
      const updatedCourse = { ...course, students: updatedStudents }
      updateCourse(updatedCourse)

      // Save attendance record
      const attendanceRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        courseId,
        date,
        scheduleId: session.scheduleId,
        records: allRecords,
        createdAt: new Date().toISOString(),
      }

      saveAttendanceRecord(attendanceRecord)

      // Close session
      closeSession(session.id)

      // Navigate back
      router.push('/asistencia')
    } catch (error) {
      console.error('Error saving attendance:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (session) {
      closeSession(session.id)
    }
    router.push('/asistencia')
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Clase no encontrada</AlertDescription>
        </Alert>
      </div>
    )
  }

  const studentsWithoutQr = course.students.filter(s => !s.qrCode)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/asistencia">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              Asistencia con QR
            </h1>
          </div>
          <p className="text-muted-foreground">
            {course.name} {course.section && `- ${course.section}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {session && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCloseDialog(true)}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              Finalizar Sesión
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={saving}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Warnings */}
      {studentsWithoutQr.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {studentsWithoutQr.length} estudiante(s) no tienen código QR asignado. 
            Ve a <Link href={`/clases/${courseId}`} className="underline">editar la clase</Link> para generar códigos QR.
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!session ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">📱</div>
            <div>
              <h3 className="font-semibold text-lg">Iniciar Sesión de Asistencia</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Los estudiantes escanearán sus códigos QR para registrar su asistencia.
                <br />
                El sistema detectará automáticamente retardos basándose en la hora de escaneo.
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <Button onClick={handleStartSession} size="lg">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <QrScanner
          session={session}
          students={course.students.filter(s => s.qrCode)}
          onScan={handleScan}
          scannedStudentIds={Array.from(scannedRecords.keys())}
        />
      )}

      {/* Close session dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se guardará la asistencia de {scannedRecords.size} estudiante(s) escaneados.
              Los estudiantes que no escanearon su QR serán marcados como ausentes.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseSession} disabled={saving}>
              {saving ? 'Guardando...' : 'Finalizar y Guardar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
