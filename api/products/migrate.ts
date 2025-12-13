import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';

// Hardcoded ceviche definitions (from original utils.ts)
const CEVICHES = [
  // Single ingredient
  { id: 'pescado', name: 'Pescado', ingredients: { pescado: 300 } },
  { id: 'camaron', name: 'Camarón', ingredients: { camaron: 280 } },
  { id: 'pulpo', name: 'Pulpo', ingredients: { pulpo: 280 } },
  { id: 'piangua', name: 'Piangua', ingredients: { piangua: 50 } },
  // Two ingredients
  { id: 'pescado-camaron', name: 'Pescado-Camarón', ingredients: { pescado: 150, camaron: 140 } },
  { id: 'pescado-pulpo', name: 'Pescado-Pulpo', ingredients: { pescado: 150, pulpo: 140 } },
  { id: 'pescado-piangua', name: 'Pescado-Piangua', ingredients: { pescado: 275, piangua: 25 } },
  { id: 'camaron-pulpo', name: 'Camarón-Pulpo', ingredients: { camaron: 140, pulpo: 140 } },
  { id: 'camaron-piangua', name: 'Camarón-Piangua', ingredients: { camaron: 255, piangua: 25 } },
  { id: 'pulpo-piangua', name: 'Pulpo-Piangua', ingredients: { pulpo: 255, piangua: 25 } },
  // Three ingredients
  { id: 'pescado-camaron-pulpo', name: 'Pescado-Camarón-Pulpo', ingredients: { pescado: 100, camaron: 90, pulpo: 90 } },
  { id: 'pescado-camaron-piangua', name: 'Pescado-Camarón-Piangua', ingredients: { pescado: 137, camaron: 125, piangua: 18 } },
  { id: 'pescado-pulpo-piangua', name: 'Pescado-Pulpo-Piangua', ingredients: { pescado: 137, pulpo: 125, piangua: 18 } },
  { id: 'camaron-pulpo-piangua', name: 'Camarón-Pulpo-Piangua', ingredients: { camaron: 127, pulpo: 127, piangua: 18 } },
  // Four ingredients
  { id: 'pescado-camaron-pulpo-piangua', name: 'Pescado-Camarón-Pulpo-Piangua', ingredients: { pescado: 75, camaron: 68, pulpo: 68, piangua: 14 } }
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
      categoriesCreated: 0,
      productsCreated: 0,
      productsSkipped: 0,
      errors: [] as string[]
    };

    // Create default categories
    const defaultCategories = [
      {
        name: 'Ceviches',
        slug: 'ceviches',
        description: 'Ceviches individuales frescos preparados al momento',
        displayOrder: 1
      },
      {
        name: 'Combos para Eventos',
        slug: 'combos',
        description: 'Paquetes especiales para fiestas, reuniones familiares y eventos corporativos',
        displayOrder: 2
      }
    ];

    let cevichesCategory;

    for (const catData of defaultCategories) {
      const existingCategory = await Category.findOne({ slug: catData.slug });
      if (existingCategory) {
        if (catData.slug === 'ceviches') {
          cevichesCategory = existingCategory;
        }
        continue;
      }

      const category = await Category.create(catData);
      results.categoriesCreated++;

      if (catData.slug === 'ceviches') {
        cevichesCategory = category;
      }
    }

    if (!cevichesCategory) {
      cevichesCategory = await Category.findOne({ slug: 'ceviches' });
    }

    if (!cevichesCategory) {
      return errorResponse(res, 'Failed to create or find ceviches category', 500);
    }

    // Create products from hardcoded ceviches
    for (let i = 0; i < CEVICHES.length; i++) {
      const ceviche = CEVICHES[i];

      // Check if product already exists
      const existingProduct = await Product.findOne({ slug: ceviche.id });
      if (existingProduct) {
        results.productsSkipped++;
        continue;
      }

      try {
        // Convert ingredients to array format
        const ingredients = Object.entries(ceviche.ingredients).map(([rawMaterialId, quantity]) => ({
          rawMaterialId,
          quantity
        }));

        await Product.create({
          name: ceviche.name,
          slug: ceviche.id,
          description: `Ceviche de ${ceviche.name.toLowerCase()} fresco`,
          category: cevichesCategory._id,
          pricingType: 'ingredient-based',
          ingredients,
          olores: 80,
          mezclaJugo: 250,
          isActive: true,
          isAvailable: true,
          displayOrder: i + 1
        });

        results.productsCreated++;
      } catch (error) {
        results.errors.push(`Failed to create ${ceviche.name}: ${error}`);
      }
    }

    return successResponse(res, {
      message: 'Migration completed',
      results
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return errorResponse(res, 'Unauthorized', 401);
    }
    console.error('Migration error:', error);
    return errorResponse(res, 'Error during migration', 500);
  }
}

export default compose(
  withCORS,
  withSecurityHeaders
)(handler);
