import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb';
import { Config } from '../lib/models';
import { verifyAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

      return res.status(200).json({
        success: true,
        config: {
          rawMaterials: config.rawMaterials,
          markup: config.markup,
          customPrices: config.customPrices
        }
      });
    }

    // PUT - Actualizar configuración (requiere autenticación)
    if (req.method === 'PUT') {
      try {
        verifyAuth(req);
      } catch (error) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }

      const { rawMaterials, markup, customPrices } = req.body;

      // Validar inputs
      if (!rawMaterials || !markup) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      // Validar que los precios sean números positivos
      const validatePrices = (prices: any) => {
        return Object.values(prices).every((price) => {
          return typeof price === 'number' && price >= 0 && isFinite(price);
        });
      };

      if (!validatePrices(rawMaterials)) {
        return res.status(400).json({
          error: 'Invalid raw material prices'
        });
      }

      if (typeof markup !== 'number' || markup <= 0 || !isFinite(markup)) {
        return res.status(400).json({
          error: 'Invalid markup value'
        });
      }

      if (customPrices && !validatePrices(customPrices)) {
        return res.status(400).json({
          error: 'Invalid custom prices'
        });
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

      return res.status(200).json({
        success: true,
        config: {
          rawMaterials: config.rawMaterials,
          markup: config.markup,
          customPrices: config.customPrices
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Config error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
