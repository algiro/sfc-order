# SFC Order Management System

A modern, mobile-optimized restaurant order management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🍽️ Three Main Sections

1. **Tomar (Take Orders)** - For waiters to take new orders
   - Table selection (1-20)
   - Waiter assignment
   - Menu browsing by categories (Cafés, Té, Bebidas, Tostas, Arepas)
   - Item customization with predefined and custom options
   - Order confirmation and sending

2. **Lista (Order List)** - For kitchen staff to manage orders
   - View confirmed orders chronologically
   - Update item status (To Prepare → Preparing → Prepared)
   - Detailed order view with customizations

3. **Mesas (Tables)** - Overview of all tables
   - Active table status
   - Total amounts per table
   - Order history per table

### 🔄 State Machine Management

**Order Status Flow:**
- To Confirm → Confirmed → Prepared
- To Confirm → Canceled
- Confirmed → Modified → Confirmed
- Confirmed → Canceled

**Item Status Flow:**
- To Prepare → Preparing → Prepared
- To Prepare → Canceled
- Preparing → Canceled

### 📱 Mobile-First Design

- Large, touch-friendly buttons
- Optimized for mobile devices
- Quick navigation between sections
- Intuitive user interface for fast order taking

### 🌐 Multi-language Support

- Spanish (default)
- English
- Easy language switching

### 💾 Lightweight Persistence

- Local storage using Zustand persist middleware
- Customizable for future database integration
- Order history and user preferences

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sfc-order
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

#### Development
```bash
docker-compose --profile dev up --build
```

#### Production
```bash
docker-compose up --build
```

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React components
│   ├── TomarSection.tsx  # Order taking interface
│   ├── ListaSection.tsx  # Kitchen orders list
│   ├── MesasSection.tsx  # Tables overview
│   ├── MenuCategoryGrid.tsx
│   ├── MenuItemGrid.tsx
│   ├── ItemCustomization.tsx
│   ├── OrderSummary.tsx
│   └── OrderDetails.tsx
├── store/
│   └── useAppStore.ts    # Zustand state management
├── types/
│   └── index.ts          # TypeScript definitions
└── data/
    ├── menuData.cjs      # Menu data
    └── menuAdapter.ts    # Menu data adapter
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Docker** - Containerization

## Menu Structure

The system supports 5 menu categories:

1. **Cafés** - Coffee drinks with customizations (milk types, temperature, etc.)
2. **Té e Infusiones** - Teas and herbal infusions
3. **Bebidas** - Beverages (juices, soft drinks, etc.)
4. **Tostas** - Toast with various toppings
5. **Arepas** - Venezuelan corn cakes with fillings

## Default Customizations

- **Cafés**: descafeinado, con avena, con soja, con almendra, sin lactosa, oscuro, muy caliente, clarito, no tan caliente, sin espuma, mucha espuma
- **Té**: con miel, con limón, muy caliente, tibio, sin azúcar, con stevia
- **Bebidas**: con hielo, sin hielo, con limón, muy frío, temperatura ambiente
- **Tostas**: sin gluten, más tostada, menos tostada, sin tomate, extra aguacate, sin cebolla
- **Arepas**: sin queso, extra queso, sin cebolla, más relleno, menos sal, bien caliente

## Usage Workflow

### For Waiters:
1. Select "TOMAR PEDIDOS"
2. Choose table number (1-20)
3. Select waiter name
4. Browse menu categories
5. Select items and add customizations
6. Review order summary
7. Confirm and send order

### For Kitchen Staff:
1. Select "LISTA DE PEDIDOS"
2. View confirmed orders by timestamp
3. Open order details
4. Update item status as preparation progresses
5. Mark items as prepared when ready

### For Management:
1. Select "MESAS" to view table overview
2. See active tables and totals
3. Review order history per table
4. Monitor restaurant activity

## State Management

The application uses Zustand for state management with the following key features:

- **Persistent Storage**: Orders and settings saved to localStorage
- **Real-time Updates**: State changes reflect immediately across components
- **Type Safety**: Full TypeScript support
- **Lightweight**: Minimal overhead compared to Redux

## Customization

The system is designed to be easily customizable:

- **Menu Items**: Modify `src/data/menuData.cjs`
- **Default Customizations**: Update `DEFAULT_CUSTOMIZATIONS` in `menuAdapter.ts`
- **Styling**: Customize Tailwind classes in `globals.css`
- **Languages**: Add new language support in types and components
- **Users**: Modify default users in `useAppStore.ts`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

### Testing

A separate test project will be created to test application functionality comprehensively.

## License

This project is proprietary software for restaurant management.

## Support

For support and customization requests, please contact the development team.