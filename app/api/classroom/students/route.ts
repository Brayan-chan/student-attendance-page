import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  const accessToken = (session as any)?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const courseId = request.nextUrl.searchParams.get('courseId')
  if (!courseId) {
    return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 })
  }

  try {
    let allStudents: any[] = []
    let pageToken: string | undefined

    do {
      const url = new URL(
        `https://classroom.googleapis.com/v1/courses/${courseId}/students`
      )
      url.searchParams.set('pageSize', '100')
      if (pageToken) url.searchParams.set('pageToken', pageToken)

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) {
        const error = await res.text()
        return NextResponse.json(
          { error: 'Error al obtener alumnos', details: error },
          { status: res.status }
        )
      }

      const data = await res.json()
      if (data.students) {
        allStudents = allStudents.concat(data.students)
      }
      pageToken = data.nextPageToken
    } while (pageToken)

    return NextResponse.json(allStudents)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error de conexion con Google Classroom' },
      { status: 500 }
    )
  }
}
