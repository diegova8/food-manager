import { useState, useMemo, useEffect } from 'react';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';

export interface RawMaterial {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  price: number;
  unit: 'g' | 'ml' | 'unit';
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

interface IngredientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  rawMaterials: RawMaterial[];
  alreadySelected: string[];
}

const UNIT_LABELS: Record<string, string> = {
  g: 'gramos',
  ml: 'mililitros',
  unit: 'unidades',
};

export function IngredientSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  rawMaterials,
  alreadySelected,
}: IngredientSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(alreadySelected));

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(alreadySelected));
      setSearch('');
    }
  }, [isOpen, alreadySelected]);

  const filteredMaterials = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return rawMaterials.filter(m => m.isActive);

    return rawMaterials.filter(
      m => m.isActive && (
        m.name.toLowerCase().includes(query) ||
        m.slug.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      )
    );
  }, [rawMaterials, search]);

  const handleToggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allVisible = filteredMaterials.map(m => m._id);
    setSelected(prev => {
      const next = new Set(prev);
      allVisible.forEach(id => next.add(id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    const allVisible = new Set(filteredMaterials.map(m => m._id));
    setSelected(prev => {
      const next = new Set(prev);
      allVisible.forEach(id => next.delete(id));
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onClose();
  };

  const newlySelected = Array.from(selected).filter(id => !alreadySelected.includes(id));
  const removedFromSelection = alreadySelected.filter(id => !selected.has(id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar Ingredientes"
      description="Selecciona los ingredientes para este producto"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ingredientes..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {selected.size} seleccionados
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Seleccionar todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-gray-600 hover:text-gray-700 font-medium"
            >
              Deseleccionar
            </button>
          </div>
        </div>

        {/* Ingredient list */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
          {filteredMaterials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron ingredientes
            </div>
          ) : (
            filteredMaterials.map(material => {
              const isSelected = selected.has(material._id);
              const isNew = !alreadySelected.includes(material._id);

              return (
                <label
                  key={material._id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-orange-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(material._id)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />

                  {/* Icon or image */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {material.imageUrl ? (
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-full h-full object-cover"
                      />
                    ) : material.icon ? (
                      <span className="text-xl">{material.icon}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {material.name}
                      </span>
                      {isSelected && isNew && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      ₡{material.price.toLocaleString()}/{material.unit} ({UNIT_LABELS[material.unit]})
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Summary */}
        {(newlySelected.length > 0 || removedFromSelection.length > 0) && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {newlySelected.length > 0 && (
              <span className="text-green-600">
                +{newlySelected.length} nuevos
              </span>
            )}
            {newlySelected.length > 0 && removedFromSelection.length > 0 && (
              <span className="mx-2">·</span>
            )}
            {removedFromSelection.length > 0 && (
              <span className="text-red-600">
                -{removedFromSelection.length} removidos
              </span>
            )}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>
          Confirmar Seleccion
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default IngredientSelectorModal;
