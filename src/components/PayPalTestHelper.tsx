import { useState, useRef, useEffect } from 'react';
import { PAYPAL_TEST_CARDS, formatCardNumber, copyToClipboard } from '../utils/paypal-test-data';
import type { TestCard } from '../utils/paypal-test-data';

interface PayPalTestHelperProps {
  isVisible: boolean;
  onClose: () => void;
}

interface Position {
  x: number;
  y: number;
}

export function PayPalTestHelper({ isVisible, onClose }: PayPalTestHelperProps) {
  const [selectedCard, setSelectedCard] = useState<TestCard | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) {
      setSelectedCard(null);
    }
  }, [isVisible]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && e.target === e.currentTarget) {
      setIsDragging(true);
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isVisible) return null;

  const handleCopy = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const scenarioGroups = [
    { title: 'Exitosas', emoji: '✅', scenario: 'approved' as const },
    { title: 'Rechazadas', emoji: '❌', scenario: 'declined' as const },
    { title: 'Sin Fondos', emoji: '💳', scenario: 'insufficient_funds' as const },
    { title: 'Expiradas', emoji: '📅', scenario: 'expired' as const },
    { title: 'CVV Inválido', emoji: '🔒', scenario: 'invalid_cvv' as const }
  ];

  return (
    <div
      ref={windowRef}
      className="fixed bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: selectedCard ? '420px' : '380px',
        maxHeight: '600px',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">PayPal Test Cards</h2>
            <p className="text-xs text-purple-100">Drag to move</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedCard ? (
          /* Card Selection View */
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <p className="font-semibold mb-1">Dev Tool</p>
              <p>Select a card to copy test data</p>
            </div>

            {scenarioGroups.map((group) => {
              const cards = PAYPAL_TEST_CARDS.filter(card => card.scenario === group.scenario);
              if (cards.length === 0) return null;

              return (
                <div key={group.scenario}>
                  <h3 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                    <span>{group.emoji}</span>
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedCard(card)}
                        className="w-full p-3 border border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700 group-hover:text-purple-600">
                            {card.name}
                          </span>
                          <span className="text-lg">{card.emoji}</span>
                        </div>
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded block">
                          {formatCardNumber(card.cardNumber)}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Card Details View */
          <div className="space-y-3">
            <button
              onClick={() => setSelectedCard(null)}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Card Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 text-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold">{selectedCard.name}</h3>
                  <p className="text-xs text-slate-300">{selectedCard.description}</p>
                </div>
                <span className="text-2xl">{selectedCard.emoji}</span>
              </div>
            </div>

            {/* Card Number */}
            <div className="bg-slate-50 rounded-lg p-3">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">CARD NUMBER</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1.5">
                  {formatCardNumber(selectedCard.cardNumber)}
                </code>
                <button
                  onClick={() => handleCopy(selectedCard.cardNumber.replace(/\s/g, ''), 'cardNumber')}
                  className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                >
                  {copiedField === 'cardNumber' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">EXPIRY</label>
                <div className="flex items-center gap-1">
                  <code className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1.5">
                    {selectedCard.expiry}
                  </code>
                  <button
                    onClick={() => handleCopy(selectedCard.expiry, 'expiry')}
                    className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                  >
                    {copiedField === 'expiry' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">CVV</label>
                <div className="flex items-center gap-1">
                  <code className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1.5">
                    {selectedCard.cvv}
                  </code>
                  <button
                    onClick={() => handleCopy(selectedCard.cvv, 'cvv')}
                    className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                  >
                    {copiedField === 'cvv' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="bg-slate-50 rounded-lg p-3">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">NAME</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1.5">
                  {selectedCard.cardholderName}
                </code>
                <button
                  onClick={() => handleCopy(selectedCard.cardholderName, 'name')}
                  className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                >
                  {copiedField === 'name' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Billing Address - Compact */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Billing Address</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Address:</span>
                  <button
                    onClick={() => handleCopy(selectedCard.billingAddress.addressLine1, 'address')}
                    className="text-purple-600 hover:text-purple-700 font-mono"
                  >
                    {selectedCard.billingAddress.addressLine1} ⎘
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">City:</span>
                  <button
                    onClick={() => handleCopy(selectedCard.billingAddress.city, 'city')}
                    className="text-purple-600 hover:text-purple-700 font-mono"
                  >
                    {selectedCard.billingAddress.city} ⎘
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">State:</span>
                  <button
                    onClick={() => handleCopy(selectedCard.billingAddress.state, 'state')}
                    className="text-purple-600 hover:text-purple-700 font-mono"
                  >
                    {selectedCard.billingAddress.state} ⎘
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Postal:</span>
                  <button
                    onClick={() => handleCopy(selectedCard.billingAddress.postalCode, 'postal')}
                    className="text-purple-600 hover:text-purple-700 font-mono"
                  >
                    {selectedCard.billingAddress.postalCode} ⎘
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Country:</span>
                  <button
                    onClick={() => handleCopy(selectedCard.billingAddress.country, 'country')}
                    className="text-purple-600 hover:text-purple-700 font-mono"
                  >
                    {selectedCard.billingAddress.country} ⎘
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
