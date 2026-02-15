'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/configuracion">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Configuración
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
              <CardDescription>
                Última actualización: 14 de febrero de 2026
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Introducción</h2>
            <p className="text-muted-foreground">
              Esta Política de Privacidad describe cómo el Sistema de Gestión de Asistencia Estudiantil (en adelante,
              "el Sistema", "nosotros" o "nuestro") recopila, usa, almacena y protege la información personal de los
              usuarios. Nos comprometemos a proteger la privacidad de los datos personales de docentes y estudiantes.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Información que Recopilamos</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium mb-2">2.1. Información de Cuenta de Google</h3>
                <p className="text-muted-foreground">
                  Cuando inicia sesión con Google, recopilamos:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Foto de perfil</li>
                  <li>ID de usuario de Google</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">2.2. Información de Google Classroom</h3>
                <p className="text-muted-foreground">
                  Con su autorización explícita, importamos:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                  <li>Lista de cursos que imparte</li>
                  <li>Información de estudiantes inscritos (nombres, correos, fotos)</li>
                  <li>Detalles de los cursos (nombre, sección, descripción)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">2.3. Información Generada en el Sistema</h3>
                <p className="text-muted-foreground">
                  Durante el uso del Sistema, se genera y almacena:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
                  <li>Registros de asistencia (fecha, hora, estado)</li>
                  <li>Horarios de clases configurados</li>
                  <li>Códigos QR únicos para estudiantes</li>
                  <li>Sesiones de escaneo de QR</li>
                  <li>Notas y observaciones de asistencia</li>
                  <li>Configuraciones personalizadas del sistema</li>
                  <li>Información adicional del perfil del docente (teléfono, departamento, institución)</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Cómo Utilizamos la Información</h2>
            <p className="text-muted-foreground">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Proporcionar y mantener la funcionalidad del Sistema</li>
              <li>Gestionar el registro y seguimiento de asistencia estudiantil</li>
              <li>Generar reportes y análisis estadísticos de asistencia</li>
              <li>Sincronizar información con Google Classroom</li>
              <li>Personalizar la experiencia del usuario en el Sistema</li>
              <li>Identificar y prevenir uso fraudulento o no autorizado</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Almacenamiento de Datos</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ⚠️ Importante: Almacenamiento Local
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Todos los datos se almacenan localmente en su navegador mediante localStorage.
                  No utilizamos servidores externos para almacenar información.
                </p>
              </div>

              <p className="text-muted-foreground">
                Esto significa que:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Los datos permanecen en su dispositivo y navegador específico</li>
                <li>No compartimos ni transmitimos información a terceros</li>
                <li>Otros dispositivos o navegadores no tendrán acceso a sus datos</li>
                <li>Si elimina los datos del navegador, perderá toda la información</li>
                <li>Es su responsabilidad realizar respaldos periódicos exportando los datos</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Compartir Información</h2>
            <p className="text-muted-foreground">
              No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en las
              siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li><strong>Con Google:</strong> Para autenticación y sincronización con Google Classroom</li>
              <li><strong>Por requisito legal:</strong> Si es requerido por ley o proceso legal</li>
              <li><strong>Con su consentimiento:</strong> Cuando usted autoriza explícitamente compartir información</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Seguridad de los Datos</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad para proteger su información:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Autenticación mediante OAuth 2.0 de Google</li>
              <li>Tokens de acceso cifrados y seguros</li>
              <li>Códigos QR únicos y temporales para cada sesión</li>
              <li>Sin almacenamiento de contraseñas en el Sistema</li>
              <li>Acceso restringido solo a usuarios autenticados</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
              Le recomendamos mantener la seguridad de su dispositivo y cuenta de Google.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Derechos del Usuario</h2>
            <p className="text-muted-foreground">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li><strong>Acceder:</strong> Visualizar toda la información almacenada en el Sistema</li>
              <li><strong>Modificar:</strong> Actualizar o corregir información inexacta</li>
              <li><strong>Eliminar:</strong> Borrar toda su información del Sistema en cualquier momento</li>
              <li><strong>Exportar:</strong> Descargar sus datos en formatos Excel o PDF</li>
              <li><strong>Revocar:</strong> Cancelar el acceso del Sistema a Google Classroom desde su cuenta de Google</li>
              <li><strong>Oponerse:</strong> Dejar de usar el Sistema en cualquier momento</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Datos de Menores</h2>
            <p className="text-muted-foreground">
              El Sistema está diseñado para uso de docentes y puede contener información de estudiantes menores
              de edad. Los docentes son responsables de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Obtener las autorizaciones necesarias de padres o tutores según la legislación aplicable</li>
              <li>Cumplir con las políticas de privacidad de su institución educativa</li>
              <li>Proteger la información personal de los estudiantes</li>
              <li>No compartir códigos QR de estudiantes con personas no autorizadas</li>
              <li>Eliminar información cuando ya no sea necesaria</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Cookies y Tecnologías Similares</h2>
            <p className="text-muted-foreground">
              El Sistema utiliza:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li><strong>localStorage:</strong> Para almacenar todos los datos del Sistema localmente</li>
              <li><strong>sessionStorage:</strong> Para mantener el estado de sesión mientras navega</li>
              <li><strong>Cookies de autenticación:</strong> Proporcionadas por Google para mantener su sesión</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Estas tecnologías son esenciales para el funcionamiento del Sistema y no se utilizan para
              rastreo o publicidad.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Transferencias Internacionales</h2>
            <p className="text-muted-foreground">
              Como todos los datos se almacenan localmente en su navegador, no hay transferencias internacionales
              de datos. La única conexión externa es con los servidores de Google para autenticación y sincronización
              con Google Classroom, sujeto a las políticas de privacidad de Google.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Retención de Datos</h2>
            <p className="text-muted-foreground">
              Los datos permanecen en su navegador indefinidamente hasta que usted decida:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Eliminar manualmente la información desde el Sistema</li>
              <li>Limpiar los datos de navegación de su navegador</li>
              <li>Desinstalar o dejar de usar el navegador</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Le recomendamos revisar y eliminar periódicamente los datos que ya no necesite.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">12. Cambios a esta Política</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios se publicarán en esta
              página con una fecha de "Última actualización" revisada. Le recomendamos revisar esta política
              regularmente para mantenerse informado sobre cómo protegemos su información.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">13. Cumplimiento Legal</h2>
            <p className="text-muted-foreground">
              Esta política está diseñada para cumplir con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Ley Federal de Protección de Datos Personales en Posesión de Particulares (México)</li>
              <li>Reglamento General de Protección de Datos (GDPR) cuando sea aplicable</li>
              <li>Family Educational Rights and Privacy Act (FERPA) para datos educativos</li>
              <li>Children's Online Privacy Protection Act (COPPA) para datos de menores</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">14. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el
              manejo de su información personal, puede contactarnos a través de la información proporcionada
              en su perfil de docente dentro del Sistema.
            </p>
          </section>

          <Separator />

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              ✓ Su privacidad es nuestra prioridad
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              Nos comprometemos a ser transparentes sobre nuestras prácticas de privacidad y a proteger
              la información personal de todos los usuarios del Sistema.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/configuracion">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Configuración
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
