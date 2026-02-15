export interface Course {
  id: string
  classroomId?: string
  name: string
  section?: string
  description?: string
  students: Student[]
  schedules: Schedule[]
  importedAt: string
}

export interface Student {
  id: string
  classroomId?: string
  name: string
  email?: string
  photoUrl?: string
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
