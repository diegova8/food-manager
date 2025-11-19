# Email Sending Endpoint Usage

## Endpoint Details

**URL**: `POST /api/send-email`
**From Address**: `noreply@mail.cevichedemitata.app`

## Request Format

```typescript
{
  email: string;      // Recipient email address (required)
  subject: string;    // Email subject (required)
  html: string;       // HTML email body (required)
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "resend-email-id-here"
  }
}
```

### Error Responses

**400 - Validation Error**
```json
{
  "success": false,
  "error": "Email is required and must be a valid string"
}
```

**405 - Method Not Allowed**
```json
{
  "success": false,
  "error": "Method not allowed"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Failed to send email"
}
```

## Usage Examples

### Using the API Service (Frontend)

```typescript
import { api } from './services/api';

// Simple text email
await api.sendEmail({
  email: 'customer@example.com',
  subject: 'Welcome to Ceviche de mi Tata!',
  html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>'
});

// Rich HTML email
await api.sendEmail({
  email: 'customer@example.com',
  subject: 'Order Confirmation',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Your order has been received and is being processed.</p>
            <p>Order ID: #12345</p>
          </div>
        </div>
      </body>
    </html>
  `
});
```

### Using Fetch API Directly

```typescript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email</p>'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Email sent! ID:', result.data.id);
} else {
  console.error('Failed to send email:', result.error);
}
```

### Using cURL

```bash
curl -X POST http://localhost:5173/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1><p>This is a test.</p>"
  }'
```

## Validation Rules

1. **Email**:
   - Must be provided
   - Must be a valid string
   - Must match basic email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

2. **Subject**:
   - Must be provided
   - Must be a valid string

3. **HTML**:
   - Must be provided
   - Must be a valid string
   - Can contain full HTML markup

## Example: Sending Order Confirmation

```typescript
async function sendOrderConfirmation(orderDetails: {
  customerEmail: string;
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  const itemsList = orderDetails.items
    .map(item => `<li>${item.quantity}x ${item.name} - $${item.price}</li>`)
    .join('');

  try {
    const result = await api.sendEmail({
      email: orderDetails.customerEmail,
      subject: `Order Confirmation #${orderDetails.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .content {
                padding: 20px;
                background-color: #f9f9f9;
              }
              .order-details {
                background-color: white;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
              }
              .total {
                font-size: 20px;
                font-weight: bold;
                color: #2563eb;
                text-align: right;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🦐 Ceviche de mi Tata</h1>
            </div>
            <div class="content">
              <h2>Order Confirmed!</h2>
              <p>Thank you for your order. We're preparing your delicious ceviche!</p>
              <div class="order-details">
                <h3>Order #${orderDetails.orderId}</h3>
                <ul>
                  ${itemsList}
                </ul>
                <div class="total">Total: $${orderDetails.total}</div>
              </div>
              <p>We'll contact you soon via WhatsApp for delivery coordination.</p>
            </div>
          </body>
        </html>
      `
    });

    console.log('Order confirmation sent!', result.data.id);
    return result;
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    throw error;
  }
}
```

## Error Handling

Always wrap email sending in try-catch blocks:

```typescript
try {
  await api.sendEmail({
    email: 'customer@example.com',
    subject: 'Test',
    html: '<p>Test</p>'
  });
  console.log('Email sent successfully!');
} catch (error) {
  if (error instanceof Error) {
    console.error('Email error:', error.message);
  }
  // Handle error appropriately (show toast, log, etc.)
}
```

## Best Practices

1. **Validate email on frontend** before sending to API
2. **Use HTML templates** for consistent styling
3. **Include plain text alternative** for email clients that don't support HTML
4. **Test emails** in different email clients
5. **Keep HTML simple** - avoid complex CSS that email clients may not support
6. **Include unsubscribe links** for marketing emails
7. **Rate limit** email sending to prevent abuse

## Notes

- Emails are sent from `noreply@mail.cevichedemitata.app`
- Make sure this domain is verified in your Resend account
- The endpoint uses the `RESEND_API_KEY` environment variable
- No authentication required (consider adding auth for production use)
