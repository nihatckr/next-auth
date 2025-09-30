# Next.js Authentication & Dashboard System 🚀

A comprehensive **Next.js 15** application featuring modern authentication, user management, admin panel, and real-time notification system. Built with **TypeScript**, **Prisma ORM**, **NextAuth.js v5**, and **shadcn/ui** components.

## 🌟 Key Features

### 🔐 **Authentication System**
- **NextAuth.js v5** integration with credentials provider
- **Email verification** workflow with token-based confirmation
- **Password reset** functionality with secure token validation
- **Role-based access control** (USER/ADMIN)
- **OAuth support** ready for Google, GitHub integration
- **Session management** with automatic updates
- **Protected routes** with middleware authentication

### 👤 **User Management**
- **User profile management** with real-time updates
- **Smart form validation** with Zod schemas
- **Password change** functionality with current password verification
- **Role management** for admin users
- **Session synchronization** across all components
- **Profile image** support with avatar fallbacks

### 🔔 **Advanced Notification System**
- **Real-time notifications** with context-based state management
- **Persistent storage** using localStorage with automatic sync
- **Auto-expiration**: Success/Info (5min), Error/Warning (10min)
- **Type-based styling**: Success, Error, Warning, Info notifications
- **Action buttons** in notifications with custom callbacks
- **Unread count tracking** with visual indicators
- **Mark as read/unread** functionality
- **Bulk operations**: Clear all, mark all as read

### 🎛️ **Admin Dashboard**
- **Role-gate protected** admin routes
- **Server actions testing** interface
- **API route testing** with permission validation
- **User management** capabilities
- **System monitoring** and analytics ready
- **Admin-only notifications** for system events

### 🎨 **Modern UI/UX**
- **shadcn/ui** component library with Tailwind CSS
- **Responsive design** with mobile-first approach
- **Dark/Light mode** ready infrastructure
- **Accessible components** with ARIA compliance
- **Loading states** and error handling
- **Toast notifications** with Sonner integration
- **Form validation** with real-time feedback

### 🛠️ **Developer Experience**
- **TypeScript** with strict type checking
- **ESLint** configuration for code quality
- **Prisma ORM** with MySQL database
- **Hot reload** development server
- **Component-based architecture** with reusable components
- **Custom hooks** for common functionality
- **Route protection** with middleware

## 🏗️ Project Structure

```
next-auth/
├── prisma/
│   ├── schema.prisma              # Database schema with User, Account, Tokens
│   └── migrations/                # Database migration files
├── src/
│   ├── actions/                   # Server actions
│   │   ├── login.ts              # Authentication actions
│   │   ├── register.ts           # User registration
│   │   ├── settings.ts           # User settings updates
│   │   └── admin.ts              # Admin-only actions
│   ├── app/
│   │   ├── (protected)/          # Protected route group
│   │   │   ├── admin/            # Admin panel pages
│   │   │   ├── settings/         # User settings page
│   │   │   ├── profile/          # User profile management
│   │   │   └── layout.tsx        # Protected layout with navbar
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/            # Login page
│   │   │   ├── register/         # Registration page
│   │   │   ├── reset/            # Password reset
│   │   │   └── new-verification/ # Email verification
│   │   ├── api/                  # API routes
│   │   │   └── [...nextauth]/    # NextAuth.js API routes
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── login-form.tsx    # Login form with validation
│   │   │   ├── register-form.tsx # Registration form
│   │   │   ├── card-wrapper.tsx  # Auth card wrapper
│   │   │   └── role-gate.tsx     # Role-based access component
│   │   ├── navigation/           # Navigation components
│   │   │   ├── notification.tsx  # Advanced notification menu
│   │   │   ├── user-button.tsx   # User dropdown menu
│   │   │   └── navbar.tsx        # Main navigation bar
│   │   ├── ui/                   # shadcn/ui components
│   │   └── dashboard/            # Dashboard-specific components
│   ├── contexts/
│   │   └── notification-context.tsx # Global notification state
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-current-user.ts   # Current user hook
│   │   └── use-current-role.ts   # Current role hook
│   ├── lib/
│   │   ├── auth.ts              # Auth configuration
│   │   ├── db.ts                # Database connection
│   │   ├── mail.ts              # Email sending service
│   │   ├── tokens.ts            # Token generation/validation
│   │   └── utils.ts             # Utility functions
│   ├── schemas/
│   │   └── index.ts             # Zod validation schemas
│   ├── data/                    # Database query functions
│   ├── auth.config.ts           # NextAuth configuration
│   ├── middleware.ts            # Route protection middleware
│   └── routes.ts                # Route definitions
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── components.json             # shadcn/ui configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **MySQL** database
- **npm/yarn/pnpm** package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd next-auth
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/nextauth_db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Examples

### Authentication Flow
```typescript
// Login with credentials
const result = await loginAction({
  email: "user@example.com",
  password: "password123"
});

// Register new user
const user = await registerAction({
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword"
});
```

### Notification System
```typescript
// Add notification
const { addNotification } = useNotifications();

addNotification({
  type: 'success',
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated.',
  action: {
    label: 'View Profile',
    onClick: () => router.push('/profile')
  }
});
```

### Role-Based Access
```tsx
// Protect admin-only content
<RoleGate allowedRole={UserRole.ADMIN}>
  <AdminPanel />
</RoleGate>

// Check user role in component
const user = useCurrentUser();
const isAdmin = user?.role === UserRole.ADMIN;
```

## 🔧 Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with concurrent features
- **TypeScript** - Static type checking
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant forms library
- **Zod** - TypeScript-first schema validation

### **Backend & Database**
- **NextAuth.js v5** - Authentication solution
- **Prisma ORM** - Type-safe database client
- **MySQL** - Relational database
- **bcryptjs** - Password hashing
- **Resend** - Email delivery service

### **State Management**
- **React Context API** - Global state management
- **React Hooks** - Local state management
- **NextAuth Session** - Authentication state

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Prisma Studio** - Database GUI

## 🎨 UI Components

The project uses **shadcn/ui** components providing:

- ✅ **Form components** with validation
- ✅ **Navigation menus** with dropdown support
- ✅ **Dialog/Modal** components
- ✅ **Toast notifications** with Sonner
- ✅ **Data tables** with sorting/filtering
- ✅ **Cards and layouts** for content organization
- ✅ **Buttons and inputs** with variants
- ✅ **Avatar components** with fallbacks

## 🔒 Security Features

- **🔐 JWT-based authentication** with secure token handling
- **🛡️ CSRF protection** built into NextAuth.js
- **🔑 Password hashing** with bcryptjs
- **📧 Email verification** workflow
- **🔄 Token expiration** and refresh mechanisms
- **🚪 Route protection** via middleware
- **👤 Role-based authorization** system
- **🔒 Input validation** with Zod schemas

## 📊 Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  accounts      Account[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  USER
}
```

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Environment Variables for Production**
```env
DATABASE_URL="mysql://user:pass@host:port/db"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
RESEND_API_KEY="your-production-resend-key"
```

## 📈 Performance Features

- **⚡ Server-side rendering** with Next.js App Router
- **🏎️ Static generation** for public pages
- **📱 Responsive design** with mobile optimization
- **🎯 Code splitting** with dynamic imports
- **💾 Persistent storage** for notifications
- **🔄 Optimistic updates** for better UX
- **📦 Bundle optimization** with Next.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NextAuth.js** team for excellent authentication solution
- **shadcn** for beautiful UI components
- **Prisma** team for amazing ORM
- **Vercel** for Next.js and deployment platform
- **Tailwind CSS** for utility-first styling approach

## 📞 Support

If you have any questions or issues, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact: [your-email@example.com](mailto:your-email@example.com)

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
# next-auth-b2b
