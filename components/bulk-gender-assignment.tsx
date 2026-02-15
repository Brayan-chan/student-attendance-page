'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import type { Student } from '@/lib/types'

interface BulkGenderAssignmentProps {
  students: Student[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedStudents: Student[]) => void
}

export function BulkGenderAssignment({ students, open, onOpenChange, onSave }: BulkGenderAssignmentProps) {
  const [studentGenders, setStudentGenders] = useState<Map<string, 'masculino' | 'femenino' | 'otro' | undefined>>(new Map())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      // Initialize with current gender values
      const map = new Map<string, 'masculino' | 'femenino' | 'otro' | undefined>()
      students.forEach(student => {
        map.set(student.id, student.gender)
      })
      setStudentGenders(map)
    }
  }, [open, students])

  const handleGenderChange = (studentId: string, gender: string) => {
    const newMap = new Map(studentGenders)
    if (gender === 'none') {
      newMap.set(studentId, undefined)
    } else {
      newMap.set(studentId, gender as 'masculino' | 'femenino' | 'otro')
    }
    setStudentGenders(newMap)
  }

  const handleSave = () => {
    setSaving(true)
    
    const updatedStudents = students.map(student => ({
      ...student,
      gender: studentGenders.get(student.id)
    }))
    
    onSave(updatedStudents)
    setSaving(false)
    onOpenChange(false)
  }

  const studentsWithoutGender = students.filter(s => !studentGenders.get(s.id))
  const stats = {
    masculino: Array.from(studentGenders.values()).filter(g => g === 'masculino').length,
    femenino: Array.from(studentGenders.values()).filter(g => g === 'femenino').length,
    otro: Array.from(studentGenders.values()).filter(g => g === 'otro').length,
    sinDefinir: studentsWithoutGender.length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Asignar Género a Estudiantes</DialogTitle>
          <DialogDescription>
            Asigna el género de cada estudiante para mejorar el análisis estadístico de asistencias.
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="text-xs text-blue-700 font-medium">Masculino</div>
            <div className="text-2xl font-bold text-blue-700">{stats.masculino}</div>
          </Card>
          <Card className="p-3 bg-pink-50 border-pink-200">
            <div className="text-xs text-pink-700 font-medium">Femenino</div>
            <div className="text-2xl font-bold text-pink-700">{stats.femenino}</div>
          </Card>
          <Card className="p-3 bg-purple-50 border-purple-200">
            <div className="text-xs text-purple-700 font-medium">Otro</div>
            <div className="text-2xl font-bold text-purple-700">{stats.otro}</div>
          </Card>
          <Card className="p-3 bg-gray-50 border-gray-200">
            <div className="text-xs text-gray-700 font-medium">Sin definir</div>
            <div className="text-2xl font-bold text-gray-700">{stats.sinDefinir}</div>
          </Card>
        </div>

        {/* Student List */}
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
          {students.map((student, idx) => {
              const currentGender = studentGenders.get(student.id)
              return (
                <div
                  key={student.id}
                  className="flex items-center gap-3 rounded-lg border p-3 bg-card"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {idx + 1}
                  </span>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.photoUrl} alt={student.name} />
                    <AvatarFallback className="text-xs">
                      {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    {student.email && (
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    )}
                  </div>

                  <Select 
                    value={currentGender || 'none'} 
                    onValueChange={(value) => handleGenderChange(student.id, value)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      <SelectItem value="masculino">♂ Masculino</SelectItem>
                      <SelectItem value="femenino">♀ Femenino</SelectItem>
                      <SelectItem value="otro">⚧ Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="text-sm text-muted-foreground">
              {stats.sinDefinir > 0 ? (
                <span className="text-amber-600 font-medium">
                  ⚠️ {stats.sinDefinir} estudiante(s) sin género asignado
                </span>
              ) : (
                <span className="text-green-600 font-medium">
                  ✓ Todos los estudiantes tienen género asignado
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
