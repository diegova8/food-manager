/**
 * Validation schemas for product and category endpoints
 */

import { z } from 'zod';

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description is too long').optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

export const updateCategorySchema = createCategorySchema.partial();

// Product ingredient schema
const ingredientSchema = z.object({
  rawMaterialId: z.enum(['pescado', 'camaron', 'pulpo', 'piangua']),
  quantity: z.number().positive('Quantity must be positive')
});

// Product included item schema (for combos)
const includedItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

// Base product schema
const baseProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description is too long').optional(),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(50)).max(10).optional()
});

// Ingredient-based product schema (ceviches)
const ingredientBasedProductSchema = baseProductSchema.extend({
  pricingType: z.literal('ingredient-based'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  olores: z.number().positive('Olores must be positive'),
  mezclaJugo: z.number().positive('Mezcla de jugo must be positive')
});

// Fixed price product schema (combos)
const fixedPriceProductSchema = baseProductSchema.extend({
  pricingType: z.literal('fixed'),
  fixedPrice: z.number().positive('Price must be positive'),
  servings: z.number().int().positive('Servings must be a positive integer').optional(),
  comboDescription: z.string().max(1000, 'Combo description is too long').optional(),
  includedItems: z.array(includedItemSchema).optional()
});

// Combined create product schema
export const createProductSchema = z.discriminatedUnion('pricingType', [
  ingredientBasedProductSchema,
  fixedPriceProductSchema
]);

// Update product schema (partial, but pricingType determines required fields)
export const updateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).optional(),
  pricingType: z.enum(['ingredient-based', 'fixed']).optional(),
  ingredients: z.array(ingredientSchema).optional(),
  olores: z.number().positive().optional(),
  mezclaJugo: z.number().positive().optional(),
  fixedPrice: z.number().positive().optional(),
  servings: z.number().int().positive().optional(),
  comboDescription: z.string().max(1000).optional(),
  includedItems: z.array(includedItemSchema).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(50)).max(10).optional()
});

// Raw Material schemas
export const createRawMaterialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  icon: z.string().max(50, 'Icon name is too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative'),
  unit: z.enum(['g', 'ml', 'unit'], { errorMap: () => ({ message: 'Unit must be g, ml, or unit' }) }),
  description: z.string().max(500, 'Description is too long').optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional()
});

export const updateRawMaterialSchema = createRawMaterialSchema.partial();

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateRawMaterialInput = z.infer<typeof createRawMaterialSchema>;
export type UpdateRawMaterialInput = z.infer<typeof updateRawMaterialSchema>;
