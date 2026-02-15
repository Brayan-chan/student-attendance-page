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
