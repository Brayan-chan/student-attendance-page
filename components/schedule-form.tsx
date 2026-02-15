'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
import { DAY_NAMES } from '@/lib/types'
import type { Schedule } from '@/lib/types'

export function ScheduleForm({
  schedules,
  courseId,
  onUpdate,
}: {
  schedules: Schedule[]
  courseId: string
  onUpdate: (schedules: Schedule[]) => void
}) {
  const [dayOfWeek, setDayOfWeek] = useState<string>('0')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('09:30')
  const [room, setRoom] = useState('')

  const handleAdd = () => {
    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      courseId,
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
      room: room || undefined,
    }
    onUpdate([...schedules, newSchedule])
    setRoom('')
  }

  const handleDelete = (id: string) => {
    onUpdate(schedules.filter((s) => s.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Existing schedules */}
      {schedules.length > 0 && (
        <div className="flex flex-col gap-2">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{DAY_NAMES[s.dayOfWeek]}</span>
                <span className="text-xs text-muted-foreground">
                  {s.startTime} - {s.endTime}
                  {s.room ? ` | Salon: ${s.room}` : ''}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(s.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar horario</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new schedule */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-3 text-sm font-medium">Agregar horario</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="day" className="text-xs">Dia</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger id="day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_NAMES.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="room" className="text-xs">Salon (opcional)</Label>
            <Input
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ej: A-101"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start" className="text-xs">Hora inicio</Label>
            <Input
              id="start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end" className="text-xs">Hora fin</Label>
            <Input
              id="end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleAdd} className="mt-3 gap-2" size="sm">
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>
    </div>
  )
}
