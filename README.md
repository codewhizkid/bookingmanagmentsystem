# SalonBook - Hairstylist Booking Management System

A comprehensive, multi-tenant booking management system designed for hairstylists, barbers, and salon owners. Built with React, TypeScript, Supabase, and Tailwind CSS.

## 🌟 Features

- **Multi-tenant Architecture** - Complete salon isolation with role-based access
- **Real-time Calendar** - Day and week views with drag-and-drop scheduling
- **Appointment Management** - Full lifecycle from booking to completion
- **Customer Profiles** - Track visit history, preferences, and spending
- **Service Management** - Flexible pricing and duration settings
- **Staff Management** - Stylist profiles, schedules, and performance tracking
- **Business Analytics** - Revenue reports and service performance metrics
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/salonbook.git
cd salonbook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_NAME=SalonBook
VITE_APP_VERSION=1.0.0
```

### 4. Supabase Setup

#### Option A: Using Supabase Dashboard (Recommended)
1. Create a new project at [supabase.com](https://supabase.com/)
2. Go to Settings → API to find your project URL and anon key
3. Navigate to the SQL Editor in your Supabase dashboard
4. Run the migration files in order:
   - First: `supabase/migrations/20250929202333_sparkling_flame.sql`
   - Second: `supabase/migrations/20250929202407_noisy_jungle.sql`

#### Option B: Using Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## 🔐 Demo Credentials

The system comes with pre-seeded demo accounts for testing:

### Salon Owner
- **Email:** `owner@salonbook.com`
- **Password:** `password123`
- **Access:** Full salon management, staff oversight, analytics

### Stylist
- **Email:** `stylist@salonbook.com`
- **Password:** `password123`
- **Access:** Personal schedule, customer appointments, service management

### Customer
- **Email:** `customer@example.com`
- **Password:** `password123`
- **Access:** Book appointments, view history, manage profile

## 📁 Project Structure

```
salonbook/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── appointments/   # Appointment management
│   │   ├── calendar/       # Calendar views
│   │   └── pages/          # Main page components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── lib/               # Utilities and helpers
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main application component
├── supabase/
│   └── migrations/        # Database schema migrations
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run TypeScript type checking
npm run typecheck

# Run ESLint
npm run lint
```

## 🗄️ Database Schema

The system uses the following main tables:

- **users** - User profiles with role-based access
- **salons** - Salon/business information
- **stylists** - Stylist profiles and specialties
- **services** - Available services and pricing
- **appointments** - Booking appointments with full lifecycle
- **customer_profiles** - Extended customer information
- **business_hours** - Salon operating hours
- **stylist_schedules** - Individual stylist availability

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

### Supabase Configuration

The application uses Supabase for:
- **Authentication** - User registration and login
- **Database** - PostgreSQL with Row Level Security
- **Real-time** - Live updates for appointments
- **Storage** - File uploads (future feature)

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Supabase Connection Issues
1. Verify your `.env` file has the correct credentials
2. Check that your Supabase project is active
3. Ensure RLS policies are properly configured
4. Verify the database migrations have been run

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### TypeScript Errors
```bash
# Run type checking
npm run typecheck

# Update TypeScript definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

### Database Issues

#### Missing Tables
If you see "relation does not exist" errors:
1. Ensure both migration files have been run in order
2. Check the Supabase dashboard → Table Editor
3. Verify your database connection

#### Permission Errors
If you see "permission denied" errors:
1. Check Row Level Security policies in Supabase
2. Verify user authentication status
3. Ensure proper role assignments

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Tenant isolation** using salon_id
- **Role-based access control** for different user types
- **Input validation** on all forms
- **SQL injection protection** through Supabase client

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

### Docker (Future)
```dockerfile
# Dockerfile example for future containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub Issues](https://github.com/your-username/salonbook/issues)
3. Create a new issue with detailed information
4. Join our [Discord community](https://discord.gg/salonbook) for real-time help

## 🎯 Roadmap

- [ ] Payment integration (Stripe)
- [ ] SMS/Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Multi-location support
- [ ] Inventory management
- [ ] Marketing automation
- [ ] API documentation

---

**Built with ❤️ for the beauty industry**

*SalonBook - Streamlining salon operations, one appointment at a time.*