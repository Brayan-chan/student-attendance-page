import type { Course, AttendanceRecord, AttendanceSession, SystemSettings } from './types'

const COURSES_KEY = 'attendance_courses'
const RECORDS_KEY = 'attendance_records'
const SESSIONS_KEY = 'attendance_sessions'
const SETTINGS_KEY = 'attendance_settings'

const DEFAULT_SETTINGS: SystemSettings = {
  tardyThresholdMinutes: 10,
  defaultSessionDurationMinutes: 15,
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Courses ---
export function getCourses(): Course[] {
  return getItem<Course[]>(COURSES_KEY, [])
}

export function saveCourses(courses: Course[]): void {
  setItem(COURSES_KEY, courses)
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id)
}

export function addCourse(course: Course): void {
  const courses = getCourses()
  courses.push(course)
  saveCourses(courses)
}

export function updateCourse(updated: Course): void {
  const courses = getCourses().map((c) => (c.id === updated.id ? updated : c))
  saveCourses(courses)
}

export function deleteCourse(id: string): void {
  saveCourses(getCourses().filter((c) => c.id !== id))
  // Also delete related attendance records
  saveAttendanceRecords(getAttendanceRecords().filter((r) => r.courseId !== id))
}

// --- Attendance Records ---
export function getAttendanceRecords(): AttendanceRecord[] {
  return getItem<AttendanceRecord[]>(RECORDS_KEY, [])
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  setItem(RECORDS_KEY, records)
}

export function getRecordsByCourse(courseId: string): AttendanceRecord[] {
  return getAttendanceRecords().filter((r) => r.courseId === courseId)
}

export function getRecordByCourseAndDate(courseId: string, date: string): AttendanceRecord | undefined {
  return getAttendanceRecords().find((r) => r.courseId === courseId && r.date === date)
}

export function saveAttendanceRecord(record: AttendanceRecord): void {
  const records = getAttendanceRecords()
  const existingIndex = records.findIndex(
    (r) => r.courseId === record.courseId && r.date === record.date
  )
  if (existingIndex >= 0) {
    records[existingIndex] = record
  } else {
    records.push(record)
  }
  saveAttendanceRecords(records)
}

export function deleteAttendanceRecord(id: string): void {
  saveAttendanceRecords(getAttendanceRecords().filter((r) => r.id !== id))
}

// --- Attendance Sessions ---
export function getAttendanceSessions(): AttendanceSession[] {
  return getItem<AttendanceSession[]>(SESSIONS_KEY, [])
}

export function saveAttendanceSessions(sessions: AttendanceSession[]): void {
  setItem(SESSIONS_KEY, sessions)
}

export function getActiveSession(courseId: string): AttendanceSession | undefined {
  return getAttendanceSessions().find(
    (s) => s.courseId === courseId && s.isActive
  )
}

export function createSession(session: AttendanceSession): void {
  const sessions = getAttendanceSessions()
  // Close any other active sessions for this course
  sessions.forEach((s) => {
    if (s.courseId === session.courseId && s.isActive) {
      s.isActive = false
      s.endedAt = new Date().toISOString()
    }
  })
  sessions.push(session)
  saveAttendanceSessions(sessions)
}

export function updateSession(updated: AttendanceSession): void {
  const sessions = getAttendanceSessions().map((s) => 
    s.id === updated.id ? updated : s
  )
  saveAttendanceSessions(sessions)
}

export function closeSession(sessionId: string): void {
  const sessions = getAttendanceSessions().map((s) => {
    if (s.id === sessionId) {
      return { ...s, isActive: false, endedAt: new Date().toISOString() }
    }
    return s
  })
  saveAttendanceSessions(sessions)
}

// --- System Settings ---
export function getSystemSettings(): SystemSettings {
  return getItem<SystemSettings>(SETTINGS_KEY, DEFAULT_SETTINGS)
}

export function saveSystemSettings(settings: SystemSettings): void {
  setItem(SETTINGS_KEY, {
    ...settings,
    lastUpdated: new Date().toISOString(),
  })
}

export function updateSystemSettings(partial: Partial<SystemSettings>): void {
  const current = getSystemSettings()
  saveSystemSettings({ ...current, ...partial })
}
