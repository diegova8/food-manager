import React from 'react';
import CevicheCounter from './CevicheCounter';
import logo from '../assets/logo.png';
import { formatCurrency } from '../utils';

interface MenuCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  subtitle: string;
  price: number;
  quantity: number;
  onQuantityChange: (id: string, quantity: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  id,
  name,
  image,
  subtitle,
  price,
  quantity,
  onQuantityChange
}) => {
  const handleOrderNow = () => {
    onQuantityChange(id, 1);
  };

  return (
    <>
      {/* Mobile Layout (Horizontal) */}
      <div className="md:hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border-2 border-slate-100 hover:border-orange-300">
        <div className="flex gap-4">
          {/* Circular Image - Left */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-3 border-dashed border-slate-300 shadow-sm overflow-hidden">
              <img
                src={image}
                alt={name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = logo;
                }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content - Right */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Title */}
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-1 line-clamp-2">
                {name}
              </h3>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-bold text-orange-600 whitespace-nowrap">
                {formatCurrency(price)}
              </span>

              {quantity === 0 ? (
                <button
                  onClick={handleOrderNow}
                  aria-label={`Add ${name} to cart`}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold py-2 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 text-sm whitespace-nowrap"
                >
                  + Agregar
                </button>
              ) : (
                <div className="scale-90 origin-right">
                  <CevicheCounter
                    id={id}
                    name={name}
                    price={price}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop Layout (Vertical) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-2 border-slate-100 hover:border-orange-300">
        {/* Circular Image Container */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dashed border-slate-300 shadow-md overflow-hidden">
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = logo;
              }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl md:text-2xl text-slate-900 text-center mb-1">
          {name}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-slate-600 text-center mt-1 mb-3">
          {subtitle}
        </p>

        {/* Price */}
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-orange-600">
            {formatCurrency(price)}
          </span>
        </div>

        {/* Order Button or Counter */}
        {quantity === 0 ? (
          <button
            onClick={handleOrderNow}
            aria-label={`Add ${name} to cart`}
            className="w-full bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold py-3 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            ORDENAR AHORA
          </button>
        ) : (
          <CevicheCounter
            id={id}
            name={name}
            price={price}
          />
        )}
      </div>
    </>
  );
};
