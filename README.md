# Smart Travel Planner

Smart Travel Planner is a full-stack example application that helps users plan trips, generate itineraries, chat with an AI assistant, and share posts about destinations. It includes a Node/Express backend and a Next.js frontend.

**Tech stack**: Node.js, Express, PostgreSQL (Supabase compatible), Next.js, Tailwind CSS

**Status**: Example / demo project

## Prerequisites
- Node.js 18 or newer
- PostgreSQL or a Supabase project (recommended for hosting the database)

## Installation

1. Clone the repo

```bash
git clone <repo-url>
cd Smart-Travel-Planner-
```

2. Install backend dependencies

```bash
cd back
npm install
```

3. Install frontend dependencies

```bash
cd ../front
npm install
```

4. Configure environment

Copy `back/.env.example` to `back/.env` and fill in values (database URL, JWT secret, FRONTEND_URL)

5. Run SQL schema

Open your Supabase project (or PostgreSQL client) and run the SQL in `back/db/init.sql` to create tables.

6. Start backend (dev)

```bash
cd back
npm run dev
```

7. Start frontend (dev)

```bash
cd front
npm run dev
```

## API Endpoints

- Auth
  - `POST /api/auth/register` — Register new user
  - `POST /api/auth/login` — Login and receive JWT
  - `GET  /api/auth/me` — Get current user (protected)
- Trips
  - `GET  /api/trips` — List trips
  - `GET  /api/trips/:id` — Get trip details (protected)
  - `POST /api/trips` — Create trip (protected)
- Itinerary
  - `POST /api/itinerary/generate` — Generate itinerary for a trip (protected)
- Chat
  - `POST /api/chat` — Send messages to AI assistant (protected)
- Cities
  - `GET /api/cities` — List cities
- Posts
  - `GET /api/posts` — List posts

## Folder Structure

- `back/` — Express backend
  - `controllers/` — Route handlers
  - `routes/` — Express routes
  - `models/` — DB access helpers
  - `middleware/` — Auth, validation, error handling
  - `db/init.sql` — Database schema
  - `.env.example` — Example environment variables
- `front/` — Next.js frontend
  - `app/` — Next.js app routes and pages
  - `components/` — UI components
  - `context/` — React context (auth)
  - `services/` — API client
  - `styles/` — CSS (Tailwind)

## Security & Notes

- Passwords are hashed with bcrypt (saltRounds=10).
- JWTs are signed with `process.env.JWT_SECRET`.
- Rate-limiting is enabled on auth routes to reduce brute-force attempts.
- CORS is configured to allow the frontend URL (`FRONTEND_URL` in `.env`).

## Next steps / Development

- Fill `back/.env` with real secrets and database connection
- Import city and booking sample data using scripts in `back/scripts/`
- Deploy backend to a server or serverless platform and frontend to Vercel or similar

If you need help running or deploying the project, open an issue or ask for guidance.
# ✈️ Smart Travel Planner

> Application web intelligente de planification de voyage basée sur le budget

## 📋 À propos du projet

**Smart Travel Planner** est une plateforme web intelligente qui permet à l'utilisateur de planifier un voyage complet à partir d'un simple budget. L'application analyse les vols, hébergements, activités et transports pour proposer une destination optimisée avec un itinéraire détaillé jour par jour.

> Projet de Fin d'Année (PFA) — Spécialité Ingénierie Logiciel — 2025/2026  
> Réalisé par **ZNATNI Aya** & **CHKOUNI Salma**

---

## 🚀 Fonctionnalités

- 🧭 **Planification intelligente** — Propose des destinations adaptées au budget et aux préférences
- 📅 **Itinéraire automatique** — Génération jour par jour (monuments, restaurants, activités) via IA
- 🤖 **Assistant IA** — Chatbot pour répondre aux questions (visa, météo, activités, lieux)
- 🗺️ **Carte interactive** — Visualisation des hôtels, monuments et restaurants sur carte
- 📸 **Communauté** — Partage de photos, avis et recommandations de lieux
- 🏆 **Système de récompenses** — Points gagnés en publiant des avis et photos
- 📄 **Export PDF** — Téléchargement du guide de voyage complet au format PDF

---

## 🛠️ Stack technique

### Frontend
| Technologie | Rôle |
|---|---|
| Next.js 14 | Framework React (App Router + SSR) |
| Tailwind CSS | Styles utilitaires |
| shadcn/ui | Composants UI |
| React Hook Form | Gestion des formulaires |
| Zustand | State management |
| React-Leaflet | Carte interactive |

### Backend
| Technologie | Rôle |
|---|---|
| Node.js + Express.js | Serveur REST API |
| Prisma ORM | Accès base de données |
| JWT + bcrypt | Authentification |
| Zod | Validation des données |
| Puppeteer / PDFKit | Génération PDF |
| Multer + Cloudinary | Upload et stockage de photos |

### Base de données
| Technologie | Rôle |
|---|---|
| PostgreSQL | Base de données relationnelle |
| Supabase | Hébergement PostgreSQL (cloud) |

### APIs externes
| API | Utilisation |
|---|---|
| Amadeus API | Recherche de vols |
| RapidAPI (Hotels) | Recherche d'hébergements |
| Google Maps / Leaflet | Carte interactive |
| OpenWeatherMap | Données météo par destination |
| REST Countries API | Infos pays (visa, monnaie) |
| Unsplash API | Photos des destinations |
| Claude / OpenAI API | Assistant IA + génération itinéraire |

---

## 📁 Structure du projet

```
smart-travel-planner/
├── frontend/                   # Application Next.js
│   ├── app/
│   │   ├── (auth)/             # Pages login / register
│   │   ├── dashboard/          # Page principale
│   │   ├── plan/               # Formulaire de planification
│   │   ├── trip/[id]/          # Détail d'un voyage
│   │   ├── my-trips/           # Liste des voyages
│   │   └── community/          # Feed communautaire
│   ├── components/             # Composants réutilisables
│   ├── lib/                    # Utilitaires et helpers
│   └── public/                 # Assets statiques
│
├── backend/                    # Serveur Express.js
│   ├── src/
│   │   ├── routes/             # Définition des routes API
│   │   ├── controllers/        # Logique métier
│   │   ├── middlewares/        # Auth, validation
│   │   ├── services/           # Appels APIs externes et IA
│   │   └── utils/              # Helpers (PDF, email...)
│   ├── prisma/
│   │   └── schema.prisma       # Schéma base de données
│   └── tests/                  # Tests unitaires Jest
│
└── docs/                       # Documentation et rapport PFA
```

---

## ⚙️ Installation locale

### Prérequis

- Node.js >= 18
- npm ou yarn
- PostgreSQL (ou compte Supabase)
- Clés API (voir section suivante)

### 1. Cloner le repo

```bash
git clone https://github.com/votre-username/smart-travel-planner.git
cd smart-travel-planner
```

### 2. Installer les dépendances

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Configurer les variables d'environnement

**Frontend** — créer `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

**Backend** — créer `backend/.env` :

```env
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/smart_travel
JWT_SECRET=your_jwt_secret

# APIs externes
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
OPENWEATHER_API_KEY=your_openweather_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
CLOUDINARY_URL=your_cloudinary_url

# IA
ANTHROPIC_API_KEY=your_claude_key
# ou
OPENAI_API_KEY=your_openai_key
```

### 4. Initialiser la base de données

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Lancer le projet

```bash
# Backend (port 8000)
cd backend
npm run dev

# Frontend (port 3000)
cd frontend
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## 🌐 Déploiement

| Service | Utilisation | Lien |
|---|---|---|
| Vercel | Hébergement frontend | [vercel.com](https://vercel.com) |
| Railway | Hébergement backend | [railway.app](https://railway.app) |
| Supabase | Base de données PostgreSQL | [supabase.com](https://supabase.com) |
| Cloudinary | Stockage des photos | [cloudinary.com](https://cloudinary.com) |

---

## 🧪 Tests

```bash
cd backend
npm run test          # Lance tous les tests Jest
npm run test:watch    # Mode watch
npm run test:coverage # Rapport de couverture
```

---

## 📡 Endpoints API (résumé)

```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion

POST   /api/trips/plan             Planifier un voyage
GET    /api/trips                  Lister mes voyages
GET    /api/trips/:id              Détail d'un voyage
GET    /api/trips/:id/pdf          Télécharger le PDF du voyage

GET    /api/destinations           Suggestions de destinations
GET    /api/flights                Recherche de vols
GET    /api/hotels                 Recherche d'hébergements

POST   /api/ai/chat                Envoyer un message à l'assistant IA
POST   /api/ai/itinerary           Générer un itinéraire

GET    /api/community              Feed communautaire
POST   /api/community/post         Publier une photo/avis
POST   /api/community/like/:id     Liker un post

GET    /api/rewards                Solde de points
```

---

## 👥 Auteurs

| Nom | GitHub |
|---|---|
| ZNATNI Aya | [@aya-znatni](https://github.com/) |
| CHKOUNI Salma | [@salma-chkouni](https://github.com/) |

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

<div align="center">
  Projet de Fin d'Année — Ingénierie Logiciel — 2025/2026
</div>
