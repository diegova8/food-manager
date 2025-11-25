import { Link } from 'react-router-dom';
import Header from '../components/Header';

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Términos de Servicio</h1>
          <p className="text-slate-500 text-sm mb-8">Última actualización: {new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-slate-600">
                Al acceder y usar el servicio de Ceviche de mi Tata ("el Servicio"), usted acepta estar
                sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos,
                no debe usar el Servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Descripción del Servicio</h2>
              <p className="text-slate-600 mb-3">
                Ceviche de mi Tata es una plataforma en línea para pedidos y entrega de ceviche. El Servicio incluye:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Visualización de menú y precios</li>
                <li>Sistema de pedidos en línea</li>
                <li>Gestión de cuenta de usuario</li>
                <li>Procesamiento de pagos y confirmaciones</li>
                <li>Servicio de entrega a domicilio</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">3. Registro de Cuenta</h2>
              <h3 className="text-xl font-semibold text-slate-700 mb-3">3.1 Requisitos</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Debe tener al menos 13 años de edad</li>
                <li>Debe proporcionar información precisa y completa</li>
                <li>Debe verificar su dirección de correo electrónico</li>
                <li>Es responsable de mantener la confidencialidad de su contraseña</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">3.2 Responsabilidad de la Cuenta</h3>
              <p className="text-slate-600">
                Usted es responsable de todas las actividades que ocurran bajo su cuenta. Debe notificarnos
                inmediatamente sobre cualquier uso no autorizado de su cuenta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">4. Pedidos y Pagos</h2>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">4.1 Proceso de Pedidos</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Los pedidos están sujetos a disponibilidad</li>
                <li>Nos reservamos el derecho de rechazar cualquier pedido</li>
                <li>Los precios pueden cambiar sin previo aviso</li>
                <li>Debe proporcionar una dirección de entrega válida</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">4.2 Pago</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>El pago debe realizarse mediante transferencia bancaria (SINPE Móvil)</li>
                <li>Debe cargar el comprobante de pago para confirmar el pedido</li>
                <li>Los pedidos se procesarán después de verificar el pago</li>
                <li>Todos los precios incluyen impuestos aplicables</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">4.3 Confirmación</h3>
              <p className="text-slate-600">
                Recibirá una confirmación por correo electrónico una vez que su pedido sea aceptado.
                Esta confirmación no garantiza que el pedido será entregado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Entrega</h2>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">5.1 Tiempos de Entrega</h3>
              <p className="text-slate-600 mb-3">
                Los tiempos de entrega son estimados y pueden variar debido a:
              </p>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Volumen de pedidos</li>
                <li>Condiciones climáticas</li>
                <li>Tráfico</li>
                <li>Distancia</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">5.2 Responsabilidad de Entrega</h3>
              <p className="text-slate-600">
                Una vez entregado el pedido, no somos responsables por la calidad del producto después de la entrega.
                El producto debe consumirse dentro del tiempo recomendado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Cancelaciones y Reembolsos</h2>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">6.1 Cancelación por el Usuario</h3>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Puede cancelar antes de que el pedido sea preparado</li>
                <li>Contacte al soporte lo antes posible para solicitar cancelación</li>
                <li>No se garantiza el reembolso si ya comenzó la preparación</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">6.2 Cancelación por Nosotros</h3>
              <p className="text-slate-600 mb-3">
                Nos reservamos el derecho de cancelar pedidos por:
              </p>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Falta de disponibilidad de productos</li>
                <li>Error en precios o información del producto</li>
                <li>Pago no verificado</li>
                <li>Dirección de entrega inválida o fuera de área</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-700 mb-3">6.3 Reembolsos</h3>
              <p className="text-slate-600">
                Los reembolsos se procesarán a la cuenta bancaria original dentro de 5-10 días hábiles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Uso Aceptable</h2>
              <p className="text-slate-600 mb-3">Está prohibido:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Usar el Servicio para propósitos ilegales</li>
                <li>Intentar hackear o comprometer la seguridad del sistema</li>
                <li>Hacer pedidos fraudulentos</li>
                <li>Acosar o abusar del personal</li>
                <li>Compartir su cuenta con terceros</li>
                <li>Usar scripts o bots automatizados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">8. Propiedad Intelectual</h2>
              <p className="text-slate-600 mb-3">
                Todo el contenido del Servicio, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
                <li>Diseño y layout del sitio</li>
                <li>Logotipos y marcas</li>
                <li>Textos, imágenes y fotografías</li>
                <li>Software y código fuente</li>
              </ul>
              <p className="text-slate-600">
                Es propiedad de Ceviche de mi Tata y está protegido por leyes de propiedad intelectual.
                No puede copiar, modificar, o distribuir sin autorización escrita.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">9. Limitación de Responsabilidad</h2>
              <p className="text-slate-600 mb-3">
                El Servicio se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables por:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Daños indirectos, incidentales o consecuentes</li>
                <li>Pérdida de ganancias o datos</li>
                <li>Interrupciones del servicio</li>
                <li>Errores técnicos o problemas de red</li>
                <li>Reacciones alérgicas o problemas de salud (consulte ingredientes)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">10. Indemnización</h2>
              <p className="text-slate-600">
                Usted acepta indemnizar y mantener indemne a Ceviche de mi Tata de cualquier reclamo,
                pérdida, responsabilidad, o gasto (incluyendo honorarios legales) que surja de su uso
                del Servicio o violación de estos Términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">11. Modificaciones del Servicio</h2>
              <p className="text-slate-600">
                Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio (o cualquier
                parte de él) en cualquier momento sin previo aviso. No seremos responsables ante usted o
                terceros por cualquier modificación, suspensión o discontinuación del Servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">12. Terminación</h2>
              <p className="text-slate-600 mb-3">
                Podemos terminar o suspender su cuenta inmediatamente si:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Viola estos Términos de Servicio</li>
                <li>Realiza actividades fraudulentas</li>
                <li>Por cualquier otra razón a nuestra discreción</li>
              </ul>
              <p className="text-slate-600 mt-3">
                Usted puede cerrar su cuenta en cualquier momento contactándonos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">13. Ley Aplicable</h2>
              <p className="text-slate-600">
                Estos Términos se rigen por las leyes de Costa Rica. Cualquier disputa se resolverá
                en los tribunales de Costa Rica.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">14. Cambios a los Términos</h2>
              <p className="text-slate-600">
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios
                entrarán en vigor inmediatamente después de su publicación. Su uso continuado del Servicio
                después de los cambios constituye su aceptación de los nuevos Términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">15. Contacto</h2>
              <p className="text-slate-600 mb-3">
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li><strong>Email:</strong> <a href="mailto:legal@cevichedemitata.com" className="text-orange-600 hover:underline">legal@cevichedemitata.com</a></li>
                <li><strong>Email General:</strong> <a href="mailto:contacto@cevichedemitata.com" className="text-orange-600 hover:underline">contacto@cevichedemitata.com</a></li>
              </ul>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
              <p className="text-slate-700">
                <strong>Nota Importante:</strong> Al realizar un pedido, usted acepta estos Términos de Servicio
                y nuestra <Link to="/privacy" className="text-orange-600 hover:underline font-medium">Política de Privacidad</Link>.
              </p>
            </div>

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

export default TermsOfServicePage;
