'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Student } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CSVRow {
  [key: string]: string
}

interface ImportStudentsCsvProps {
  onImport: (students: Student[]) => void
  children: React.ReactNode
}

export function ImportStudentsCsv({ onImport, children }: ImportStudentsCsvProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [error, setError] = useState('')
  const [mapping, setMapping] = useState({
    name: '',
    email: '',
    gender: '',
  })
  const [importing, setImporting] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')

    Papa.parse(selectedFile, {
      complete: (results) => {
        const data = results.data as CSVRow[]
        if (data.length === 0) {
          setError('El archivo CSV está vacío')
          return
        }

        // Get headers from first row
        const csvHeaders = Object.keys(data[0])
        setHeaders(csvHeaders)
        setCsvData(data.filter(row => Object.values(row).some(val => val.trim() !== '')))

        // Auto-detect common column names
        const autoMapping = {
          name: csvHeaders.find(h => 
            h.toLowerCase().includes('nombre') || 
            h.toLowerCase().includes('name') ||
            h.toLowerCase().includes('alumno') ||
            h.toLowerCase().includes('estudiante')
          ) || '',
          email: csvHeaders.find(h => 
            h.toLowerCase().includes('email') || 
            h.toLowerCase().includes('correo')
          ) || '',
          gender: csvHeaders.find(h => 
            h.toLowerCase().includes('género') || 
            h.toLowerCase().includes('genero') ||
            h.toLowerCase().includes('sexo') ||
            h.toLowerCase().includes('gender')
          ) || '',
        }
        setMapping(autoMapping)
      },
      header: true,
      skipEmptyLines: true,
      error: (err) => {
        setError(`Error al leer el archivo: ${err.message}`)
      },
    })
  }

  const handleImport = () => {
    if (!mapping.name) {
      setError('Debes seleccionar la columna de nombres')
      return
    }

    setImporting(true)

    try {
      const students: Student[] = csvData
        .map((row, index) => {
          const name = row[mapping.name]?.trim()
          if (!name) return null

          const email = mapping.email ? row[mapping.email]?.trim() : undefined
          let gender: 'masculino' | 'femenino' | 'otro' | undefined = undefined

          if (mapping.gender) {
            const genderValue = row[mapping.gender]?.toLowerCase().trim()
            if (genderValue?.includes('m') || genderValue?.includes('masc') || genderValue?.includes('hombre')) {
              gender = 'masculino'
            } else if (genderValue?.includes('f') || genderValue?.includes('fem') || genderValue?.includes('mujer')) {
              gender = 'femenino'
            } else if (genderValue) {
              gender = 'otro'
            }
          }

          return {
            id: crypto.randomUUID(),
            name,
            email,
            gender,
            qrCode: crypto.randomUUID(), // Generar código QR único
            accumulatedTardies: 0,
          } as Student
        })
        .filter((s): s is Student => s !== null)

      onImport(students)
      setOpen(false)
      resetState()
    } catch (err) {
      setError('Error al procesar los datos')
    } finally {
      setImporting(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setCsvData([])
    setHeaders([])
    setMapping({ name: '', email: '', gender: '' })
    setError('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetState()
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Estudiantes desde CSV</DialogTitle>
            <DialogDescription>
              Carga el archivo CSV descargado de Google Classroom con la lista de estudiantes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Seleccionar archivo CSV</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {file ? file.name : 'Seleccionar archivo...'}
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </div>

            {/* Column Mapping */}
            {headers.length > 0 && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Archivo cargado: {csvData.length} estudiantes detectados
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Columna de Nombres *</Label>
                    <Select value={mapping.name} onValueChange={(v) => setMapping({ ...mapping, name: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Columna de Email (opcional)</Label>
                    <Select value={mapping.email} onValueChange={(v) => setMapping({ ...mapping, email: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguna</SelectItem>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Columna de Género (opcional)</Label>
                    <Select value={mapping.gender} onValueChange={(v) => setMapping({ ...mapping, gender: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar columna..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguna</SelectItem>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                {mapping.name && csvData.length > 0 && (
                  <div className="space-y-2">
                    <Label>Vista previa (primeros 3)</Label>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="p-2 text-left font-medium">Nombre</th>
                            {mapping.email && <th className="p-2 text-left font-medium">Email</th>}
                            {mapping.gender && <th className="p-2 text-left font-medium">Género</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="p-2">{row[mapping.name]}</td>
                              {mapping.email && <td className="p-2">{row[mapping.email]}</td>}
                              {mapping.gender && <td className="p-2">{row[mapping.gender]}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!mapping.name || csvData.length === 0 || importing}
              >
                {importing ? 'Importando...' : `Importar ${csvData.length} estudiantes`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
