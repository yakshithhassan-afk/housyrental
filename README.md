# HousyRental - Complete Real Estate Management Platform

## Overview
HousyRental is a comprehensive real estate management platform that combines modern web applications (Next.js), backend APIs (FastAPI), and mobile-friendly design to streamline rental property operations. The system features role-based dashboards, real-time messaging, payment processing, and smart property matching to ensure tenants and property owners connect efficiently.

## Key Features

### Role-Based Management System
- **Owner Dashboard**: Property management, tenant screening, rent collection, analytics
- **Tenant Dashboard**: Property search, application tracking, payment management, messaging
- **Admin Dashboard**: User management, system oversight, property verification, analytics
- **Agent Dashboard**: Property listings, client management, commission tracking

### Web Application - Modern Rental Platform
- **Next.js 15**: Modern web-based rental platform with SSR and API routes
- **Property Search**: Advanced filtering, location-based search, saved searches
- **Real-time Messaging**: In-app chat between tenants and property owners
- **Responsive Design**: Tailwind CSS for mobile-first responsive UI
- **Interactive Maps**: Google Maps integration for property locations
- **Payment Processing**: Stripe integration for rent payments and deposits

### Smart Property Matching Engine
- **Advanced Search**: Multiple filters (price, location, amenities, property type)
- **Saved Properties**: Wishlist functionality for interested properties
- **Application Tracking**: Real-time application status updates
- **Property Analytics**: Market trends, pricing insights, occupancy rates
- **Notification System**: Email and push notifications for important updates

### Mobile-Friendly Features
- **Progressive Web App**: Mobile-optimized experience
- **Touch Interface**: Mobile-first design principles
- **Offline Support**: Service worker for basic offline functionality
- **QR Code Integration**: Property QR codes for easy information access

## Technical Architecture

### Frontend (Next.js + React)
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + React Query for server state
- **Build Tool**: Next.js built-in optimization
- **Authentication**: NextAuth.js + Firebase Auth

### Backend API (Next.js API Routes)
- **Framework**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT tokens + Firebase Auth
- **API Documentation**: OpenAPI/Swagger integration
- **Real-time**: WebSocket support for live messaging
- **File Storage**: Firebase Storage for property images

### Database & Services
- **Primary Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Authentication
- **Real-time Database**: Firebase Firestore for messaging
- **Storage**: Firebase Storage for images and documents
- **Payments**: Stripe API for payment processing
- **Email Service**: SendGrid for transactional emails

### Cloud & Deployment
- **Containerization**: Docker support for all components
- **Orchestration**: Docker Compose for local development
- **Cloud Ready**: Vercel, AWS, Render deployment configs
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Built-in analytics and error tracking

## Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── properties/    # Property CRUD operations
│   │   ├── users/         # User management
│   │   ├── payments/      # Payment processing
│   │   └── messages/      # Messaging system
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── reset/         # Password reset
│   ├── dashboard/         # Dashboard pages
│   │   ├── owner/         # Owner dashboard
│   │   ├── tenant/        # Tenant dashboard
│   │   ├── admin/         # Admin dashboard
│   │   └── agent/         # Agent dashboard
│   ├── properties/        # Property pages
│   │   ├── [id]/          # Property details
│   │   ├── search/        # Property search
│   │   └── compare/       # Property comparison
│   ├── services/          # Services pages
│   ├── about/             # About page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── property/         # Property components
│   ├── dashboard/        # Dashboard components
│   ├── auth/             # Authentication components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication context
│   ├── theme-context.tsx # Theme context
│   └── notification-context.tsx # Notification context
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-properties.ts # Property data hook
│   └── use-messages.ts   # Messaging hook
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase config
│   ├── prisma.ts         # Prisma client
│   ├── stripe.ts         # Stripe configuration
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts          # Database seeding
├── public/              # Static assets
│   ├── images/          # Image assets
│   ├── icons/           # Icon assets
│   └── favicon.ico      # Favicon
├── types/               # TypeScript types
│   ├── auth.ts          # Auth types
│   ├── property.ts      # Property types
│   ├── user.ts          # User types
│   └── api.ts           # API types
├── utils/               # Utility functions
│   ├── helpers.ts       # Helper functions
│   ├── validators.ts    # Input validation
│   └── constants.ts     # App constants
├── .github/             # GitHub workflows
│   └── workflows/       # CI/CD workflows
├── docker/              # Docker configurations
├── docs/                # Documentation
└── tests/               # Test files
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Firebase project
- Stripe account (for payments)

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yakshith123/hospital-.git
cd housyrental
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

4. **Configure Firebase**
   - Create a Firebase project
   - Download Firebase config file
   - Add Firebase credentials to `.env.local`

5. **Configure Stripe**
   - Create a Stripe account
   - Add Stripe keys to `.env.local`

6. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

7. **Run the application**
```bash
npm run dev
```

## User Roles

### Property Owner
- List and manage properties
- Screen and approve tenants
- Collect rent payments
- View property analytics
- Communicate with tenants

### Tenant
- Search and filter properties
- Submit rental applications
- Track application status
- Make rent payments
- Message property owners

### Administrator
- Manage users and properties
- Verify property listings
- Monitor system analytics
- Handle disputes and issues
- Configure platform settings

### Real Estate Agent
- Manage property listings
- Coordinate with owners and tenants
- Track commissions
- Generate reports
- Schedule property viewings

## Core Workflows

### Property Listing Process
1. Owner logs in and creates property listing
2. Admin reviews and verifies property details
3. Property becomes visible to tenants
4. Tenants can search, view, and save properties
5. Tenants submit applications for interested properties

### Application & Approval Process
1. Tenant submits rental application
2. Owner reviews application and tenant background
3. Owner approves or rejects application
4. System notifies tenant of decision
5. If approved, lease agreement process begins

### Payment Management
1. Tenant sets up payment method
2. Automated rent collection on due dates
3. Payment receipts and history tracking
4. Late payment notifications and penalties
5. Financial reporting for owners

## Security & Privacy

- **Authentication**: Firebase Auth with role-based access
- **Data Encryption**: All sensitive data encrypted in transit
- **Privacy Controls**: Users control data sharing preferences
- **Compliance**: GDPR and CCPA compliant design
- **Secure Payments**: PCI-compliant payment processing

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Property Endpoints
- `GET /api/properties` - List properties with filters
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard data

### Payment Endpoints
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Docker Deployment
```bash
docker build -t housyrental .
docker run -p 3000:3000 housyrental
```

### Production Build
```bash
npm run build
npm start
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## CI/CD Pipeline

### GitHub Actions
- **Linting**: ESLint and Prettier checks
- **Testing**: Unit and integration tests
- **Build**: Production build verification
- **Security**: Dependency vulnerability scanning
- **Deployment**: Automatic deployment to staging/production

### Environment Setup
- **Development**: Local development with hot reload
- **Staging**: Preview deployments for pull requests
- **Production**: Optimized production deployment

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] AI-powered property recommendations
- [ ] Virtual property tours
- [ ] Smart home integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with MLS systems

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, email housyrental0@gmail.com or join our Slack channel.

---
*HousyRental - Revolutionizing real estate through technology*
