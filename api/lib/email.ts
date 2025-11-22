import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('Warning: RESEND_API_KEY is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cevichedemitata.app';
const SALES_EMAIL = process.env.SALES_EMAIL || 'ventas@cevichedemitata.app';

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verifica tu cuenta - Ceviche de mi Tata',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦐 Ceviche de mi Tata</h1>
            </div>
            <h2>¡Hola ${name}!</h2>
            <p>Gracias por registrarte en Ceviche de mi Tata. Para completar tu registro, por favor verifica tu dirección de correo electrónico.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi email</a>
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

export async function sendOrderConfirmation(
  to: string,
  orderDetails: {
    orderId: string;
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    deliveryMethod: string;
  }
): Promise<void> {
  const itemsList = orderDetails.items
    .map(item => `<li>${item.quantity}x ${item.cevicheType} - $${item.price}</li>`)
    .join('');

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Confirmación de pedido #${orderDetails.orderId} - Ceviche de mi Tata`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .order-details {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .total {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              text-align: right;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦐 Ceviche de mi Tata</h1>
            </div>
            <h2>¡Pedido Confirmado!</h2>
            <p>Hemos recibido tu pedido y estamos procesando tu pago.</p>
            <div class="order-details">
              <h3>Pedido #${orderDetails.orderId}</h3>
              <ul>
                ${itemsList}
              </ul>
              <div class="total">Total: $${orderDetails.total}</div>
              <p><strong>Método de entrega:</strong> ${orderDetails.deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Uber Flash'}</p>
            </div>
            <p>Te contactaremos pronto por WhatsApp para coordinar la entrega de tu pedido.</p>
            <p>¡Gracias por tu preferencia!</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

export async function sendNewOrderNotification(
  orderDetails: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    deliveryMethod: string;
    notes?: string;
  }
): Promise<void> {
  const adminEmail = process.env.SALES_EMAIL || SALES_EMAIL;
  const itemsList = orderDetails.items
    .map(item => `<li>${item.quantity}x ${item.cevicheType} - $${item.price}</li>`)
    .join('');

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `🚨 Nuevo pedido #${orderDetails.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f0f9ff;
              border-radius: 10px;
              padding: 30px;
              border: 2px solid #2563eb;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .order-details {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .customer-info {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #dc2626;
              text-align: right;
              margin-top: 10px;
            }
            .notes {
              background-color: #fef2f2;
              padding: 10px;
              border-left: 4px solid #dc2626;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 NUEVO PEDIDO</h1>
            </div>
            <div class="customer-info">
              <h3>Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${orderDetails.customerName}</p>
              <p><strong>Teléfono:</strong> ${orderDetails.customerPhone}</p>
              <p><strong>Entrega:</strong> ${orderDetails.deliveryMethod === 'pickup' ? 'Recoger en tienda' : 'Uber Flash'}</p>
            </div>
            <div class="order-details">
              <h3>Pedido #${orderDetails.orderId}</h3>
              <ul>
                ${itemsList}
              </ul>
              <div class="total">Total: $${orderDetails.total}</div>
            </div>
            ${orderDetails.notes ? `
              <div class="notes">
                <strong>Notas del cliente:</strong><br>
                ${orderDetails.notes}
              </div>
            ` : ''}
            <p style="text-align: center; margin-top: 30px;">
              <strong>Revisa el panel de administración para confirmar y gestionar este pedido.</strong>
            </p>
          </div>
        </body>
      </html>
    `
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Restablecer contraseña - Ceviche de mi Tata',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background-color: #fef2f2;
              border-left: 4px solid #dc2626;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦐 Ceviche de mi Tata</h1>
            </div>
            <h2>Hola ${name},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <div class="warning">
              <p><strong>⚠️ Este enlace expirará en 1 hora.</strong></p>
            </div>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no ha sido modificada.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}
