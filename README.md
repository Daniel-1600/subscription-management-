# 🚀 Subscription Management Dashboard

A comprehensive subscription management platform built with **Go (WebSocket backend)** and **Vite + TypeScript (frontend)** featuring a beautiful landing page and powerful dashboard.

## ✨ Features

### 🏠 **Landing Page**

- **Modern Design**: Beautiful hero section with animated elements
- **Feature Showcase**: Comprehensive overview of platform capabilities
- **Pricing Plans**: Three-tier pricing structure with feature comparison
- **Responsive**: Mobile-first design that works on all devices
- **Interactive**: Smooth animations and hover effects

### 📊 **Dashboard Analytics**

- **Real-time Metrics**: Live revenue, subscriber count, and churn tracking
- **Interactive Charts**: Revenue trends and subscription status distribution
- **Key Performance Indicators**: ARPU, trial users, and daily signups
- **WebSocket Integration**: Live updates every 5 seconds

### 👥 **Subscription Management**

- **CRUD Operations**: Create, read, update, delete subscriptions
- **Advanced Search**: Filter by status, search by name/email
- **Pagination**: Efficient handling of large datasets
- **Bulk Operations**: Manage multiple subscriptions at once

### 💼 **Subscription Plans**

- **Flexible Plans**: Support for multiple billing cycles (monthly/yearly)
- **Feature Management**: Define features per plan
- **Pricing Tiers**: Starter ($29), Professional ($99), Enterprise ($299)

## 🎨 Pages

### Landing Page (`/landing.html`)

- Hero section with animated typing effect
- Features overview with 6 key capabilities
- Pricing comparison table
- Call-to-action sections
- Professional footer

### Dashboard (`/index.html`)

- Real-time analytics overview
- Revenue and user charts
- Subscription management table
- Add/edit subscription modal

## 🛠 Tech Stack

### Backend

- **Go 1.21+** - High-performance backend
- **Gorilla WebSocket** - Real-time communication
- **Gorilla Mux** - HTTP routing
- **CORS** - Cross-origin resource sharing

### Frontend

- **Vite** - Fast development and building
- **TypeScript** - Type-safe JavaScript
- **Chart.js** - Beautiful charts and graphs
- **Font Awesome** - Professional icons
- **Modern CSS** - Custom properties and animations

## 🚀 Getting Started

### Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd subscription-dashboard
   ```

2. **Start the Backend**

   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```

   The API server will start on `http://localhost:8080`

3. **Start the Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The development server will start on `http://localhost:5174`

4. **Access the Application**
   - **Landing Page**: `http://localhost:5174/landing.html`
   - **Dashboard**: `http://localhost:5174/index.html`

## 📡 API Endpoints

### Subscriptions

- `GET /api/subscriptions` - List subscriptions (with pagination)
- `GET /api/subscriptions/{id}` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/{id}` - Update subscription
- `DELETE /api/subscriptions/{id}` - Delete subscription

### Plans

- `GET /api/plans` - List all subscription plans

### Analytics

- `GET /api/analytics` - Get real-time analytics data

### WebSocket

- `ws://localhost:8080/ws` - Real-time data stream

## 📊 Sample Data

The application comes with 100 sample subscriptions featuring:

- Realistic user data (names, emails)
- Multiple subscription statuses (active, trial, cancelled, expired)
- Various plans (Basic, Pro, Enterprise)
- Different billing cycles (monthly, yearly)
- Revenue and analytics calculations

## 🎨 UI Components

### Landing Page Components

- **Hero Section**: Animated title with call-to-action buttons
- **Dashboard Preview**: 3D-transformed preview of the actual dashboard
- **Feature Cards**: Six key feature highlights with icons
- **Pricing Cards**: Three-tier pricing with popular badge
- **Navigation**: Sticky navigation with mobile menu

### Dashboard Components

- **Analytics Cards**: Six key metrics with trend indicators
- **Charts**: Line chart for revenue, doughnut chart for status distribution
- **Data Table**: Sortable, searchable subscription list
- **Modal Forms**: Add/edit subscription with validation
- **Real-time Status**: WebSocket connection indicator

## 🔧 Customization

### Adding New Metrics

1. Update the `Analytics` struct in `backend/main.go`
2. Modify the calculation in `calculateAnalytics()` function
3. Add new metric card in `index.html`
4. Update the TypeScript interface in `src/main.tsx`

### Styling

- Modify CSS variables in `src/dashboard.css` for dashboard
- Update `src/landing.css` for landing page customization
- All colors, fonts, and spacing use CSS custom properties

### Plans and Pricing

- Update the `plans` array in `backend/main.go`
- Modify pricing cards in `landing.html`
- Adjust plan options in the dashboard modal

## 🔄 Real-time Features

The dashboard includes several real-time features:

1. **Live Analytics**: Revenue, user count, and metrics update every 5 seconds
2. **Connection Status**: Visual indicator of WebSocket connection
3. **Auto-reconnect**: Automatic reconnection on connection loss
4. **Live Charts**: Charts update smoothly with new data points

## 📱 Responsive Design

Both pages are fully responsive and include:

- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly buttons and navigation
- Optimized typography for all screen sizes

## 🎯 Use Cases

Perfect for:

- **SaaS Businesses**: Manage recurring subscriptions
- **Subscription Services**: Track customer lifecycle
- **Revenue Analytics**: Monitor business growth
- **Customer Management**: Handle billing and support
- **Business Intelligence**: Data-driven decision making

## 🔐 Security Features

- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Server-side validation for all endpoints
- **Error Handling**: Graceful error handling and user feedback
- **WebSocket Security**: Origin validation for WebSocket connections

## 📈 Performance

- **Fast Backend**: Go's high-performance HTTP server
- **Efficient Frontend**: Vite's optimized build process
- **Real-time Updates**: WebSocket for instant data synchronization
- **Optimized Charts**: Chart.js with performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Font Awesome](https://fontawesome.com/) for professional icons
- [Vite](https://vitejs.dev/) for fast development experience
- [Gorilla Toolkit](https://www.gorillatoolkit.org/) for Go web utilities

---

**Start managing your subscriptions like a pro!** 🚀
