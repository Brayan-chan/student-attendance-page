'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, QrCode } from 'lucide-react'

interface AttendanceMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  courseName: string
  date: string
}

export function AttendanceMethodDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  date,
}: AttendanceMethodDialogProps) {
  const router = useRouter()

  const handleManualAttendance = () => {
    router.push(`/asistencia/${courseId}?date=${date}`)
    onOpenChange(false)
  }

  const handleQrAttendance = () => {
    router.push(`/asistencia/${courseId}/qr?date=${date}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecciona el método de pase de lista</DialogTitle>
          <DialogDescription>
            {courseName} - {new Date(date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 py-4">
          {/* Manual Method */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
            onClick={handleManualAttendance}
          >
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Pase de lista manual</CardTitle>
              <CardDescription className="text-pretty">
                Marca manualmente la asistencia de cada estudiante con botones de presente, ausente, retardo o justificado.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* QR Method */}
          <Card 
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
            onClick={handleQrAttendance}
          >
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <QrCode className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Pase de lista con QR</CardTitle>
              <CardDescription className="text-pretty">
                Los estudiantes escanean su código QR con la cámara. Marca automáticamente presente o retardo según la hora.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
