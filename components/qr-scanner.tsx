'use client'

import { useState, useEffect, useRef } from 'react'
import jsQR from 'jsqr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Clock, Camera, Loader2 } from 'lucide-react'
import type { Student, AttendanceSession, AttendanceStatus } from '@/lib/types'

interface QrScannerProps {
  session: AttendanceSession
  students: Student[]
  onScan: (studentId: string, status: AttendanceStatus, scannedAt: string) => void
  scannedStudentIds: string[]
}

export function QrScanner({ session, students, onScan, scannedStudentIds }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState<{ student: Student; status: AttendanceStatus } | null>(null)
  const [error, setError] = useState('')
  const animationRef = useRef<number | undefined>(undefined)
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (scanning) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [scanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(tick)
      }
      setError('')
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
      console.error('Error accessing camera:', err)
    }
  }

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    const video = videoRef.current
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
  }

  const tick = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        handleQrDetected(code.data)
      }
    }
    
    animationRef.current = requestAnimationFrame(tick)
  }

  const handleQrDetected = (qrData: string) => {
    // Check if this QR belongs to a student
    const student = students.find(s => s.qrCode === qrData)
    
    if (!student) {
      // Invalid QR code
      return
    }

    // Check if already scanned
    if (scannedStudentIds.includes(student.id)) {
      // Already scanned, ignore
      return
    }

    // Determine status based on time
    const scannedAt = new Date()
    const sessionStartTime = new Date(session.startedAt)
    const minutesDiff = Math.floor((scannedAt.getTime() - sessionStartTime.getTime()) / 1000 / 60)
    
    const tardyThreshold = session.tardyThresholdMinutes || 10
    const status: AttendanceStatus = minutesDiff > tardyThreshold ? 'retardo' : 'presente'

    // Call parent callback
    onScan(student.id, status, scannedAt.toISOString())

    // Show feedback
    setLastScanned({ student, status })

    // Auto-advance after 10 seconds
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
    }
    
    autoAdvanceTimerRef.current = setTimeout(() => {
      setLastScanned(null)
    }, 10000)
  }

  const handleContinue = () => {
    setLastScanned(null)
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
    }
  }

  const remainingStudents = students.filter(s => !scannedStudentIds.includes(s.id))

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{students.length}</div>
        </Card>
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="text-xs text-green-700">Escaneados</div>
          <div className="text-2xl font-bold text-green-700">{scannedStudentIds.length}</div>
        </Card>
        <Card className="p-3 bg-amber-50 border-amber-200">
          <div className="text-xs text-amber-700">Faltan</div>
          <div className="text-2xl font-bold text-amber-700">{remainingStudents.length}</div>
        </Card>
      </div>

      {/* Scanner Area */}
      <Card className="p-6">
        {!scanning ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Camera className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Iniciar Escaneo</h3>
              <p className="text-sm text-muted-foreground">
                Los estudiantes escanearán sus códigos QR uno por uno
              </p>
            </div>
            <Button onClick={() => setScanning(true)} size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Activar Cámara
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lastScanned ? (
              // Success feedback
              <div className="text-center space-y-4 py-8">
                <div className="flex justify-center">
                  <div className={`rounded-full p-6 ${
                    lastScanned.status === 'presente' 
                      ? 'bg-green-100' 
                      : 'bg-amber-100'
                  }`}>
                    {lastScanned.status === 'presente' ? (
                      <CheckCircle2 className="h-16 w-16 text-green-600" />
                    ) : (
                      <Clock className="h-16 w-16 text-amber-600" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{lastScanned.student.name}</h3>
                  <p className={`text-lg font-semibold ${
                    lastScanned.status === 'presente' 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }`}>
                    {lastScanned.status === 'presente' ? 'Presente' : 'Retardo'}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={handleContinue} size="lg">
                    Continuar
                    <span className="ml-2 text-xs">(10s)</span>
                  </Button>
                </div>
              </div>
            ) : (
              // Scanner view
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-4 border-white rounded-lg shadow-lg"></div>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                    Esperando código QR...
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={() => setScanning(false)} variant="outline">
                    Detener Cámara
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Remaining students list */}
      {remainingStudents.length > 0 && scannedStudentIds.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Estudiantes por escanear ({remainingStudents.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {remainingStudents.map((student) => (
              <div key={student.id} className="text-sm py-1 px-2 rounded hover:bg-muted">
                {student.name}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
