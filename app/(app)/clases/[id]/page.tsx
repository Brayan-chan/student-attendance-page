'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, ClipboardCheck, Mail, QrCode, Upload, Plus, Pencil, Users2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScheduleForm } from '@/components/schedule-form'
import { ImportStudentsCsv } from '@/components/import-students-csv'
import { StudentQrDialog } from '@/components/student-qr-generator'
import { StudentEditorDialog } from '@/components/student-editor-dialog'
import { BulkGenderAssignment } from '@/components/bulk-gender-assignment'
import { getCourseById, updateCourse, getRecordsByCourse } from '@/lib/storage'
import { DAY_NAMES, STATUS_CONFIG } from '@/lib/types'
import type { Course, AttendanceRecord, Student } from '@/lib/types'

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showGenderDialog, setShowGenderDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const c = getCourseById(id)
    if (!c) {
      router.push('/clases')
      return
    }
    setCourse(c)
    setRecords(getRecordsByCourse(id))
  }, [id, router])

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleScheduleUpdate = (schedules: Course['schedules']) => {
    const updated = { ...course, schedules }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleImportStudents = (students: Student[]) => {
    if (!course) return
    // Merge with existing students (avoiding duplicates by email or name)
    const existingEmails = new Set(course.students.map(s => s.email?.toLowerCase()).filter(Boolean))
    const existingNames = new Set(course.students.map(s => s.name.toLowerCase()))
    
    const newStudents = students.filter(s => {
      if (s.email && existingEmails.has(s.email.toLowerCase())) return false
      if (existingNames.has(s.name.toLowerCase())) return false
      return true
    })

    const updated = { ...course, students: [...course.students, ...newStudents] }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleGenerateQrCodes = () => {
    if (!course) return
    // Generate QR codes for students that don't have one
    const updatedStudents = course.students.map(student => {
      if (!student.qrCode) {
        return { ...student, qrCode: crypto.randomUUID() }
      }
      return student
    })
    const updated = { ...course, students: updatedStudents }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleUpdateStudentGender = (studentId: string, gender: 'masculino' | 'femenino' | 'otro') => {
    if (!course) return
    const updatedStudents = course.students.map(s => 
      s.id === studentId ? { ...s, gender } : s
    )
    const updated = { ...course, students: updatedStudents }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleSaveStudent = (student: Student) => {
    if (!course) return
    
    const existingIndex = course.students.findIndex(s => s.id === student.id)
    let updatedStudents: Student[]
    
    if (existingIndex >= 0) {
      // Update existing student
      updatedStudents = course.students.map(s => s.id === student.id ? student : s)
    } else {
      // Add new student
      updatedStudents = [...course.students, student]
    }
    
    const updated = { ...course, students: updatedStudents }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowStudentDialog(true)
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setShowStudentDialog(true)
  }

  const handleBulkGenderSave = (updatedStudents: Student[]) => {
    if (!course) return
    const updated = { ...course, students: updatedStudents }
    updateCourse(updated)
    setCourse(updated)
  }

  const handleSyncFromClassroom = async () => {
    if (!course || !course.classroomId) return
    
    setSyncing(true)
    try {
      const res = await fetch(`/api/classroom/students?courseId=${course.classroomId}`)
      if (!res.ok) {
        throw new Error('Error al sincronizar estudiantes')
      }
      
      const data = await res.json()
      const freshStudents = data.map((s: any) => ({
        id: s.userId || crypto.randomUUID(),
        classroomId: s.userId,
        name: s.profile?.name?.fullName || 'Sin nombre',
        email: s.profile?.emailAddress || '',
        photoUrl: s.profile?.photoUrl || '',
      }))
      
      // Merge: preserve local data for existing students, add new ones
      const existingByClassroomId = new Map(
        course.students
          .filter(s => s.classroomId)
          .map(s => [s.classroomId, s])
      )
      const existingByEmail = new Map(
        course.students
          .filter(s => s.email)
          .map(s => [s.email.toLowerCase(), s])
      )
      
      const mergedStudents = freshStudents.map((fresh: any) => {
        // Try to find existing student by classroomId or email
        let existing = fresh.classroomId ? existingByClassroomId.get(fresh.classroomId) : undefined
        if (!existing && fresh.email) {
          existing = existingByEmail.get(fresh.email.toLowerCase())
        }
        
        if (existing) {
          // Keep local data, update name/photo/email from Classroom
          return {
            ...existing,
            name: fresh.name,
            email: fresh.email,
            photoUrl: fresh.photoUrl,
            classroomId: fresh.classroomId,
          }
        } else {
          // New student - generate QR and initialize
          return {
            ...fresh,
            qrCode: crypto.randomUUID(),
            accumulatedTardies: 0,
          }
        }
      })
      
      // Keep students that weren't in Classroom (manually added)
      const manualStudents = course.students.filter(s => {
        if (!s.classroomId && !s.email) return true
        if (s.classroomId) {
          return !freshStudents.some((f: any) => f.classroomId === s.classroomId)
        }
        if (s.email) {
          return !freshStudents.some((f: any) => f.email?.toLowerCase() === s.email?.toLowerCase())
        }
        return true
      })
      
      const updated = { 
        ...course, 
        students: [...mergedStudents, ...manualStudents],
        lastSyncedAt: new Date().toISOString()
      }
      updateCourse(updated)
      setCourse(updated)
    } catch (error) {
      console.error('Error syncing students:', error)
      alert('Error al sincronizar estudiantes desde Google Classroom')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/clases')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver a clases</span>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
            {course.classroomId && (
              <Badge variant="outline" className="text-xs">
                Google Classroom
              </Badge>
            )}
          </div>
          {course.section && (
            <p className="text-muted-foreground">{course.section}</p>
          )}
          {course.lastSyncedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Última sincronización: {new Date(course.lastSyncedAt).toLocaleString('es-ES', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-1.5">
            <Users className="h-4 w-4" />
            Alumnos ({course.students.length})
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Horarios ({course.schedules.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" />
            Historial ({records.length})
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Lista de alumnos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddStudent}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                  <ImportStudentsCsv onImport={handleImportStudents}>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Importar CSV
                    </Button>
                  </ImportStudentsCsv>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowGenderDialog(true)}
                    disabled={course.students.length === 0}
                  >
                    <Users2 className="mr-2 h-4 w-4" />
                    Asignar género
                  </Button>
                  {course.classroomId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSyncFromClassroom}
                      disabled={syncing}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? 'Sincronizando...' : 'Sincronizar'}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      handleGenerateQrCodes()
                      setShowQrDialog(true)
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Ver Códigos QR
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {course.students.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay alumnos en esta clase. Importa desde CSV o desde Google Classroom.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {course.students.map((student, idx) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={student.photoUrl} alt={student.name} />
                        <AvatarFallback className="text-xs">
                          {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        {student.email && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {student.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {student.qrCode && (
                          <Badge variant="outline" className="text-xs">
                            <QrCode className="h-3 w-3 mr-1" />
                            QR
                          </Badge>
                        )}
                        {student.gender && (
                          <Badge variant="secondary" className="text-xs">
                            {student.gender === 'masculino' ? '♂' : student.gender === 'femenino' ? '♀' : '⚧'}
                          </Badge>
                        )}
                        {(student.accumulatedTardies || 0) > 0 && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            {student.accumulatedTardies} retardo{student.accumulatedTardies !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horarios de clase</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleForm
                schedules={course.schedules}
                courseId={course.id}
                onUpdate={handleScheduleUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-sm text-muted-foreground">
                    No hay registros de asistencia aun.
                  </p>
                  <Button asChild size="sm">
                    <Link href={`/asistencia/${course.id}`}>Pasar lista</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...records]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((record) => {
                      const presentCount = record.records.filter(
                        (r) => r.status === 'presente'
                      ).length
                      const lateCount = record.records.filter(
                        (r) => r.status === 'retardo'
                      ).length
                      const absentCount = record.records.filter(
                        (r) => r.status === 'ausente'
                      ).length
                      const justifiedCount = record.records.filter(
                        (r) => r.status === 'justificado'
                      ).length

                      return (
                        <Link
                          key={record.id}
                          href={`/asistencia/${course.id}?date=${record.date}`}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                        >
                          <span className="text-sm font-medium">
                            {new Date(record.date + 'T12:00:00').toLocaleDateString('es-MX', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge className={`${STATUS_CONFIG.presente.bgColor} ${STATUS_CONFIG.presente.color} border ${STATUS_CONFIG.presente.borderColor}`}>
                              {presentCount}
                            </Badge>
                            <Badge className={`${STATUS_CONFIG.retardo.bgColor} ${STATUS_CONFIG.retardo.color} border ${STATUS_CONFIG.retardo.borderColor}`}>
                              {lateCount}
                            </Badge>
                            <Badge className={`${STATUS_CONFIG.ausente.bgColor} ${STATUS_CONFIG.ausente.color} border ${STATUS_CONFIG.ausente.borderColor}`}>
                              {absentCount}
                            </Badge>
                            <Badge className={`${STATUS_CONFIG.justificado.bgColor} ${STATUS_CONFIG.justificado.color} border ${STATUS_CONFIG.justificado.borderColor}`}>
                              {justifiedCount}
                            </Badge>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Dialog */}
      {course && (
        <StudentQrDialog
          open={showQrDialog}
          onOpenChange={setShowQrDialog}
          students={course.students.filter(s => s.qrCode)}
          courseName={course.name + (course.section ? ` - ${course.section}` : '')}
        />
      )}

      {/* Student Editor Dialog */}
      <StudentEditorDialog
        student={editingStudent || undefined}
        open={showStudentDialog}
        onOpenChange={(open) => {
          setShowStudentDialog(open)
          if (!open) setEditingStudent(null)
        }}
        onSave={handleSaveStudent}
      />

      {/* Bulk Gender Assignment Dialog */}
      {course && (
        <BulkGenderAssignment
          students={course.students}
          open={showGenderDialog}
          onOpenChange={setShowGenderDialog}
          onSave={handleBulkGenderSave}
        />
      )}
    </div>
  )
}
