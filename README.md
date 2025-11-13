# Military Asset Management System (MAMS)

A full-stack web application for managing military assets with role-based access control (RBAC). Built with Next.js, MongoDB, and TypeScript.

## Features

- **User Authentication**: Secure login/registration with JWT tokens
- **Role-Based Access Control**: Admin, Commander, and Logistics roles with different permissions
- **Asset Management**: Track equipment types, bases, and transactions (purchases, transfers, assignments, expenditures)
- **Dashboard**: Real-time metrics and reports with filtering by date, base, and equipment type
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Professional UI**: Clean, responsive design using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs for password hashing
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance like MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mams
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB URI and a secure JWT secret:
```
MONGODB_URI=mongodb://localhost:27017/mams
JWT_SECRET=your-super-secret-jwt-key-here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Schema

The application uses MongoDB with the following collections:

- **Users**: Authentication and role management
- **Bases**: Military base locations
- **EquipmentTypes**: Categories of military equipment
- **Transactions**: Immutable ledger of all asset movements

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET/POST /api/bases` - Base management
- `GET/POST /api/equipment-types` - Equipment type management
- `GET/POST /api/transactions` - Transaction management
- `GET /api/dashboard/metrics` - Dashboard metrics with RBAC

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## Project Structure

```
mams/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── ...
│   ├── lib/              # Utilities (auth, mongodb)
│   └── models/           # Mongoose schemas
├── public/               # Static assets
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
