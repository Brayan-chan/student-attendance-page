'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, Users, Calendar, Trash2, BookOpen, Plus, FileUp, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ImportClassesDialog } from '@/components/import-classes-dialog'
import { CreateClassDialog } from '@/components/create-class-dialog'
import { getCourses, deleteCourse } from '@/lib/storage'
import type { Course } from '@/lib/types'

export default function ClasesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadCourses = () => {
    setCourses(getCourses())
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleDelete = (id: string) => {
    deleteCourse(id)
    loadCourses()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Clases</h1>
          <p className="text-muted-foreground">
            Administra tus clases e importa desde Google Classroom o crea clases manualmente.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Clase
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <ImportClassesDialog onImportComplete={loadCourses}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Download className="mr-2 h-4 w-4" />
                Importar desde Google Classroom
              </DropdownMenuItem>
            </ImportClassesDialog>
            <CreateClassDialog onComplete={loadCourses}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <FileUp className="mr-2 h-4 w-4" />
                Crear clase manual (con CSV)
              </DropdownMenuItem>
            </CreateClassDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">No tienes clases aun</p>
              <p className="text-sm text-muted-foreground">
                Importa desde Google Classroom o crea una clase manual.
              </p>
            </div>
            <div className="flex gap-3">
              <ImportClassesDialog onImportComplete={loadCourses}>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Importar desde Classroom
                </Button>
              </ImportClassesDialog>
              <CreateClassDialog onComplete={loadCourses}>
                <Button variant="outline" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Crear clase manual
                </Button>
              </CreateClassDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="group relative transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-8">
                    <Link
                      href={`/clases/${course.id}`}
                      className="text-base font-semibold hover:text-primary transition-colors"
                    >
                      {course.name}
                    </Link>
                    {course.section && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {course.section}
                      </p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar clase</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar clase</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminara la clase &quot;{course.name}&quot; y todos sus registros de asistencia. Esta accion no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(course.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {course.students.length} alumnos
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {course.schedules.length} horarios
                  </Badge>
                </div>

                <Button variant="outline" size="sm" className="mt-1" asChild>
                  <Link href={`/clases/${course.id}`}>Ver detalles</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
