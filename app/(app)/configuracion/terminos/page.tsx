'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TerminosPage() {
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
          <CardTitle className="text-3xl">Términos y Condiciones</CardTitle>
          <CardDescription>
            Última actualización: 14 de febrero de 2026
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar este Sistema de Gestión de Asistencia Estudiantil (en adelante, "el Sistema"),
              usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de
              acuerdo con estos términos, no debe utilizar el Sistema.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground">
              El Sistema es una aplicación web diseñada para facilitar la gestión de asistencia estudiantil mediante:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Integración con Google Classroom para importar cursos y estudiantes</li>
              <li>Registro de asistencia mediante códigos QR</li>
              <li>Gestión de horarios de clases</li>
              <li>Generación de reportes y análisis estadísticos</li>
              <li>Almacenamiento local de información en el navegador del usuario</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Requisitos de Uso</h2>
            <p className="text-muted-foreground">
              Para utilizar el Sistema, usted debe:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Tener una cuenta activa de Google asociada con una institución educativa</li>
              <li>Contar con acceso a Google Classroom</li>
              <li>Autorizar los permisos necesarios para acceder a la información de sus cursos</li>
              <li>Ser docente o personal autorizado de una institución educativa</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Responsabilidades del Usuario</h2>
            <p className="text-muted-foreground">
              Como usuario del Sistema, usted se compromete a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Utilizar el Sistema únicamente con fines educativos legítimos</li>
              <li>Mantener la precisión de los registros de asistencia</li>
              <li>Proteger la información personal de los estudiantes</li>
              <li>No compartir códigos QR de estudiantes con terceros no autorizados</li>
              <li>Cumplir con las políticas de privacidad y protección de datos aplicables</li>
              <li>Notificar cualquier uso no autorizado o violación de seguridad</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Almacenamiento de Datos</h2>
            <p className="text-muted-foreground">
              El Sistema almacena todos los datos localmente en el navegador del usuario mediante localStorage.
              Esto significa que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Los datos no se transmiten ni almacenan en servidores externos</li>
              <li>La información persiste únicamente en el dispositivo y navegador utilizado</li>
              <li>Limpiar los datos del navegador eliminará toda la información del Sistema</li>
              <li>El usuario es responsable de realizar respaldos periódicos de sus datos</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Integración con Google</h2>
            <p className="text-muted-foreground">
              El Sistema se integra con Google Classroom y utiliza OAuth 2.0 para la autenticación. Al usar
              el Sistema, usted también acepta los términos de servicio de Google y entiende que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>El acceso a Google Classroom se realiza bajo su autorización explícita</li>
              <li>Los datos importados provienen directamente de su cuenta de Google Classroom</li>
              <li>Puede revocar el acceso en cualquier momento desde su cuenta de Google</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Propiedad Intelectual</h2>
            <p className="text-muted-foreground">
              El Sistema, incluido su diseño, código fuente, funcionalidades y documentación, está protegido
              por derechos de autor. Usted no puede:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Copiar, modificar o distribuir el código del Sistema sin autorización</li>
              <li>Realizar ingeniería inversa del Sistema</li>
              <li>Eliminar avisos de derechos de autor o marcas del Sistema</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground">
              El Sistema se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Pérdida de datos debido a fallos del navegador o del dispositivo</li>
              <li>Errores en los registros de asistencia causados por uso indebido</li>
              <li>Interrupciones del servicio de Google Classroom</li>
              <li>Daños indirectos o consecuentes derivados del uso del Sistema</li>
            </ul>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Modificaciones</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán
              en vigor inmediatamente después de su publicación en el Sistema. El uso continuado del Sistema
              después de dichos cambios constituye su aceptación de los nuevos términos.
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre estos términos y condiciones, puede contactarnos a través de la
              información proporcionada en su perfil de docente dentro del Sistema.
            </p>
          </section>

          <Separator />

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
