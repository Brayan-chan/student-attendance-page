'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImportStudentsCsv } from '@/components/import-students-csv'
import { addCourse } from '@/lib/storage'
import type { Course, Student } from '@/lib/types'
import { FileUp, Plus } from 'lucide-react'

interface CreateClassDialogProps {
  onComplete: () => void
  children: React.ReactNode
}

export function CreateClassDialog({ onComplete, children }: CreateClassDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [section, setSection] = useState('')
  const [description, setDescription] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [saving, setSaving] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset
      setName('')
      setSection('')
      setDescription('')
      setStudents([])
    }
  }

  const handleImportStudents = (importedStudents: Student[]) => {
    setStudents(importedStudents)
  }

  const handleCreate = () => {
    if (!name.trim()) return

    setSaving(true)

    try {
      const course: Course = {
        id: crypto.randomUUID(),
        name: name.trim(),
        section: section.trim() || undefined,
        description: description.trim() || undefined,
        students,
        schedules: [],
        importedAt: new Date().toISOString(),
      }

      addCourse(course)
      onComplete()
      setOpen(false)
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Clase Manual</DialogTitle>
            <DialogDescription>
              Crea una clase nueva e importa estudiantes desde un archivo CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la clase *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Matemáticas Avanzadas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Sección / Grupo (opcional)</Label>
                <Input
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="ej: Grupo A, 3ro-B"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la clase..."
                  rows={3}
                />
              </div>
            </div>

            {/* Estudiantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Estudiantes ({students.length})</Label>
                <ImportStudentsCsv onImport={handleImportStudents}>
                  <Button variant="outline" size="sm">
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar desde CSV
                  </Button>
                </ImportStudentsCsv>
              </div>

              {students.length > 0 ? (
                <div className="rounded-lg border p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-1">
                    {students.slice(0, 5).map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-2 text-sm py-1">
                        <span className="text-muted-foreground">{idx + 1}.</span>
                        <span>{student.name}</span>
                        {student.email && (
                          <span className="text-xs text-muted-foreground">({student.email})</span>
                        )}
                      </div>
                    ))}
                    {students.length > 5 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        ... y {students.length - 5} más
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay estudiantes importados. Puedes agregar estudiantes después de crear la clase.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim() || saving}>
                {saving ? 'Creando...' : 'Crear clase'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
