import { useState, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';

type UnitType = 'g' | 'ml' | 'unit';

interface RawMaterial {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  price: number;
  unit: UnitType;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  price: number;
  unit: UnitType;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: FormData = {
  name: '',
  slug: '',
  icon: '',
  imageUrl: '',
  price: 0,
  unit: 'g',
  description: '',
  isActive: true,
  displayOrder: 0,
};

const UNIT_LABELS: Record<UnitType, string> = {
  g: 'gramos (g)',
  ml: 'mililitros (ml)',
  unit: 'unidad',
};

const UNIT_SHORT: Record<UnitType, string> = {
  g: '/g',
  ml: '/ml',
  unit: '/u',
};

export function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<RawMaterial | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRawMaterials();
  }, []);

  const loadRawMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.getRawMaterials(true); // Include inactive
      setRawMaterials(response.data.rawMaterials || []);
    } catch (error) {
      console.error('Error loading raw materials:', error);
      toast.error('Error al cargar las materias primas');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Esto creará las materias primas por defecto con los precios actuales de la configuración. ¿Continuar?')) {
      return;
    }

    try {
      setMigrating(true);
      const response = await api.migrateRawMaterials();
      if (response.success) {
        toast.success(`Migración completada: ${response.data.results.created} creadas, ${response.data.results.updated} actualizadas`);
        loadRawMaterials();
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Error durante la migración');
    } finally {
      setMigrating(false);
    }
  };

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
      slug: editingMaterial ? prev.slug : generateSlug(name),
    }));
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({
      ...initialFormData,
      displayOrder: rawMaterials.length + 1,
    });
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEditModal = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      slug: material.slug,
      icon: material.icon || '',
      imageUrl: material.imageUrl || '',
      price: material.price,
      unit: material.unit,
      description: material.description || '',
      isActive: material.isActive,
      displayOrder: material.displayOrder,
    });
    setImagePreview(material.imageUrl || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMaterial(null);
    setFormData(initialFormData);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (PNG, JPG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageUploading(true);

    try {
      // Upload to Vercel Blob
      const timestamp = Date.now();
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      const filename = `raw-material-${timestamp}${ext}`;

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

    if (formData.price < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon || undefined,
        imageUrl: formData.imageUrl || undefined,
        price: formData.price,
        unit: formData.unit,
        description: formData.description || undefined,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
      };

      if (editingMaterial) {
        await api.updateRawMaterial(editingMaterial._id, payload);
        toast.success('Materia prima actualizada');
      } else {
        await api.createRawMaterial(payload);
        toast.success('Materia prima creada');
      }

      closeModal();
      loadRawMaterials();
    } catch (error) {
      console.error('Error saving raw material:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la materia prima');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (material: RawMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!materialToDelete) return;

    try {
      await api.deleteRawMaterial(materialToDelete._id);
      toast.success('Materia prima eliminada');
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      loadRawMaterials();
    } catch (error) {
      console.error('Error deleting raw material:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la materia prima');
    }
  };

  const toggleActive = async (material: RawMaterial) => {
    try {
      await api.updateRawMaterial(material._id, { isActive: !material.isActive });
      toast.success(material.isActive ? 'Materia prima desactivada' : 'Materia prima activada');
      loadRawMaterials();
    } catch (error) {
      console.error('Error toggling raw material:', error);
      toast.error('Error al actualizar la materia prima');
    }
  };

  const formatPrice = (price: number, unit: UnitType) => {
    return `₡${price.toLocaleString('es-CR')}${UNIT_SHORT[unit]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materias Primas"
        description="Gestiona los ingredientes y sus precios"
        actions={
          <div className="flex gap-2">
            {rawMaterials.length === 0 && (
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {migrating ? 'Migrando...' : 'Importar Materias Primas'}
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Materia Prima
            </button>
          </div>
        }
      />

      {/* Raw Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rawMaterials.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materias primas</h3>
              <p className="text-gray-500 mb-4">Importa las materias primas existentes o crea una nueva</p>
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {migrating ? 'Importando...' : 'Importar Materias Primas'}
              </button>
            </CardContent>
          </Card>
        ) : (
          rawMaterials
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((material) => (
              <Card key={material._id} className={!material.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {material.imageUrl ? (
                        <img
                          src={material.imageUrl}
                          alt={material.name}
                          className="w-12 h-12 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                          {material.icon || '📦'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{material.name}</h3>
                        <code className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{material.slug}</code>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(material)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        material.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {material.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatPrice(material.price, material.unit)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({UNIT_LABELS[material.unit]})
                    </span>
                  </div>

                  {material.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{material.description}</p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t">
                    <button
                      onClick={() => openEditModal(material)}
                      className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(material)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingMaterial ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Ej: Camarón"
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
                placeholder="camaron"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min={0}
                step={0.01}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as UnitType }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="g">Gramos (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unit">Unidad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono (emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="🦐"
                maxLength={4}
              />
            </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Descripción opcional"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">Materia prima activa</span>
            </label>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={closeModal} disabled={saving || imageUploading}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} disabled={imageUploading}>
              {editingMaterial ? 'Guardar Cambios' : 'Crear Materia Prima'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMaterialToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Materia Prima"
        message={`¿Estás seguro de eliminar "${materialToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}

export default RawMaterialsPage;
