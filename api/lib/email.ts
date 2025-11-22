import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('Warning: RESEND_API_KEY is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cevichedemitata.app';
const SALES_EMAIL = process.env.SALES_EMAIL || 'ventas@cevichedemitata.app';

// Format currency in Costa Rican Colones
const formatCurrency = (amount: number): string => {
  return `₡${amount.toLocaleString('es-CR')}`;
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Base email styles matching the app design
const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #334155;
    background-color: #fff7ed;
    margin: 0;
    padding: 20px;
  }
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  .container {
    background-color: #ffffff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .header {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    padding: 32px 24px;
    text-align: center;
  }
  .header-icon {
    width: 64px;
    height: 64px;
    background-color: white;
    border-radius: 50%;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }
  .header h1 {
    color: white;
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
  .header p {
    color: #fed7aa;
    margin: 8px 0 0;
    font-size: 14px;
  }
  .content {
    padding: 32px 24px;
  }
  .greeting {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 16px;
  }
  .text {
    color: #64748b;
    margin: 0 0 16px;
    font-size: 15px;
  }
  .button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white !important;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.4);
  }
  .button-teal {
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    box-shadow: 0 4px 14px 0 rgba(20, 184, 166, 0.4);
  }
  .card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 16px;
    padding: 20px;
    margin: 20px 0;
    border: 1px solid #e2e8f0;
  }
  .card-orange {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-color: #fed7aa;
  }
  .card-teal {
    background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
    border-color: #99f6e4;
  }
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin: 0 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .order-item:last-child {
    border-bottom: none;
  }
  .item-qty {
    display: inline-block;
    background-color: #fed7aa;
    color: #c2410c;
    padding: 4px 10px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    margin-right: 12px;
  }
  .item-name {
    color: #334155;
    font-weight: 500;
  }
  .item-price {
    color: #64748b;
    font-weight: 600;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 2px solid #e2e8f0;
  }
  .total-label {
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: #ea580c;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    color: #64748b;
    font-size: 14px;
  }
  .info-value {
    color: #334155;
    font-weight: 600;
    font-size: 14px;
  }
  .info-value-teal {
    color: #0d9488;
  }
  .badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-orange {
    background-color: #ffedd5;
    color: #c2410c;
  }
  .badge-teal {
    background-color: #ccfbf1;
    color: #0f766e;
  }
  .warning-box {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 16px;
    border-radius: 0 12px 12px 0;
    margin: 20px 0;
  }
  .warning-box p {
    margin: 0;
    color: #991b1b;
    font-size: 14px;
  }
  .notes-box {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 16px;
    border-radius: 0 12px 12px 0;
    margin: 20px 0;
  }
  .notes-box p {
    margin: 0;
    color: #92400e;
    font-size: 14px;
  }
  .footer {
    text-align: center;
    padding: 24px;
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
  }
  .footer p {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
  }
  .link {
    color: #f97316;
    word-break: break-all;
  }
  .divider {
    height: 1px;
    background-color: #e2e8f0;
    margin: 24px 0;
  }
`;

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="header-icon">🦐</div>
                <h1>Ceviche de mi Tata</h1>
                <p>Verificación de cuenta</p>
              </div>
              <div class="content">
                <h2 class="greeting">¡Hola ${name}!</h2>
                <p class="text">Gracias por registrarte en Ceviche de mi Tata. Estás a un paso de disfrutar los mejores ceviches.</p>
                <p class="text">Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de correo electrónico:</p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
                </div>

                <div class="card">
                  <p class="card-title">¿No funciona el botón?</p>
                  <p class="text" style="margin-bottom: 8px;">Copia y pega este enlace en tu navegador:</p>
                  <p class="link">${verificationUrl}</p>
                </div>

                <div class="warning-box">
                  <p><strong>⏰ Este enlace expirará en 24 horas.</strong></p>
                </div>

                <p class="text" style="color: #94a3b8; font-size: 13px;">Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
              </div>
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
    customerName: string;
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    deliveryMethod: string;
    scheduledDate: string;
    notes?: string;
  }
): Promise<void> {
  const itemsHtml = orderDetails.items
    .map(item => `
      <div class="order-item">
        <div>
          <span class="item-qty">${item.quantity}x</span>
          <span class="item-name">${item.cevicheType}</span>
        </div>
        <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `)
    .join('');

  const totalItems = orderDetails.items.reduce((sum, item) => sum + item.quantity, 0);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `¡Pedido recibido! #${orderDetails.orderId.slice(-8)} - Ceviche de mi Tata`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <div class="header-icon">✓</div>
                <h1>¡Pedido Recibido!</h1>
                <p>Pedido #${orderDetails.orderId.slice(-8)}</p>
              </div>
              <div class="content">
                <h2 class="greeting">¡Gracias ${orderDetails.customerName}!</h2>
                <p class="text">Hemos recibido tu pedido y estamos verificando tu pago. Te contactaremos pronto por WhatsApp para confirmar los detalles.</p>

                <div class="card card-teal">
                  <p class="card-title">📅 Fecha programada</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #0f766e;">
                    ${formatDate(orderDetails.scheduledDate)}
                  </p>
                </div>

                <div class="card">
                  <p class="card-title">🦐 Tu pedido (${totalItems} ${totalItems === 1 ? 'ceviche' : 'ceviches'})</p>
                  ${itemsHtml}
                  <div class="total-row">
                    <span class="total-label">Total</span>
                    <span class="total-amount">${formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>

                <div class="card">
                  <div class="info-row">
                    <span class="info-label">Método de entrega</span>
                    <span class="info-value">${orderDetails.deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber Flash'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Estado</span>
                    <span class="badge badge-orange">Pendiente de confirmación</span>
                  </div>
                </div>

                ${orderDetails.notes ? `
                  <div class="notes-box">
                    <p><strong>📝 Notas:</strong> ${orderDetails.notes}</p>
                  </div>
                ` : ''}

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${APP_URL}/profile/orders/${orderDetails.orderId}" class="button button-teal">Ver estado del pedido</a>
                </div>

                <div class="card card-orange">
                  <p class="card-title">¿Qué sigue?</p>
                  <p class="text" style="margin-bottom: 8px;">1. Verificaremos tu comprobante de pago</p>
                  <p class="text" style="margin-bottom: 8px;">2. Te contactaremos por WhatsApp para confirmar</p>
                  <p class="text" style="margin-bottom: 0;">3. Prepararemos tu delicioso ceviche 🦐</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
              </div>
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
    customerEmail?: string;
    items: Array<{ cevicheType: string; quantity: number; price: number }>;
    total: number;
    deliveryMethod: string;
    scheduledDate: string;
    notes?: string;
    paymentProofUrl?: string;
  }
): Promise<void> {
  const adminEmail = process.env.SALES_EMAIL || SALES_EMAIL;

  const itemsHtml = orderDetails.items
    .map(item => `
      <div class="order-item">
        <div>
          <span class="item-qty">${item.quantity}x</span>
          <span class="item-name">${item.cevicheType}</span>
        </div>
        <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `)
    .join('');

  const totalItems = orderDetails.items.reduce((sum, item) => sum + item.quantity, 0);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `🚨 Nuevo pedido #${orderDetails.orderId.slice(-8)} - ${totalItems} ceviches - ${formatCurrency(orderDetails.total)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                <div class="header-icon">🚨</div>
                <h1>¡Nuevo Pedido!</h1>
                <p>#${orderDetails.orderId.slice(-8)} • ${formatCurrency(orderDetails.total)}</p>
              </div>
              <div class="content">
                <div class="card card-orange">
                  <p class="card-title">👤 Información del cliente</p>
                  <div class="info-row">
                    <span class="info-label">Nombre</span>
                    <span class="info-value">${orderDetails.customerName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value" style="color: #0d9488;">
                      <a href="https://wa.me/${orderDetails.customerPhone.replace(/[^0-9]/g, '')}" style="color: #0d9488; text-decoration: none;">
                        ${orderDetails.customerPhone} 📱
                      </a>
                    </span>
                  </div>
                  ${orderDetails.customerEmail ? `
                    <div class="info-row">
                      <span class="info-label">Email</span>
                      <span class="info-value">${orderDetails.customerEmail}</span>
                    </div>
                  ` : ''}
                </div>

                <div class="card card-teal">
                  <p class="card-title">📅 Fecha programada</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #0f766e;">
                    ${formatDate(orderDetails.scheduledDate)}
                  </p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
                    Entrega: ${orderDetails.deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber Flash'}
                  </p>
                </div>

                <div class="card">
                  <p class="card-title">🦐 Pedido (${totalItems} ${totalItems === 1 ? 'ceviche' : 'ceviches'})</p>
                  ${itemsHtml}
                  <div class="total-row">
                    <span class="total-label">Total a cobrar</span>
                    <span class="total-amount">${formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>

                ${orderDetails.notes ? `
                  <div class="notes-box">
                    <p><strong>📝 Notas del cliente:</strong></p>
                    <p style="margin-top: 8px;">${orderDetails.notes}</p>
                  </div>
                ` : ''}

                ${orderDetails.paymentProofUrl ? `
                  <div class="card">
                    <p class="card-title">💳 Comprobante de pago</p>
                    <p class="text">
                      <a href="${orderDetails.paymentProofUrl}" class="link" target="_blank">Ver comprobante →</a>
                    </p>
                  </div>
                ` : ''}

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${APP_URL}/admin/orders" class="button">Gestionar pedido</a>
                </div>
              </div>
              <div class="footer">
                <p>Notificación automática de Ceviche de mi Tata</p>
              </div>
            </div>
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${baseStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="header-icon">🔐</div>
                <h1>Ceviche de mi Tata</h1>
                <p>Restablecer contraseña</p>
              </div>
              <div class="content">
                <h2 class="greeting">Hola ${name},</h2>
                <p class="text">Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p class="text">Haz clic en el siguiente botón para crear una nueva contraseña:</p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                </div>

                <div class="card">
                  <p class="card-title">¿No funciona el botón?</p>
                  <p class="text" style="margin-bottom: 8px;">Copia y pega este enlace en tu navegador:</p>
                  <p class="link">${resetUrl}</p>
                </div>

                <div class="warning-box">
                  <p><strong>⚠️ Este enlace expirará en 1 hora.</strong></p>
                </div>

                <div class="divider"></div>

                <p class="text" style="color: #94a3b8; font-size: 13px;">
                  Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no será modificada.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ceviche de mi Tata. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  });
}
