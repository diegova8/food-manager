# Gestión de Producción y Venta de Ceviches

Aplicación web interactiva en React/TypeScript para gestionar la producción y venta de ceviches.

## Características

### 1. Matriz de Costos
- Tabla editable con precios de materia prima
- Cálculo automático del costo de mezcla de jugo por litro
- Campo editable para configurar el markup (multiplicador de precio)
- Todos los valores son editables en tiempo real

### 2. Catálogo de Ceviches
- Muestra las 15 combinaciones posibles:
  - 4 de 1 ingrediente (Pescado, Camarón, Pulpo, Piangua)
  - 6 de 2 ingredientes
  - 4 de 3 ingredientes
  - 1 de 4 ingredientes
- Para cada combinación muestra:
  - Costo de producción
  - Precio sugerido de venta
- Los precios se actualizan automáticamente al cambiar valores en la Matriz de Costos

### 3. Calculadora de Pedidos
- Campos para ingresar cantidad de cada tipo de ceviche
- Cálculo automático de:
  - Costo total de producción
  - Ingresos esperados por venta
  - Ganancia neta
  - Margen de ganancia (%)
- Resumen visual con desglose del pedido

## Tecnologías

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Estado**: React Hooks (useState, useMemo)

## Instalación

```bash
# Navegar al directorio del proyecto
cd ceviche-manager

# Instalar dependencias (ya instaladas)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Uso

1. **Configurar Precios**: En la sección "Matriz de Costos", ajusta los precios de las materias primas según tus costos actuales.

2. **Ajustar Markup**: Configura el multiplicador de precio (por defecto 2.5x) para determinar el precio de venta.

3. **Consultar Catálogo**: Revisa los precios calculados automáticamente para cada tipo de ceviche en la sección "Catálogo de Ceviches".

4. **Calcular Pedidos**: En la "Calculadora de Pedidos", ingresa las cantidades de cada tipo de ceviche y obtén un resumen completo de costos, ingresos y ganancias.

## Fórmulas

### Mezcla de Jugo (por litro)
```
Costo = (500mL × Precio Jugo Limón) +
        (500mL × Precio Jugo Naranja) +
        (33g × Precio Sal) +
        (33g × Precio Azúcar)
```
**Resultado esperado con valores por defecto**: ₡7,217.14/L

### Costo de Producción por Ceviche
```
Costo = Σ(Ingredientes × Precio) +
        (Olores × Precio) +
        (Mezcla Jugo en mL / 1000 × Costo por Litro) +
        Precio Envase
```

### Precio de Venta
```
Precio Venta = Costo de Producción × Markup
```

## Características Técnicas

- ✅ Interfaz responsive
- ✅ Cálculos en tiempo real
- ✅ Formato de moneda en colones (₡)
- ✅ Separadores de miles
- ✅ Redondeo a 2 decimales
- ✅ Componentes reutilizables
- ✅ Tipado estricto con TypeScript
- ✅ Persistencia en memoria durante la sesión

## Estructura del Proyecto

```
ceviche-manager/
├── src/
│   ├── components/
│   │   ├── MatrizCostos.tsx      # Tabla de precios de materia prima
│   │   ├── CatalogoCeviches.tsx  # Catálogo de las 15 combinaciones
│   │   └── CalculadoraPedidos.tsx # Calculadora de pedidos
│   ├── types.ts                   # Definiciones de tipos TypeScript
│   ├── utils.ts                   # Funciones de cálculo y utilidades
│   ├── App.tsx                    # Componente principal
│   └── index.css                  # Estilos de Tailwind CSS
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```
