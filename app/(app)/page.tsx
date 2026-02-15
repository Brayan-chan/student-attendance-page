'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  ClipboardCheck,
  CalendarDays,
  ArrowRight,
  Clock,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AttendanceMethodDialog } from '@/components/attendance-method-dialog'
import { getCourses, getAttendanceRecords } from '@/lib/storage'
import { DAY_NAMES } from '@/lib/types'
import type { Course, AttendanceRecord, Schedule } from '@/lib/types'

function getJSDayIndex(): number {
  const d = new Date().getDay()
  // JS: 0=Sunday. We want 0=Monday
  return d === 0 ? 6 : d - 1
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null)
  const [showMethodDialog, setShowMethodDialog] = useState(false)

  useEffect(() => {
    setCourses(getCourses())
    setRecords(getAttendanceRecords())
  }, [])

  const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0)
  const todayStr = new Date().toISOString().split('T')[0]
  const todayDayIndex = getJSDayIndex()

  const todaySchedules: { course: Course; schedule: Schedule }[] = []
  courses.forEach((c) => {
    c.schedules
      .filter((s) => s.dayOfWeek === todayDayIndex)
      .forEach((s) => todaySchedules.push({ course: c, schedule: s }))
  })
  todaySchedules.sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime))

  const todayRecords = records.filter((r) => r.date === todayStr)

  // This week's stats
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekRecords = records.filter((r) => r.date >= weekStartStr && r.date <= todayStr)
  const weekTotal = weekRecords.reduce((s, r) => s + r.records.length, 0)
  const weekPresent = weekRecords.reduce(
    (s, r) => s + r.records.filter((a) => a.status === 'presente' || a.status === 'retardo').length,
    0
  )
  const weekPct = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0

  const stats = [
    {
      title: 'Clases',
      value: courses.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-accent',
    },
    {
      title: 'Alumnos',
      value: totalStudents,
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      title: 'Registros hoy',
      value: todayRecords.length,
      icon: ClipboardCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Asistencia semanal',
      value: `${weekPct}%`,
      icon: CalendarDays,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tus clases y asistencia.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Clases de hoy - {DAY_NAMES[todayDayIndex]}
            </CardTitle>
            <CardDescription>
              {todaySchedules.length > 0
                ? `Tienes ${todaySchedules.length} clase${todaySchedules.length > 1 ? 's' : ''} programada${todaySchedules.length > 1 ? 's' : ''}`
                : 'No hay clases programadas para hoy'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {todaySchedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tienes clases programadas para hoy.
              </p>
            ) : (
              todaySchedules.map(({ course, schedule }) => {
                const hasRecord = todayRecords.some((r) => r.courseId === course.id)
                return (
                  <div
                    key={`${course.id}-${schedule.id}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                        {schedule.room && ` | ${schedule.room}`}
                      </span>
                    </div>
                    {hasRecord ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        Lista tomada
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedCourse({ id: course.id, name: course.name })
                          setShowMethodDialog(true)
                        }}
                      >
                        Pasar lista
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Acciones rapidas</CardTitle>
            <CardDescription>Accesos directos a las funciones principales</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/clases" className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Mis Clases</p>
                  <p className="text-sm text-muted-foreground">
                    Importa clases de Google Classroom
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/asistencia" className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Pasar Lista</p>
                  <p className="text-sm text-muted-foreground">
                    Registra la asistencia del dia
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/reportes" className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Reportes</p>
                  <p className="text-sm text-muted-foreground">
                    Graficas y exportar a Excel/PDF
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Method Selection Dialog */}
      {selectedCourse && (
        <AttendanceMethodDialog
          open={showMethodDialog}
          onOpenChange={setShowMethodDialog}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          date={todayStr}
        />
      )}
    </div>
  )
}


