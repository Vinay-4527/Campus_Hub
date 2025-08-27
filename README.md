# Campus Hub 🎓

A centralized student utility platform designed to simplify campus life by offering **Lost & Found, Mess Feedback, Event Management, and Notes Sharing** modules.  
The system is **scalable, modern, and free to deploy**, built using industry-standard technologies.

---

## 🚀 Tech Stack

### Frontend
- **Next.js (React Framework)** → SEO-friendly, scalable
- **Tailwind CSS** → modern, responsive styling
- **TypeScript** → type safety and maintainability
- **ShadCN/UI + Framer Motion** → professional UI components + smooth animations

### Backend
- **Django + Django REST Framework (DRF)** → secure API backend
- **Redis (Upstash)** → real-time notifications + caching
- **Celery (optional)** → background tasks (email reminders, notifications)

### Database & Storage
- **PostgreSQL (Supabase free tier)** → relational data storage
- **Cloudinary** → file & image storage (notes, lost items)

### Deployment
- **Frontend:** Vercel (free tier)
- **Backend:** Render (free tier)
- **Database:** Supabase (free tier)
- **Cache:** Upstash Redis (free tier)
- **Storage:** Cloudinary (free tier)

---

## 🎯 Features

1. **Lost & Found**
   - Students can report lost items with images.
   - Claim and verification system with admin approval.

2. **Mess Feedback**
   - Students give daily/weekly feedback on food.
   - Analytics dashboard for admin to track satisfaction.

3. **Event Management**
   - Admins create events, students register.
   - Real-time event reminders/updates.

4. **Notes Sharing**
   - Students upload and share lecture notes/PDFs.
   - Search and download functionality.

5. **Authentication & Roles**
   - Role-based access: `Student`, `Admin`, `Faculty`.
   - Secure login, registration, and JWT token system.

---

## 🎨 UI/UX Guidelines

The interface must be:
- **Modern and responsive** (works on mobile, tablet, desktop).
- Use **Tailwind CSS + ShadCN UI components** for consistent design.
- Apply **Framer Motion** for smooth transitions and animations.
- Follow **minimal, clean design principles**:
  - Dashboard with sidebar navigation.
  - Grid-based layouts for events and notes.
  - Card-based UI for Lost & Found items.
  - Charts for mess feedback analytics.
- Ensure **dark mode support**.

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Django)      │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │     Render      │    │    Supabase     │
│  (Deployment)   │    │   (Deployment)  │    │   (Hosting)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Components:
- **Frontend Layer**: Next.js with TypeScript, Tailwind CSS, and ShadCN/UI
- **API Layer**: Django REST Framework with JWT authentication
- **Data Layer**: PostgreSQL database with Redis caching
- **Storage Layer**: Cloudinary for file and image storage
- **Deployment Layer**: Vercel (frontend) + Render (backend)

---

## 📁 Project Structure

```
CAMPUS_HUB/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # App Router (Next.js 13+)
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Django Backend Application
│   ├── campus_hub/          # Main Django project
│   ├── apps/
│   │   ├── authentication/  # User auth & roles
│   │   ├── lost_found/      # Lost & Found module
│   │   ├── mess_feedback/   # Mess feedback module
│   │   ├── events/          # Event management
│   │   └── notes/           # Notes sharing
│   ├── requirements.txt
│   └── manage.py
│
├── docs/                     # Documentation
│   ├── api/                 # API documentation
│   ├── deployment/          # Deployment guides
│   └── screenshots/         # UI screenshots
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL (or Supabase account)
- Redis (or Upstash account)
- Cloudinary account

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/campus-hub.git
cd campus-hub/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

---

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/campus_hub
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register/     # User registration
POST /api/auth/login/        # User login
POST /api/auth/logout/       # User logout
GET  /api/auth/profile/      # Get user profile
PUT  /api/auth/profile/      # Update user profile
```

### Lost & Found Endpoints
```
GET    /api/lost-found/      # List all items
POST   /api/lost-found/      # Report lost item
GET    /api/lost-found/{id}/ # Get item details
PUT    /api/lost-found/{id}/ # Update item
DELETE /api/lost-found/{id}/ # Delete item
POST   /api/lost-found/{id}/claim/ # Claim item
```

### Mess Feedback Endpoints
```
GET    /api/mess-feedback/   # List feedback
POST   /api/mess-feedback/   # Submit feedback
GET    /api/mess-feedback/analytics/ # Get analytics
```

### Events Endpoints
```
GET    /api/events/          # List events
POST   /api/events/          # Create event (Admin only)
GET    /api/events/{id}/     # Get event details
PUT    /api/events/{id}/     # Update event
DELETE /api/events/{id}/     # Delete event
POST   /api/events/{id}/register/ # Register for event
```

### Notes Endpoints
```
GET    /api/notes/           # List notes
POST   /api/notes/           # Upload note
GET    /api/notes/{id}/      # Get note details
DELETE /api/notes/{id}/      # Delete note
GET    /api/notes/search/    # Search notes
```

---

## 🎨 UI Components

### Core Components
- **Layout**: Sidebar navigation with responsive design
- **Cards**: Consistent card components for items, events, notes
- **Forms**: Reusable form components with validation
- **Modals**: Confirmation dialogs and forms
- **Charts**: Analytics charts using Chart.js or Recharts
- **Tables**: Data tables with sorting and filtering

### Design System
- **Colors**: Consistent color palette with dark mode support
- **Typography**: Clear hierarchy with readable fonts
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Icons**: Lucide React icons for consistency

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Student, Admin, Faculty roles
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Secure file upload with type validation
- **CORS Configuration**: Proper CORS setup for production
- **Environment Variables**: Secure configuration management

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn campus_hub.wsgi:application`
5. Configure environment variables

### Database Setup (Supabase)
1. Create a new project on Supabase
2. Get your database connection string
3. Update backend environment variables
4. Run migrations on production database

---

## 🧪 Testing

### Frontend Testing
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Run tests with coverage
```

### Backend Testing
```bash
python manage.py test # Run Django tests
python manage.py test --coverage # Run with coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ShadCN/UI** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **Django REST Framework** for robust API development
- **Vercel & Render** for free hosting solutions

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/campus-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/campus-hub/discussions)
- **Email**: support@campushub.com

---

## 🔄 Changelog

### v1.0.0 (Coming Soon)
- Initial release with core features
- Lost & Found module
- Mess Feedback system
- Event Management
- Notes Sharing platform
- User authentication and role management

---

**Made with ❤️ for the student community**

