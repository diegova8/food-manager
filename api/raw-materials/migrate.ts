import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { RawMaterial, Config } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

// Default raw materials with their properties
const DEFAULT_RAW_MATERIALS = [
  // Main seafood ingredients (price per gram)
  { name: 'Pescado', slug: 'pescado', icon: '🐟', unit: 'g', description: 'Pescado fresco para ceviche', displayOrder: 1 },
  { name: 'Camarón', slug: 'camaron', icon: '🦐', unit: 'g', description: 'Camarón fresco', displayOrder: 2 },
  { name: 'Pulpo', slug: 'pulpo', icon: '🐙', unit: 'g', description: 'Pulpo fresco', displayOrder: 3 },
  { name: 'Piangua', slug: 'piangua', icon: '🐚', unit: 'g', description: 'Piangua fresca', displayOrder: 4 },

  // Aromatics and seasonings (price per gram)
  { name: 'Olores', slug: 'olores', icon: '🌿', unit: 'g', description: 'Culantro, cebolla, chile dulce', displayOrder: 5 },

  // Juices (price per milliliter)
  { name: 'Jugo de Limón', slug: 'jugoLimon', icon: '🍋', unit: 'ml', description: 'Jugo de limón fresco', displayOrder: 6 },
  { name: 'Jugo de Naranja', slug: 'jugoNaranja', icon: '🍊', unit: 'ml', description: 'Jugo de naranja fresco', displayOrder: 7 },

  // Other seasonings (price per gram)
  { name: 'Sal', slug: 'sal', icon: '🧂', unit: 'g', description: 'Sal de mesa', displayOrder: 8 },
  { name: 'Azúcar', slug: 'azucar', icon: '🍬', unit: 'g', description: 'Azúcar blanca', displayOrder: 9 },

  // Packaging (price per unit)
  { name: 'Envase', slug: 'envase', icon: '📦', unit: 'unit', description: 'Envase desechable para ceviche', displayOrder: 10 },
];

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const payload = verifyAuth(req);
    if (!payload.isAdmin) {
      return errorResponse(res, 'Unauthorized - Admin access required', 403);
    }

    await connectDB();

    const results = {
      created: 0,
      skipped: 0,
      updated: 0,
      errors: [] as string[]
    };

    // Get existing prices from Config if available
    const config = await Config.findOne().lean();
    const existingPrices = config?.rawMaterials || {};

    for (const material of DEFAULT_RAW_MATERIALS) {
      try {
        // Check if material already exists
        const existing = await RawMaterial.findOne({ slug: material.slug });

        // Get price from config or use 0 as default
        const price = existingPrices[material.slug as keyof typeof existingPrices] || 0;

        if (existing) {
          // Update existing material with price from config if it has changed
          if (existing.price !== price && price > 0) {
            await RawMaterial.findByIdAndUpdate(existing._id, { price, updatedAt: new Date() });
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          // Create new material
          await RawMaterial.create({
            ...material,
            price,
            isActive: true
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error con ${material.name}: ${error}`);
      }
    }

    return successResponse(res, {
      message: 'Migración completada',
      results
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    console.error('Migration error:', error);
    return errorResponse(res, 'Error durante la migración', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
