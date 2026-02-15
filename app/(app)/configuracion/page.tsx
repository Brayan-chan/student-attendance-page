'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Clock, 
  Info, 
  Shield, 
  FileText, 
  Save,
  Building,
  Phone,
  Mail
} from 'lucide-react'
import { getSystemSettings, saveSystemSettings } from '@/lib/storage'
import type { SystemSettings } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ConfiguracionPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadedSettings = getSystemSettings()
    
    // Si hay sesión y no hay perfil de docente, inicializarlo
    if (session?.user && !loadedSettings.teacherProfile) {
      loadedSettings.teacherProfile = {
        name: session.user.name || '',
        email: session.user.email || '',
        photoUrl: session.user.image || undefined,
      }
    }
    
    setSettings(loadedSettings)
  }, [session])

  const handleSave = () => {
    if (!settings) return
    
    setIsSaving(true)
    try {
      saveSystemSettings(settings)
      toast.success('Configuración guardada correctamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza las preferencias del sistema y tu perfil
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Clock className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="w-4 h-4 mr-2" />
            Acerca de
          </TabsTrigger>
          <TabsTrigger value="legal">
            <Shield className="w-4 h-4 mr-2" />
            Legal
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Asistencia</CardTitle>
              <CardDescription>
                Ajusta los parámetros para el registro de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tardyThreshold">
                  Tolerancia para Retardos (minutos)
                </Label>
                <Input
                  id="tardyThreshold"
                  type="number"
                  min="0"
                  max="60"
                  value={settings.tardyThresholdMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tardyThresholdMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Los estudiantes que escaneen su código QR dentro de este tiempo después del inicio de la clase serán marcados con retardo en lugar de ausente.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionDuration">
                  Duración de Sesión QR (minutos)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.defaultSessionDurationMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultSessionDurationMinutes: parseInt(e.target.value) || 15,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Tiempo que estará activa la sesión de escaneo de códigos QR por defecto.
                </p>
              </div>

              <Separator />

              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil del Docente</CardTitle>
              <CardDescription>
                Actualiza tu información personal y profesional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={settings.teacherProfile?.photoUrl} />
                  <AvatarFallback>
                    {settings.teacherProfile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Foto de Perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Sincronizada con tu cuenta de Google
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    value={settings.teacherProfile?.name || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        teacherProfile: {
                          ...settings.teacherProfile!,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.teacherProfile?.email || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        teacherProfile: {
                          ...settings.teacherProfile!,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono (opcional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 999 123 4567"
                    value={settings.teacherProfile?.phone || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        teacherProfile: {
                          ...settings.teacherProfile!,
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="w-4 h-4 inline mr-2" />
                    Departamento (opcional)
                  </Label>
                  <Input
                    id="department"
                    placeholder="Ej: Ciencias de la Computación"
                    value={settings.teacherProfile?.department || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        teacherProfile: {
                          ...settings.teacherProfile!,
                          department: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">
                    <Building className="w-4 h-4 inline mr-2" />
                    Institución (opcional)
                  </Label>
                  <Input
                    id="institution"
                    placeholder="Ej: Universidad Tecnológica"
                    value={settings.teacherProfile?.institution || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        teacherProfile: {
                          ...settings.teacherProfile!,
                          institution: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acerca del Sistema</CardTitle>
              <CardDescription>
                Información sobre la versión y el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Versión del Sistema</span>
                  <span className="text-sm text-muted-foreground">{settings.version}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Última Actualización</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(settings.lastUpdated).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Descripción</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema de gestión de asistencia estudiantil con integración a Google Classroom.
                    Permite el registro de asistencia mediante códigos QR, gestión de horarios,
                    generación de reportes y análisis estadístico.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Características Principales</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Integración con Google Classroom</li>
                    <li>Registro de asistencia con códigos QR</li>
                    <li>Gestión de horarios y clases</li>
                    <li>Reportes detallados en Excel y PDF</li>
                    <li>Análisis estadístico de asistencia</li>
                    <li>Gestión de retardos automatizada</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal */}
        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Términos y Privacidad</CardTitle>
              <CardDescription>
                Información sobre el manejo de datos y políticas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Link href="/configuracion/terminos">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Términos y Condiciones
                  </Button>
                </Link>
                
                <Link href="/configuracion/privacidad">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Política de Privacidad
                  </Button>
                </Link>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Protección de Datos</h3>
                <p className="text-sm text-muted-foreground">
                  Este sistema maneja datos sensibles de estudiantes y docentes. Toda la información
                  se almacena localmente en tu navegador y no se comparte con terceros sin tu
                  consentimiento explícito.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Datos Recopilados</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Información de perfil de Google (nombre, correo, foto)</li>
                  <li>Datos de cursos importados de Google Classroom</li>
                  <li>Registros de asistencia de estudiantes</li>
                  <li>Configuraciones personalizadas del sistema</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Seguridad</h3>
                <p className="text-sm text-muted-foreground">
                  Los códigos QR generados son únicos para cada estudiante y sesión de clase.
                  Las credenciales de autenticación se manejan mediante OAuth 2.0 de Google
                  y los tokens de acceso se cifran y almacenan de forma segura.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
