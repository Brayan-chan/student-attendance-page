export interface Course {
  id: string
  classroomId?: string
  name: string
  section?: string
  description?: string
  students: Student[]
  schedules: Schedule[]
  importedAt: string
  lastSyncedAt?: string // Última vez que se sincronizó con Classroom
}

export interface Student {
  id: string
  classroomId?: string
  name: string
  email?: string
  photoUrl?: string
  qrCode?: string // Código QR único para el estudiante
  gender?: 'masculino' | 'femenino' | 'otro' // Para estadísticas
  accumulatedTardies?: number // Contador de retardos acumulados
}

export interface Schedule {
  id: string
  courseId: string
  dayOfWeek: number // 0=Lunes, 1=Martes ... 6=Domingo
  startTime: string // "08:00"
  endTime: string   // "09:30"
  room?: string
}

export type AttendanceStatus = 'presente' | 'ausente' | 'retardo' | 'justificado'

export interface StudentAttendance {
  studentId: string
  status: AttendanceStatus
  note?: string
  scannedAt?: string // Timestamp de cuando escaneó el QR (ISO string)
  manualOverride?: boolean // true si fue marcado manualmente después del escaneo
}

// Sesión activa de asistencia para escaneo de QR
export interface AttendanceSession {
  id: string
  courseId: string
  scheduleId?: string
  date: string // "2026-02-14"
  startedAt: string // ISO timestamp de cuando se abrió la sesión
  endedAt?: string // ISO timestamp de cuando se cerró la sesión
  isActive: boolean
  scannedStudents: string[] // IDs de estudiantes que ya escanearon
  tardyThresholdMinutes?: number // Minutos después del inicio para considerar retardo (default 10)
}


export interface AttendanceRecord {
  id: string
  courseId: string
  date: string // "2026-02-14"
  scheduleId?: string
  records: StudentAttendance[]
  createdAt: string
}

export const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
] as const

export const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
  presente: {
    label: 'Presente',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  ausente: {
    label: 'Ausente',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  retardo: {
    label: 'Retardo',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  justificado: {
    label: 'Justificado',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
}

// Configuración del sistema
export interface TeacherProfile {
  name: string
  email: string
  phone?: string
  department?: string
  institution?: string
  photoUrl?: string
}

export interface SystemSettings {
  tardyThresholdMinutes: number // Minutos de tolerancia para retardos (default: 10)
  defaultSessionDurationMinutes: number // Duración por defecto de una sesión de QR (default: 15)
  teacherProfile?: TeacherProfile
  version: string
  lastUpdated: string
}
