import React from 'react';
import type { CevicheCost } from '../types';
import { formatCurrency } from '../utils';
import logo from '../assets/logo.png';

interface MenuCevichesProps {
  cevicheCosts: CevicheCost[];
  customPrices: { [key: string]: number };
}

const MenuCeviches: React.FC<MenuCevichesProps> = ({ cevicheCosts, customPrices }) => {
  const getFinalPrice = (ceviche: CevicheCost): number => {
    return customPrices[ceviche.ceviche.id] || ceviche.precioVenta;
  };
  const getCevicheEmojis = (cevicheId: string): string => {
    const emojis: string[] = [];
    if (cevicheId.includes('pescado')) emojis.push('🐟');
    if (cevicheId.includes('camaron')) emojis.push('🦐');
    if (cevicheId.includes('pulpo')) emojis.push('🐙');
    if (cevicheId.includes('piangua')) emojis.push('🐚');
    return emojis.join('');
  };

  // Agrupar ceviches por número de ingredientes
  const singleIngredient = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 1;
  });

  const twoIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 2;
  });

  const threeIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 3;
  });

  const fourIngredients = cevicheCosts.filter(c => {
    const count = Object.values(c.ceviche.ingredients).filter(v => v !== undefined).length;
    return count === 4;
  });

  const renderMenuSection = (ceviches: CevicheCost[], title: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 text-blue-800 border-b-2 border-blue-300 pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ceviches.map((c) => (
          <div
            key={c.ceviche.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getCevicheEmojis(c.ceviche.id)}</div>
              <div>
                <div className="font-semibold text-gray-800 text-lg">{c.ceviche.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getFinalPrice(c))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <img src={logo} alt="Ceviche de mi Tata" className="mx-auto h-40 mb-4 rounded-full" />
      </div>

      {renderMenuSection(singleIngredient, 'Ceviches de 1 sabor')}
      {renderMenuSection(twoIngredients, 'Ceviches de 2 sabores')}
      {renderMenuSection(threeIngredients, 'Ceviches de 3 sabores')}
      {renderMenuSection(fourIngredients, 'Ceviche Mixto Full')}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Precios en colones costarricenses (₡)</p>
      </div>
    </div>
  );
};

export default MenuCeviches;
