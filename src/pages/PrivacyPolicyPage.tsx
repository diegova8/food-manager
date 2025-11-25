import { Link } from 'react-router-dom';
import Header from '../components/Header';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Política de Privacidad</h1>
          <p className="text-slate-500 text-sm mb-8">Última actualización: {new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Introducción</h2>
              <p className="text-slate-600 mb-4">
                Bienvenido a Ceviche de mi Tata. Nos tomamos muy en serio la privacidad de nuestros usuarios.
                Esta Política de Privacidad explica qué información recopilamos, cómo la usamos, y sus derechos
                respecto a sus datos personales.
              </p>
              <p className="text-slate-600">
                Al usar nuestro servicio, usted acepta la recopilación y uso de información de acuerdo con esta política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Información que Recopilamos</h2>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">2.1 Información que Usted Proporciona</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li><strong>Cuenta de Usuario:</strong> Nombre de usuario, contraseña (encriptada), nombre, apellido, correo electrónico, teléfono</li>
                <li><strong>Información de Pedidos:</strong> Dirección de entrega, notas especiales, preferencias dietéticas</li>
                <li><strong>Información de Pago:</strong> Comprobantes de pago (imágenes), información de transacciones</li>
                <li><strong>Comunicaciones:</strong> Mensajes de soporte, reportes de bugs, sugerencias</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">2.2 Información Recopilada Automáticamente</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li><strong>Datos de Uso:</strong> Páginas visitadas, tiempo en el sitio, clics, interacciones</li>
                <li><strong>Información del Dispositivo:</strong> Tipo de navegador, dirección IP, sistema operativo</li>
                <li><strong>Cookies:</strong> Tokens de sesión para mantener su sesión activa</li>
                <li><strong>Monitoreo de Errores:</strong> Información técnica sobre errores para mejorar el servicio (vía Sentry)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Cómo Usamos su Información</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Procesar Pedidos:</strong> Gestionar y entregar sus pedidos de ceviche</li>
                <li><strong>Comunicación:</strong> Enviar confirmaciones, actualizaciones de pedidos, y notificaciones importantes</li>
                <li><strong>Mejorar el Servicio:</strong> Analizar uso para mejorar funcionalidad y experiencia</li>
                <li><strong>Seguridad:</strong> Detectar y prevenir fraude, abuso, y problemas de seguridad</li>
                <li><strong>Soporte al Cliente:</strong> Responder a sus consultas y resolver problemas</li>
                <li><strong>Marketing:</strong> Enviar ofertas y promociones (solo si acepta recibir comunicaciones)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Base Legal para el Procesamiento</h2>
              <p className="text-slate-600 mb-3">Procesamos sus datos personales bajo las siguientes bases legales:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Ejecución de Contrato:</strong> Para procesar y entregar sus pedidos</li>
                <li><strong>Consentimiento:</strong> Para comunicaciones de marketing (puede retirarse en cualquier momento)</li>
                <li><strong>Interés Legítimo:</strong> Para mejorar nuestro servicio y prevenir fraude</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Compartir Información</h2>
              <p className="text-slate-600 mb-3">NO vendemos sus datos personales. Compartimos información solo en estas circunstancias:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Proveedores de Servicios:</strong>
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>MongoDB Atlas (almacenamiento de datos)</li>
                    <li>Vercel (hosting de la aplicación)</li>
                    <li>Resend (servicio de email)</li>
                    <li>Sentry (monitoreo de errores)</li>
                  </ul>
                </li>
                <li><strong>Requisitos Legales:</strong> Si es requerido por ley o para proteger nuestros derechos</li>
                <li><strong>Transferencia de Negocio:</strong> En caso de fusión, venta o transferencia de activos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Seguridad de Datos</h2>
              <p className="text-slate-600 mb-3">Implementamos medidas de seguridad para proteger su información:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Encriptación:</strong> Contraseñas hasheadas con bcrypt (10 rounds)</li>
                <li><strong>HTTPS:</strong> Todas las comunicaciones encriptadas en tránsito</li>
                <li><strong>Autenticación:</strong> Tokens JWT con expiración de 7 días</li>
                <li><strong>Rate Limiting:</strong> Protección contra ataques de fuerza bruta</li>
                <li><strong>Acceso Limitado:</strong> Solo personal autorizado tiene acceso a datos</li>
              </ul>
              <p className="text-slate-600 mt-3">
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. Hacemos nuestro mejor esfuerzo
                para proteger sus datos, pero no podemos garantizar seguridad absoluta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Retención de Datos</h2>
              <p className="text-slate-600 mb-3">Conservamos sus datos personales mientras:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Su cuenta esté activa</li>
                <li>Sea necesario para proporcionar el servicio</li>
                <li>Sea requerido por obligaciones legales, fiscales o contables</li>
              </ul>
              <p className="text-slate-600 mt-3">
                Puede solicitar la eliminación de su cuenta en cualquier momento contactándonos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Sus Derechos</h2>
              <p className="text-slate-600 mb-3">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Corrección:</strong> Actualizar información incorrecta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de su cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Objeción:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Restricción:</strong> Solicitar limitación del procesamiento</li>
                <li><strong>Retirar Consentimiento:</strong> Cancelar suscripción a comunicaciones de marketing</li>
              </ul>
              <p className="text-slate-600 mt-3">
                Para ejercer estos derechos, contáctenos en: <a href="mailto:privacy@cevichedemitata.com" className="text-orange-600 hover:underline">privacy@cevichedemitata.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Cookies</h2>
              <p className="text-slate-600 mb-3">
                Usamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Cookies Esenciales:</strong> Token de autenticación (JWT) almacenado en localStorage</li>
                <li><strong>Cookies de Análisis:</strong> Información de errores y uso (vía Sentry)</li>
              </ul>
              <p className="text-slate-600 mt-3">
                Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">10. Menores de Edad</h2>
              <p className="text-slate-600">
                Nuestro servicio no está dirigido a menores de 13 años. No recopilamos intencionalmente
                información de menores de 13 años. Si descubrimos que hemos recopilado información de un menor,
                la eliminaremos inmediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">11. Cambios a esta Política</h2>
              <p className="text-slate-600">
                Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos de cambios
                significativos publicando la nueva política en esta página y actualizando la fecha de
                "Última actualización". Le recomendamos revisar esta política periódicamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">12. Contacto</h2>
              <p className="text-slate-600 mb-3">
                Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos:
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@cevichedemitata.com" className="text-orange-600 hover:underline">privacy@cevichedemitata.com</a></li>
                <li><strong>Email General:</strong> <a href="mailto:contacto@cevichedemitata.com" className="text-orange-600 hover:underline">contacto@cevichedemitata.com</a></li>
              </ul>
            </section>

            <div className="mt-12 pt-6 border-t border-slate-200">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
