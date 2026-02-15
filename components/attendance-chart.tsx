'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Course, AttendanceRecord } from '@/lib/types'

const COLORS = {
  presente: '#10b981',
  ausente: '#ef4444',
  retardo: '#f59e0b',
  justificado: '#0ea5e9',
}

export function AttendanceBarChart({
  course,
  records,
}: {
  course: Course
  records: AttendanceRecord[]
}) {
  const data = course.students.map((student) => {
    let presente = 0
    let ausente = 0
    let retardo = 0
    let justificado = 0

    records.forEach((record) => {
      const attendance = record.records.find((r) => r.studentId === student.id)
      if (attendance?.status === 'presente') presente++
      else if (attendance?.status === 'ausente') ausente++
      else if (attendance?.status === 'retardo') retardo++
      else if (attendance?.status === 'justificado') justificado++
    })

    const total = records.length
    const pct = total > 0 ? Math.round(((presente + retardo) / total) * 100) : 0

    return {
      name: student.name.split(' ').slice(0, 2).join(' '),
      '% Asistencia': pct,
      Presentes: presente,
      Ausentes: ausente,
      Retardos: retardo,
      Justificados: justificado,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Porcentaje de asistencia por alumno</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 35)}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--card))',
              }}
            />
            <Bar
              dataKey="% Asistencia"
              fill="#10b981"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AttendancePieChart({
  records,
}: {
  records: AttendanceRecord[]
}) {
  let presente = 0
  let ausente = 0
  let retardo = 0
  let justificado = 0

  records.forEach((record) => {
    record.records.forEach((r) => {
      if (r.status === 'presente') presente++
      else if (r.status === 'ausente') ausente++
      else if (r.status === 'retardo') retardo++
      else if (r.status === 'justificado') justificado++
    })
  })

  const data = [
    { name: 'Presentes', value: presente, color: COLORS.presente },
    { name: 'Ausentes', value: ausente, color: COLORS.ausente },
    { name: 'Retardos', value: retardo, color: COLORS.retardo },
    { name: 'Justificados', value: justificado, color: COLORS.justificado },
  ].filter((d) => d.value > 0)

  const total = presente + ausente + retardo + justificado

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribucion general</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sin datos disponibles
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function AttendanceLineChart({
  course,
  records,
}: {
  course: Course
  records: AttendanceRecord[]
}) {
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date))

  const data = sortedRecords.map((record) => {
    const total = course.students.length
    const presente = record.records.filter(
      (r) => r.status === 'presente' || r.status === 'retardo'
    ).length
    const pct = total > 0 ? Math.round((presente / total) * 100) : 0

    return {
      fecha: new Date(record.date + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
      }),
      '% Asistencia': pct,
      Presentes: record.records.filter((r) => r.status === 'presente').length,
      Ausentes: record.records.filter((r) => r.status === 'ausente').length,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tendencia de asistencia</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sin datos disponibles
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="% Asistencia"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Gráfica de análisis por género (con proporción estadística)
export function AttendanceByGenderChart({
  course,
  records,
}: {
  course: Course
  records: AttendanceRecord[]
}) {
  // Contar estudiantes por género
  const genderCounts = {
    masculino: course.students.filter(s => s.gender === 'masculino').length,
    femenino: course.students.filter(s => s.gender === 'femenino').length,
    otro: course.students.filter(s => s.gender === 'otro').length,
    sinDefinir: course.students.filter(s => !s.gender).length,
  }

  const total = course.students.length

  // Calcular ausencias por género
  const absencesByGender = {
    masculino: 0,
    femenino: 0,
    otro: 0,
    sinDefinir: 0,
  }

  records.forEach((record) => {
    record.records.forEach((attendance) => {
      if (attendance.status === 'ausente') {
        const student = course.students.find(s => s.id === attendance.studentId)
        if (student) {
          if (student.gender === 'masculino') absencesByGender.masculino++
          else if (student.gender === 'femenino') absencesByGender.femenino++
          else if (student.gender === 'otro') absencesByGender.otro++
          else absencesByGender.sinDefinir++
        }
      }
    })
  })

  // Calcular proporción estadística (ausencias / total de estudiantes de ese género / total de registros)
  const totalRecords = records.length
  const data = [
    {
      genero: 'Masculino',
      proporcion: genderCounts.masculino > 0 
        ? ((absencesByGender.masculino / genderCounts.masculino / totalRecords) * 100).toFixed(1)
        : 0,
      ausencias: absencesByGender.masculino,
      estudiantes: genderCounts.masculino,
    },
    {
      genero: 'Femenino',
      proporcion: genderCounts.femenino > 0 
        ? ((absencesByGender.femenino / genderCounts.femenino / totalRecords) * 100).toFixed(1)
        : 0,
      ausencias: absencesByGender.femenino,
      estudiantes: genderCounts.femenino,
    },
    {
      genero: 'Otro',
      proporcion: genderCounts.otro > 0 
        ? ((absencesByGender.otro / genderCounts.otro / totalRecords) * 100).toFixed(1)
        : 0,
      ausencias: absencesByGender.otro,
      estudiantes: genderCounts.otro,
    },
    {
      genero: 'Sin definir',
      proporcion: genderCounts.sinDefinir > 0 
        ? ((absencesByGender.sinDefinir / genderCounts.sinDefinir / totalRecords) * 100).toFixed(1)
        : 0,
      ausencias: absencesByGender.sinDefinir,
      estudiantes: genderCounts.sinDefinir,
    },
  ].filter(d => d.estudiantes > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Análisis de ausencias por género</CardTitle>
        <p className="text-xs text-muted-foreground">
          Proporción estadística de ausencias considerando el total de estudiantes por género
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No hay datos de género disponibles
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="genero" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: '% Ausencias', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
                content={({ payload }) => {
                  if (!payload?.[0]) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-sm">
                      <p className="font-semibold">{data.genero}</p>
                      <p className="text-sm">Proporción: {data.proporcion}%</p>
                      <p className="text-xs text-muted-foreground">
                        {data.ausencias} ausencias / {data.estudiantes} estudiantes
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="proporcion" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Gráfica de análisis por día de la semana
export function AttendanceByDayOfWeekChart({
  records,
}: {
  records: AttendanceRecord[]
}) {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  
  // Contar ausencias por día de la semana
  const absencesByDay: { [key: number]: number } = {}
  const recordsByDay: { [key: number]: number } = {}

  records.forEach((record) => {
    const date = new Date(record.date + 'T12:00:00')
    const dayOfWeek = date.getDay() // 0 = domingo, 1 = lunes, etc.
    
    recordsByDay[dayOfWeek] = (recordsByDay[dayOfWeek] || 0) + 1
    
    const absences = record.records.filter(r => r.status === 'ausente').length
    absencesByDay[dayOfWeek] = (absencesByDay[dayOfWeek] || 0) + absences
  })

  // Crear datos para la gráfica
  const data = Object.keys(recordsByDay)
    .map(day => {
      const dayNum = parseInt(day)
      const totalAbsences = absencesByDay[dayNum] || 0
      const totalRecords = recordsByDay[dayNum] || 0
      const avgAbsences = totalRecords > 0 ? (totalAbsences / totalRecords).toFixed(1) : 0

      return {
        dia: dayNames[dayNum],
        promedio: parseFloat(avgAbsences as string),
        total: totalAbsences,
        registros: totalRecords,
      }
    })
    .sort((a, b) => {
      const order = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      return order.indexOf(a.dia) - order.indexOf(b.dia)
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ausencias por día de la semana</CardTitle>
        <p className="text-xs text-muted-foreground">
          Promedio de ausencias por día de la semana
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sin datos disponibles
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Promedio', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                }}
                content={({ payload }) => {
                  if (!payload?.[0]) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-sm">
                      <p className="font-semibold">{data.dia}</p>
                      <p className="text-sm">Promedio: {data.promedio} ausencias</p>
                      <p className="text-xs text-muted-foreground">
                        {data.total} ausencias en {data.registros} registros
                      </p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="promedio" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
