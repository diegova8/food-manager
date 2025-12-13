import { useState, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import toast from 'react-hot-toast';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: { _id: string; name: string; slug: string };
  pricingType: 'ingredient-based' | 'fixed';
  ingredients?: Array<{ rawMaterialId: string; quantity: number }>;
  olores?: number;
  mezclaJugo?: number;
  fixedPrice?: number;
  servings?: number;
  comboDescription?: string;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
  tags?: string[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  categories: Category[];
}

const RAW_MATERIALS = [
  { id: 'pescado', name: 'Pescado' },
  { id: 'camaron', name: 'Camarón' },
  { id: 'pulpo', name: 'Pulpo' },
  { id: 'piangua', name: 'Piangua' },
];

interface FormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  pricingType: 'ingredient-based' | 'fixed';
  ingredients: Array<{ rawMaterialId: string; quantity: number }>;
  olores: number;
  mezclaJugo: number;
  fixedPrice: number;
  servings: number;
  comboDescription: string;
  imageUrl: string;
  isActive: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

const initialFormData: FormData = {
  name: '',
  slug: '',
  description: '',
  category: '',
  pricingType: 'ingredient-based',
  ingredients: [],
  olores: 80,
  mezclaJugo: 250,
  fixedPrice: 0,
  servings: 0,
  comboDescription: '',
  imageUrl: '',
  isActive: true,
  isAvailable: true,
  displayOrder: 0,
};

export function ProductForm({ isOpen, onClose, onSuccess, product, categories }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category._id,
        pricingType: product.pricingType,
        ingredients: product.ingredients || [],
        olores: product.olores || 80,
        mezclaJugo: product.mezclaJugo || 250,
        fixedPrice: product.fixedPrice || 0,
        servings: product.servings || 0,
        comboDescription: product.comboDescription || '',
        imageUrl: product.imageUrl || '',
        isActive: product.isActive,
        isAvailable: product.isAvailable,
        displayOrder: product.displayOrder,
      });
      setImagePreview(product.imageUrl || null);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: isEditing ? prev.slug : generateSlug(name),
    }));
  };

  const handleIngredientToggle = (rawMaterialId: string) => {
    setFormData(prev => {
      const exists = prev.ingredients.find(i => i.rawMaterialId === rawMaterialId);
      if (exists) {
        return {
          ...prev,
          ingredients: prev.ingredients.filter(i => i.rawMaterialId !== rawMaterialId),
        };
      } else {
        // Default quantities based on ingredient type
        const defaultQuantities: Record<string, number> = {
          pescado: 300,
          camaron: 280,
          pulpo: 280,
          piangua: 50,
        };
        return {
          ...prev,
          ingredients: [
            ...prev.ingredients,
            { rawMaterialId, quantity: defaultQuantities[rawMaterialId] || 100 },
          ],
        };
      }
    });
  };

  const handleIngredientQuantityChange = (rawMaterialId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i =>
        i.rawMaterialId === rawMaterialId ? { ...i, quantity } : i
      ),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (PNG, JPG, GIF, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageUploading(true);

    try {
      const timestamp = Date.now();
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const filename = `product-${timestamp}${ext}`;

      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/client-token',
      });

      setFormData(prev => ({ ...prev, imageUrl: blob.url }));
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir la imagen');
      setImagePreview(formData.imageUrl || null);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('El slug es requerido');
      return;
    }

    if (!formData.category) {
      toast.error('La categoría es requerida');
      return;
    }

    if (formData.pricingType === 'ingredient-based' && formData.ingredients.length === 0) {
      toast.error('Debe seleccionar al menos un ingrediente');
      return;
    }

    if (formData.pricingType === 'fixed' && formData.fixedPrice <= 0) {
      toast.error('El precio fijo debe ser mayor a 0');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        category: formData.category,
        pricingType: formData.pricingType,
        ...(formData.pricingType === 'ingredient-based' && {
          ingredients: formData.ingredients,
          olores: formData.olores,
          mezclaJugo: formData.mezclaJugo,
        }),
        ...(formData.pricingType === 'fixed' && {
          fixedPrice: formData.fixedPrice,
          servings: formData.servings || undefined,
          comboDescription: formData.comboDescription || undefined,
        }),
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
        isAvailable: formData.isAvailable,
        displayOrder: formData.displayOrder,
      };

      if (isEditing && product) {
        await api.updateProduct(product._id, payload);
        toast.success('Producto actualizado');
      } else {
        await api.createProduct(payload);
        toast.success('Producto creado');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Información Básica</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej: Ceviche de Camarón"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                placeholder="ceviche-camaron"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Descripción opcional del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Precio *
              </label>
              <select
                value={formData.pricingType}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricingType: e.target.value as 'ingredient-based' | 'fixed'
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="ingredient-based">Basado en ingredientes</option>
                <option value="fixed">Precio fijo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ingredient-based pricing */}
        {formData.pricingType === 'ingredient-based' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Ingredientes</h3>

            <div className="grid grid-cols-2 gap-4">
              {RAW_MATERIALS.map(material => {
                const ingredient = formData.ingredients.find(i => i.rawMaterialId === material.id);
                const isSelected = !!ingredient;

                return (
                  <div key={material.id} className="flex items-center gap-3 p-3 border rounded-xl">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleIngredientToggle(material.id)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="flex-1 text-sm font-medium">{material.name}</span>
                    {isSelected && (
                      <input
                        type="number"
                        value={ingredient?.quantity || 0}
                        onChange={(e) => handleIngredientQuantityChange(material.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="g"
                        min={0}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Olores (g)
                </label>
                <input
                  type="number"
                  value={formData.olores}
                  onChange={(e) => setFormData(prev => ({ ...prev, olores: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mezcla de Jugo (ml)
                </label>
                <input
                  type="number"
                  value={formData.mezclaJugo}
                  onChange={(e) => setFormData(prev => ({ ...prev, mezclaJugo: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fixed pricing */}
        {formData.pricingType === 'fixed' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Precio Fijo (Combo)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (₡) *
                </label>
                <input
                  type="number"
                  value={formData.fixedPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixedPrice: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={0}
                  step={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porciones (personas)
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Combo
              </label>
              <textarea
                value={formData.comboDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, comboDescription: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ej: Incluye 5 ceviches de pescado, 5 de camarón..."
              />
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Configuración</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min={0}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Activo</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Disponible</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen <span className="text-gray-400 font-normal">(opcional)</span>
            </label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={`w-24 h-24 object-cover rounded-xl border-2 border-gray-200 ${imageUploading ? 'opacity-50' : ''}`}
                />
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                {!imageUploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Subir imagen
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving || imageUploading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} disabled={imageUploading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default ProductForm;
