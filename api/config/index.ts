import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Config } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();

    // GET - Obtener configuración (público, para el menú)
    if (req.method === 'GET') {
      let config = await Config.findOne();

      // Si no existe configuración, crear una por defecto
      if (!config) {
        config = await Config.create({
          rawMaterials: {
            pescado: 7,
            camaron: 10.5,
            pulpo: 17,
            piangua: 70,
            olores: 2,
            jugoLimon: 1.5,
            jugoNaranja: 1.1,
            sal: 0.84,
            azucar: 0.74,
            envase: 160
          },
          markup: 2.5,
          customPrices: {
            "pescado": 7000,
            "camaron": 10000,
            "pulpo": 14000,
            "piangua": 11000,
            "pescado-camaron": 9000,
            "pescado-pulpo": 11000,
            "pescado-piangua": 9000,
            "camaron-pulpo": 12000,
            "camaron-piangua": 10000,
            "pulpo-piangua": 12000,
            "pescado-camaron-pulpo": 11000,
            "pescado-camaron-piangua": 10000,
            "pescado-pulpo-piangua": 11000,
            "camaron-pulpo-piangua": 12000,
            "pescado-camaron-pulpo-piangua": 12000
          }
        });
      }

      return successResponse(res, {
        rawMaterials: config.rawMaterials,
        markup: config.markup,
        customPrices: config.customPrices
      });
    }

    // PUT - Actualizar configuración (requiere autenticación de admin)
    if (req.method === 'PUT') {
      let payload;
      try {
        payload = verifyAuth(req);
      } catch (error) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      // Verificar que el usuario sea administrador
      if (!payload.isAdmin) {
        return errorResponse(res, 'Admin access required', 403);
      }

      const { rawMaterials, markup, customPrices } = req.body;

      // Validar inputs
      if (!rawMaterials || !markup) {
        return errorResponse(res, 'Missing required fields', 400);
      }

      // Validar que los precios sean números positivos
      const validatePrices = (prices: Record<string, number>) => {
        return Object.values(prices).every((price) => {
          return typeof price === 'number' && price >= 0 && isFinite(price);
        });
      };

      if (!validatePrices(rawMaterials)) {
        return errorResponse(res, 'Invalid raw material prices', 400);
      }

      if (typeof markup !== 'number' || markup <= 0 || !isFinite(markup)) {
        return errorResponse(res, 'Invalid markup value', 400);
      }

      if (customPrices && !validatePrices(customPrices)) {
        return errorResponse(res, 'Invalid custom prices', 400);
      }

      // Actualizar o crear configuración
      let config = await Config.findOne();

      if (!config) {
        config = await Config.create({
          rawMaterials,
          markup,
          customPrices: customPrices || {}
        });
      } else {
        config.rawMaterials = rawMaterials;
        config.markup = markup;
        config.customPrices = customPrices || config.customPrices;
        config.updatedAt = new Date();
        await config.save();
      }

      return successResponse(res, {
        rawMaterials: config.rawMaterials,
        markup: config.markup,
        customPrices: config.customPrices
      }, 'Configuration updated successfully');
    }

    return errorResponse(res, 'Method not allowed', 405);
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error : 'Internal server error', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({
    maxRequests: 30,
    windowMs: 60 * 1000 // 30 per minute
  })
)(handler);
