import type { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../lib/mongodb.js';
import { Product, Category, RawMaterial, Config } from '../lib/models.js';
import { verifyAuth } from '../lib/auth.js';
import { compose, withCORS, withSecurityHeaders, withRateLimit } from '../middleware/index.js';
import { successResponse, errorResponse } from '../lib/responses.js';
import { updateProductSchema } from '../schemas/product.js';

// Calculate product cost based on ingredients
async function calculateProductCost(
  ingredients: Array<{ rawMaterialId: string; quantity: number }>
): Promise<number> {
  const rawMaterialDocs = await RawMaterial.find({ isActive: true }).lean();
  const priceMap: Record<string, number> = {};

  for (const rm of rawMaterialDocs) {
    priceMap[rm._id.toString()] = rm.price;
    priceMap[rm.slug] = rm.price;
  }

  let costoProd = 0;
  for (const ingredient of ingredients) {
    const price = priceMap[ingredient.rawMaterialId] || 0;
    costoProd += ingredient.quantity * price;
  }

  return costoProd;
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return errorResponse(res, 'Product ID is required', 400);
  }

  await connectDB();

  // GET - Get single product (public)
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id)
        .populate('category', 'name slug')
        .populate('includedItems.productId', 'name slug')
        .lean();

      if (!product) {
        return errorResponse(res, 'Producto no encontrado', 404);
      }

      return successResponse(res, { product });
    } catch (error) {
      console.error('Error fetching product:', error);
      return errorResponse(res, 'Error al obtener el producto', 500);
    }
  }

  // PUT - Update product (admin only)
  if (req.method === 'PUT') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      const validation = updateProductSchema.safeParse(req.body);
      if (!validation.success) {
        return errorResponse(res, validation.error.errors[0].message, 400);
      }

      const updateData = validation.data;

      // Check for duplicate slug if updating slug
      if (updateData.slug) {
        const existingProduct = await Product.findOne({
          slug: updateData.slug,
          _id: { $ne: id }
        });
        if (existingProduct) {
          return errorResponse(res, 'Ya existe un producto con ese slug', 400);
        }
      }

      // Verify category exists if updating category
      if (updateData.category) {
        const category = await Category.findById(updateData.category);
        if (!category) {
          return errorResponse(res, 'Categoría no encontrada', 404);
        }
      }

      // Validate included items if updating combo
      if (updateData.includedItems?.length) {
        for (const item of updateData.includedItems) {
          const linkedProduct = await Product.findById(item.productId);
          if (!linkedProduct) {
            return errorResponse(res, `Producto incluido no encontrado: ${item.productId}`, 400);
          }
          // Prevent self-reference
          if (item.productId === id) {
            return errorResponse(res, 'Un producto no puede incluirse a sí mismo', 400);
          }
        }
      }

      // Get current product to check pricing type
      const currentProduct = await Product.findById(id).lean();
      if (!currentProduct) {
        return errorResponse(res, 'Producto no encontrado', 404);
      }

      // Determine final pricing type
      const finalPricingType = updateData.pricingType || currentProduct.pricingType;

      // Recalculate prices if ingredients changed or pricing type changed
      let costoProd = currentProduct.costoProd;
      let precioSugerido = currentProduct.precioSugerido || currentProduct.precioVenta;
      let precioVenta = currentProduct.precioVenta;

      if (finalPricingType === 'ingredient-based') {
        // If ingredients are being updated, recalculate
        if (updateData.ingredients) {
          costoProd = await calculateProductCost(updateData.ingredients);
          costoProd = Math.round(costoProd);

          const config = await Config.findOne().lean();
          const markup = config?.markup || 2.5;

          precioSugerido = Math.round(costoProd * markup);
        }

        // Use custom price if provided, otherwise keep current or use suggested
        if (updateData.precioVenta !== undefined) {
          precioVenta = Math.round(updateData.precioVenta);
        } else if (updateData.ingredients) {
          // If ingredients changed but no custom price, update to suggested
          precioVenta = precioSugerido;
        }
      } else if (finalPricingType === 'fixed') {
        // Use fixed price
        if (updateData.fixedPrice !== undefined) {
          precioVenta = updateData.fixedPrice;
          precioSugerido = updateData.fixedPrice;
          costoProd = 0;
        }
      }

      const product = await Product.findByIdAndUpdate(
        id,
        {
          ...updateData,
          costoProd,
          precioSugerido,
          precioVenta,
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('category', 'name slug')
        .populate('includedItems.productId', 'name slug')
        .lean();

      if (!product) {
        return errorResponse(res, 'Producto no encontrado', 404);
      }

      return successResponse(res, { product }, 'Producto actualizado exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error updating product:', error);
      return errorResponse(res, 'Error al actualizar el producto', 500);
    }
  }

  // DELETE - Delete product (admin only)
  if (req.method === 'DELETE') {
    try {
      const payload = verifyAuth(req);
      if (!payload.isAdmin) {
        return errorResponse(res, 'Unauthorized - Admin access required', 403);
      }

      // Check if product is used in any combo
      const usedInCombo = await Product.findOne({
        'includedItems.productId': id
      });
      if (usedInCombo) {
        return errorResponse(
          res,
          `No se puede eliminar porque está incluido en el combo "${usedInCombo.name}"`,
          400
        );
      }

      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return errorResponse(res, 'Producto no encontrado', 404);
      }

      return successResponse(res, { deleted: true }, 'Producto eliminado exitosamente');
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse(res, 'Unauthorized', 401);
      }
      console.error('Error deleting product:', error);
      return errorResponse(res, 'Error al eliminar el producto', 500);
    }
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default compose(
  withCORS,
  withSecurityHeaders,
  withRateLimit({ maxRequests: 30, windowMs: 60 * 1000 })
)(handler);
