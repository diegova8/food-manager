import { useCart } from '../context/CartContext';

interface CevicheCounterProps {
  id: string;
  name: string;
  price: number;
}

function CevicheCounter({ id, name, price }: CevicheCounterProps) {
  const { getItemQuantity, addItem, removeItem, updateQuantity, getTotalItems } = useCart();
  const quantity = getItemQuantity(id);
  const totalItems = getTotalItems();

  const handleIncrement = () => {
    // Check individual item limit
    if (quantity >= 100) {
      alert('No puedes agregar más de 100 unidades de este ceviche');
      return;
    }

    // Check total cart limit
    if (totalItems >= 100) {
      alert('Has alcanzado el límite máximo de 100 ceviches en total. Para pedidos mayores, por favor contáctanos directamente.');
      return;
    }

    addItem(id, name, price);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      removeItem(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input for typing
    if (value === '') {
      return;
    }

    const numValue = parseInt(value, 10);

    // Validate number
    if (isNaN(numValue)) {
      return;
    }

    // Check limits
    if (numValue < 0) {
      return;
    }

    if (numValue > 100) {
      alert('No puedes agregar más de 100 unidades de este ceviche');
      return;
    }

    // Check if new value would exceed total limit
    const currentTotal = totalItems - quantity;
    if (currentTotal + numValue > 100) {
      alert('Has alcanzado el límite máximo de 100 ceviches en total');
      return;
    }

    updateQuantity(id, numValue);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If input is empty on blur, set to 0
    if (e.target.value === '') {
      updateQuantity(id, 0);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleDecrement}
        disabled={quantity === 0}
        className="w-8 h-8 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label="Disminuir cantidad"
      >
        −
      </button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min="0"
        max="100"
        className="w-16 text-center border-2 border-gray-300 rounded-lg py-1 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Cantidad"
      />

      <button
        onClick={handleIncrement}
        disabled={quantity >= 100 || totalItems >= 100}
        className="w-8 h-8 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}

export default CevicheCounter;
