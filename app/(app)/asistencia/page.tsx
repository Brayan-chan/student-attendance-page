'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, ArrowRight, QrCode, List } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getCourses, getRecordByCourseAndDate } from '@/lib/storage'
import type { Course } from '@/lib/types'

export default function AsistenciaPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()

  useEffect(() => {
    setCourses(getCourses())
  }, [])

  const selectedCourseData = courses.find((c) => c.id === selectedCourse)
  const existingRecord = selectedCourse
    ? getRecordByCourseAndDate(selectedCourse, date)
    : null

  const handleQrMode = () => {
    if (selectedCourse) {
      router.push(`/asistencia/${selectedCourse}/qr?date=${date}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pasar Lista</h1>
        <p className="text-muted-foreground">
          Selecciona una clase y fecha para registrar la asistencia.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Seleccionar clase
          </CardTitle>
          <CardDescription>
            Elige la clase y la fecha para el pase de lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="course">Clase</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Selecciona una clase" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.section ? `- ${c.section}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {selectedCourseData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedCourseData.students.length} alumnos</span>
              {existingRecord && (
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                  Ya existe registro - se editara
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm font-medium">Modo de registro:</div>
            
            <Button
              onClick={handleQrMode}
              disabled={!selectedCourse || !date}
              className="w-full gap-2"
              size="lg"
            >
              <QrCode className="h-5 w-5" />
              Escaneo de Códigos QR
            </Button>

            <Button
              asChild
              disabled={!selectedCourse || !date}
              className="w-full gap-2"
              variant="outline"
              size="lg"
            >
              <Link
                href={
                  selectedCourse
                    ? `/asistencia/${selectedCourse}?date=${date}`
                    : '#'
                }
              >
                <List className="h-5 w-5" />
                {existingRecord ? 'Editar lista manual' : 'Lista manual'}
              </Link>
            </Button>
          </div>

          {courses.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No tienes clases. Ve a{' '}
              <Link href="/clases" className="text-primary hover:underline">
                Clases
              </Link>{' '}
              para importar desde Google Classroom.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
