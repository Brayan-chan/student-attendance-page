import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  const accessToken = (session as any)?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const res = await fetch(
      'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&teacherId=me&pageSize=100',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json(
        { error: 'Error al obtener cursos', details: error },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data.courses || [])
  } catch (error) {
    return NextResponse.json(
      { error: 'Error de conexion con Google Classroom' },
      { status: 500 }
    )
  }
}
