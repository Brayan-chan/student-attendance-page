'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, ClipboardCheck, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScheduleForm } from '@/components/schedule-form'
import { getCourseById, updateCourse, getRecordsByCourse } from '@/lib/storage'
import { DAY_NAMES, STATUS_CONFIG } from '@/lib/types'
import type { Course, AttendanceRecord } from '@/lib/types'

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/clases')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver a clases</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
          {course.section && (
            <p className="text-muted-foreground">{course.section}</p>
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
              <CardTitle className="text-base">Lista de alumnos</CardTitle>
            </CardHeader>
            <CardContent>
              {course.students.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay alumnos en esta clase.
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
    </div>
  )
}
