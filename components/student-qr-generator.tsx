'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Download, Printer, QrCode } from 'lucide-react'
import type { Student, Course } from '@/lib/types'

interface StudentQrGeneratorProps {
  students: Student[]
  courseName: string
  onClose?: () => void
}

export function StudentQrGenerator({ students, courseName, onClose }: StudentQrGeneratorProps) {
  const [qrImages, setQrImages] = useState<Map<string, string>>(new Map())
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    generateQRCodes()
  }, [students])

  const generateQRCodes = async () => {
    const images = new Map<string, string>()
    
    for (const student of students) {
      if (student.qrCode) {
        try {
          const qrDataUrl = await QRCode.toDataURL(student.qrCode, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          images.set(student.id, qrDataUrl)
        } catch (err) {
          console.error('Error generando QR:', err)
        }
      }
    }
    
    setQrImages(images)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadAll = async () => {
    for (const student of students) {
      const qrImage = qrImages.get(student.id)
      if (qrImage) {
        const link = document.createElement('a')
        link.download = `QR_${student.name.replace(/\s+/g, '_')}.png`
        link.href = qrImage
        link.click()
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-print-area, #qr-print-area * {
            visibility: visible;
          }
          #qr-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .qr-card {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="space-y-4">
        <div className="flex gap-3 no-print">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Todos
          </Button>
          <Button onClick={handleDownloadAll} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar Todos
          </Button>
        </div>

        <div id="qr-print-area" ref={printRef}>
          <div className="mb-6 text-center no-print">
            <h2 className="text-2xl font-bold">{courseName}</h2>
            <p className="text-muted-foreground">Códigos QR de Estudiantes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const qrImage = qrImages.get(student.id)
              return (
                <Card key={student.id} className="qr-card p-4 flex flex-col items-center gap-3">
                  <div className="text-center">
                    <p className="font-semibold text-lg">{student.name}</p>
                    {student.email && (
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    )}
                  </div>
                  
                  {qrImage ? (
                    <img 
                      src={qrImage} 
                      alt={`QR de ${student.name}`}
                      className="w-48 h-48 border rounded"
                    />
                  ) : (
                    <div className="w-48 h-48 border rounded flex items-center justify-center bg-muted">
                      <QrCode className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Código: {student.qrCode?.slice(0, 8)}...
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// Dialog wrapper for easier usage
interface StudentQrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  courseName: string
}

export function StudentQrDialog({ open, onOpenChange, students, courseName }: StudentQrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Códigos QR de Estudiantes</DialogTitle>
          <DialogDescription>
            Genera, imprime o descarga los códigos QR para que los estudiantes registren su asistencia.
          </DialogDescription>
        </DialogHeader>
        <StudentQrGenerator 
          students={students} 
          courseName={courseName}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
