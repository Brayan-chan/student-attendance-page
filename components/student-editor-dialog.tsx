'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Student } from '@/lib/types'

interface StudentEditorDialogProps {
  student?: Student
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (student: Student) => void
}

export function StudentEditorDialog({ student, open, onOpenChange, onSave }: StudentEditorDialogProps) {
  const [name, setName] = useState(student?.name || '')
  const [email, setEmail] = useState(student?.email || '')
  const [gender, setGender] = useState<'masculino' | 'femenino' | 'otro' | ''>( student?.gender || '')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return

    setSaving(true)

    const updatedStudent: Student = {
      id: student?.id || crypto.randomUUID(),
      name: name.trim(),
      email: email.trim() || undefined,
      gender: gender || undefined,
      qrCode: student?.qrCode || crypto.randomUUID(),
      accumulatedTardies: student?.accumulatedTardies || 0,
      classroomId: student?.classroomId,
      photoUrl: student?.photoUrl,
    }

    onSave(updatedStudent)
    onOpenChange(false)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Estudiante' : 'Agregar Estudiante'}</DialogTitle>
          <DialogDescription>
            {student 
              ? 'Actualiza la información del estudiante.' 
              : 'Agrega un nuevo estudiante a la clase.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as any)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Seleccionar género..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin especificar</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!student && (
            <p className="text-xs text-muted-foreground">
              Se generará automáticamente un código QR único para este estudiante.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Guardando...' : student ? 'Guardar cambios' : 'Agregar estudiante'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
