# FitFinder 👗

A smart, AI-powered wardrobe management and outfit recommendation application that helps you organize, create, and discover outfits with intelligence.

## 🌟 Overview

FitFinder is a full-stack web application that leverages machine learning to revolutionize how users manage their wardrobes. Upload photos of your clothing items, and our AI automatically tags, categorizes, and helps you create stunning outfit combinations. Get personalized recommendations based on weather, occasion, and your style preferences.

### Key Features

- **🤖 AI-Powered Auto-Tagging**: Automatically categorize and tag clothing items using state-of-the-art computer vision
- **👗 Smart Outfit Builder**: Drag-and-drop interface to visualize and create complete outfits
- **✨ Intelligent Recommendations**: Get personalized outfit suggestions based on weather and occasion
- **🎨 Color Harmony**: AI-powered color matching to ensure outfit coordination
- **💾 Outfit Management**: Save, organize, and manage your favorite outfit combinations
- **📊 Style Insights**: Data-driven insights about your wardrobe and style preferences
- **📅 Calendar Integration**: Plan and schedule outfits for upcoming events

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15.5.5](https://nextjs.org/) with Turbopack
- **Language**: TypeScript
- **UI Library**: [Radix UI](https://www.radix-ui.com/) components
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast library
- **Drag & Drop**: [@dnd-kit](https://docs.dndkit.com/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Compression**: [browser-image-compression](https://github.com/Donovan-Nonlinear/browser-image-compression)

### Backend
- **Framework**: [Django 5.2.9](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Language**: Python 3.12+
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT with [djangorestframework-simplejwt](https://github.com/jpadilla/django-rest-framework-simplejwt)
- **CORS**: [django-cors-headers](https://github.com/adamchainz/django-cors-headers)

### Machine Learning / AI
- **Computer Vision**: [Florence-2](https://github.com/microsoft/Florence) for image understanding
- **Transformers**: [Hugging Face Transformers](https://huggingface.co/docs/transformers/)
- **Deep Learning**: [PyTorch 2.9.1](https://pytorch.org/)
- **Vision Models**: [timm](https://github.com/huggingface/pytorch-image-models)
- **Utilities**: [einops](https://github.com/arogozhnikov/einops)
- **Image Processing**: [Pillow](https://pillow.readthedocs.io/)

### Deployment
- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **Backend Hosting**: [Railway](https://railway.app/)
- **Production Server**: [Gunicorn](https://gunicorn.org/)
- **Static Files**: [WhiteNoise](http://whitenoise.evans.io/)

## 📋 Dependencies

### Frontend Dependencies
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@hookform/resolvers": "^5.2.2",
  "@radix-ui/*": "latest",
  "axios": "^1.13.0",
  "browser-image-compression": "^2.0.2",
  "date-fns": "^4.1.0",
  "html2canvas": "^1.4.1",
  "lucide-react": "^0.546.0",
  "next": "15.5.5",
  "react": "19.1.0",
  "react-hook-form": "^7.65.0",
  "sonner": "^2.0.7",
  "tailwindcss": "^4",
  "zod": "^4.1.12",
  "zustand": "^5.0.8"
}
```

### Backend Dependencies
```
Django>=5.0,<6.0
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.0
django-cors-headers>=4.3.0
torch>=2.3.0
transformers>=4.49.0
huggingface-hub>=0.25.0
Pillow>=10.0.0
gunicorn>=21.0.0
psycopg2-binary>=2.9.9
whitenoise>=6.6.0
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- Git

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8001
EOF

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver 8001
```

The backend API will be available at `http://localhost:8001/api`

## 📁 Project Structure

```
fitfinder/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js pages and layouts
│   │   │   ├── (auth)/      # Authentication pages (login, register)
│   │   │   ├── wardrobe/    # Wardrobe management
│   │   │   ├── outfit-builder/  # Outfit creation interface
│   │   │   ├── outfits/     # Saved outfits view
│   │   │   ├── recommendations/  # Outfit recommendations
│   │   │   └── calendar/    # Calendar view
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── outfit-builder/  # Outfit builder components
│   │   │   ├── wardrobe/    # Wardrobe components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── navbar.tsx   # Navigation component
│   │   ├── lib/             # Utility functions
│   │   │   ├── api/         # API client and authentication
│   │   │   └── utils/       # Helper utilities
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── store/           # Zustand state management
│   │   └── types/           # TypeScript type definitions
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── backend/                 # Django REST API
│   ├── api/                 # Main API app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # DRF serializers
│   │   ├── urls.py          # API routes
│   │   ├── autotagger.py    # AI auto-tagging logic
│   │   ├── recommendation_engine.py  # Recommendation logic
│   │   └── migrations/      # Database migrations
│   ├── backend/             # Django settings
│   │   ├── settings.py      # Django configuration
│   │   ├── urls.py          # URL routing
│   │   └── wsgi.py          # WSGI configuration
│   ├── wardrobe/items/      # Wardrobe item images
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Backend dependencies
│   └── db.sqlite3           # SQLite database (development)
│
├── qa/                      # QA and testing
│   ├── tests/               # Test scripts
│   ├── test_reports/        # Test reports
│   └── run_all_tests.sh     # Test runner
│
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
├── DEPLOYMENT_CHECKLIST.md  # Pre-deployment checklist
└── README.md                # This file
```

## 🔐 Authentication

FitFinder uses JWT (JSON Web Tokens) for secure authentication:

- **Login**: POST `/api/auth/login/` with email and password
- **Register**: POST `/api/auth/register/` with user details
- **Token Refresh**: POST `/api/auth/token/refresh/`
- **User Profile**: GET `/api/auth/me/`

Tokens are stored in browser localStorage and automatically sent with API requests.

## 🎨 Color Palette

The application uses a modern, fashionable color scheme:

- **Primary Pink**: `#FFAEDA`
- **Primary Purple**: `#C8B4FF`
- **Primary Mint**: `#99F1B9`
- **Primary Blue**: `#86B4FA`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user profile

### Wardrobe Items
- `GET /api/wardrobe-items/` - List user's wardrobe items
- `POST /api/wardrobe-items/` - Add new clothing item
- `GET /api/wardrobe-items/{id}/` - Get item details
- `PUT /api/wardrobe-items/{id}/` - Update item
- `DELETE /api/wardrobe-items/{id}/` - Delete item

### Outfits
- `GET /api/outfits/` - List user's saved outfits
- `POST /api/outfits/` - Create new outfit
- `GET /api/outfits/{id}/` - Get outfit details
- `PUT /api/outfits/{id}/` - Update outfit
- `DELETE /api/outfits/{id}/` - Delete outfit

### Recommendations
- `POST /api/recommendations/` - Get outfit recommendations
- `GET /api/recommendations/suggested/` - Get suggested outfits

## 🤖 Machine Learning Features

### Auto-Tagging
- Uses Florence-2 computer vision model to automatically detect and tag clothing items
- Categories: tops, bottoms, dresses, outerwear, accessories, footwear, etc.
- Detects colors, patterns, and materials

### Outfit Recommendations
- Analyzes user's wardrobe and preferences
- Suggests outfits based on:
  - Weather conditions
  - Occasion/event type
  - User style preferences
  - Color harmony principles

## 🧪 Testing

Run the test suite:

```bash
cd qa
bash run_all_tests.sh
```

Individual test categories:
```bash
bash tests/test_auth.sh              # Authentication tests
bash tests/test_api_endpoints.sh     # API endpoint tests
bash tests/test_database.sh          # Database tests
bash tests/test_recommendations.sh   # Recommendation engine tests
```

## 📦 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
npm start
```

### Backend Deployment
```bash
cd backend
gunicorn backend.wsgi --bind 0.0.0.0:8000
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🌐 Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com/) for optimal Next.js performance
- **Backend**: Deployed on [Railway](https://railway.app/) with PostgreSQL database
- **Production URL**: Updated in deployment configuration

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

- **Charlie Stoner** - Project Owner

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced style analytics dashboard
- [ ] Social features (share outfits, follow friends)
- [ ] Integration with weather APIs
- [ ] Size and fit recommendations
- [ ] Virtual try-on feature
- [ ] Sustainability scoring

---

**Happy styling! 👗✨**

Made with ❤️ by the FitFinder team
