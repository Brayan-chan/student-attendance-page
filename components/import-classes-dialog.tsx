'use client'

import { useState } from 'react'
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getCourses, addCourse } from '@/lib/storage'
import type { Course, Student } from '@/lib/types'

interface ClassroomCourse {
  id: string
  name: string
  section?: string
  descriptionHeading?: string
}

export function ImportClassesDialog({
  onImportComplete,
  children,
}: {
  onImportComplete: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [classroomCourses, setClassroomCourses] = useState<ClassroomCourse[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/classroom/courses')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al obtener cursos')
      }
      const data = await res.json()
      // Filter out already imported courses
      const existingIds = getCourses().map((c) => c.classroomId)
      const available = data.filter(
        (c: ClassroomCourse) => !existingIds.includes(c.id)
      )
      setClassroomCourses(available)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelected(new Set())
      setImported(false)
      setError('')
      fetchCourses()
    }
  }

  const toggleCourse = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      for (const courseId of selected) {
        const classroomCourse = classroomCourses.find((c) => c.id === courseId)
        if (!classroomCourse) continue

        // Fetch students for this course
        let students: Student[] = []
        try {
          const res = await fetch(
            `/api/classroom/students?courseId=${courseId}`
          )
          if (res.ok) {
            const data = await res.json()
            students = data.map((s: any) => ({
              id: s.userId || crypto.randomUUID(),
              classroomId: s.userId,
              name: s.profile?.name?.fullName || 'Sin nombre',
              email: s.profile?.emailAddress || '',
              photoUrl: s.profile?.photoUrl || '',
            }))
          }
        } catch {
          // Continue even if students fail
        }

        const course: Course = {
          id: crypto.randomUUID(),
          classroomId: classroomCourse.id,
          name: classroomCourse.name,
          section: classroomCourse.section,
          description: classroomCourse.descriptionHeading,
          students,
          schedules: [],
          importedAt: new Date().toISOString(),
        }
        addCourse(course)
      }
      setImported(true)
      onImportComplete()
      setTimeout(() => setOpen(false), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar desde Google Classroom</DialogTitle>
          <DialogDescription>
            Selecciona los cursos que deseas importar con su lista de alumnos.
          </DialogDescription>
        </DialogHeader>

        {imported ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-medium">Clases importadas correctamente</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-sm text-destructive text-center text-pretty">{error}</p>
            <Button variant="outline" onClick={fetchCourses}>
              Reintentar
            </Button>
          </div>
        ) : classroomCourses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No se encontraron cursos nuevos para importar. Es posible que ya los hayas importado todos.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="flex flex-col gap-2 pr-4">
                {classroomCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <Checkbox
                      checked={selected.has(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{course.name}</span>
                      {course.section && (
                        <span className="text-xs text-muted-foreground">
                          {course.section}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button
                onClick={handleImport}
                disabled={selected.size === 0 || importing}
                className="gap-2"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Importar {selected.size > 0 ? `(${selected.size})` : ''}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
