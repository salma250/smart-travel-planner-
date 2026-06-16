# Manuel technique — Backend & Infrastructure AI

Ce document décrit en détail l'implémentation actuelle du projet "Smart Travel Planner" et fournit des instructions techniques complètes destinées à une autre IA/équipe pour concevoir et déployer le Backend et l'infrastructure AI en parfaite synchronisation avec le Frontend existant.

**Remarque**: les chemins de fichiers cités font référence au repository présent et sont fournis pour faciliter l'inspection: [back/index.js](back/index.js#L1), [back/package.json](back/package.json#L1), [front/package.json](front/package.json#L1), et le microservice FastAPI Python [back/app/main.py](back/app/main.py#L1).

---

**Stack Technique**
- **Frontend**: Next.js (React 18) — voir [front/package.json](front/package.json#L1). Styling: Tailwind CSS (postcss/autoprefixer). HTTP client: `axios` (service centralisé: [front/services/api.js](front/services/api.js#L1)).
- **Backend principal (Node.js)**: Express.js (routes exposées dans `back/routes/`, controllers dans `back/controllers/`) — gestion JWT avec `jsonwebtoken`, validation `joi`, sécurité `express-rate-limit` et CORS configuré dans [back/index.js](back/index.js#L1). Peut se connecter à PostgreSQL (`pg`) et MongoDB (`mongoose`) — dépendances listées dans [back/package.json](back/package.json#L1).
- **Microservice AI (Python)**: FastAPI (ASGI) présent dans `back/app/` — point d'entrée [back/app/main.py](back/app/main.py#L1). Utilise SQLAlchemy async pour persistance, et wrappers pour intégration AI (ex: `back/app/services/ai_service.py`).
- **Bases de données**: Postgres (connections gérées via `back/config/db.js`) et une couche SQLAlchemy dans le microservice Python (`back/app/config/settings.py` et `back/app/utils/dependencies.py`). Le projet inclut aussi modèles pour MongoDB (présence de `mongoose` et `mongodb` dans package.json).
- **Stockage fichiers**: endpoints acceptent uploads (audio, image) via multipart/form-data; stockage actuel en mémoire/temporaire (voir `back/app/routes/chat.py` / `front/services/api.js`).

**Architecture & Structure des dossiers (résumé)**
- Racine: `back/` (backend Node + microservice Python), `front/` (Next.js front).
- back/ (Node API):
  - `index.js` : serveur Express principal et montage des routes ([back/index.js](back/index.js#L1)).
  - `routes/` : définitions d'API Express (`auth.js`, `chat.js`, `trips.js`, `itinerary.js`, `cities.js`, `posts.js`).
  - `controllers/` : logique métier pour endpoints (ex: `chatController.js` retourne réponses simples).
  - `config/` : configuration DB ([back/config/db.js](back/config/db.js#L1)).
  - `middleware/` : `auth.js`, `errorHandler.js` et `validate.js`.
  - `models/` : schémas mongoose/ORM pour users, trips, posts, etc.
- back/app/ (Python FastAPI microservice):
  - `main.py` : FastAPI app et inclusion des routers ([back/app/main.py](back/app/main.py#L1)).
  - `routes/` : `auth`, `chat`, `trips` (routers FastAPI).
  - `services/` : `ai_service.py` (wrapper Generative AI), `audio_service.py` (transcription placeholder), `itinerary_service.py`.
  - `models/`, `schemas/`, `utils/` : modèles SQLAlchemy, Pydantic schemas, helpers (dépendances, JWT, db session).
- front/ (Next.js):
  - `app/` : pages and routes (app router) — `chat/SendMessage.jsx`, `chat/page.js`, `itinerary`, `trip/[id]/itinerary`.
  - `components/` : UI atoms et molecules (`Navbar.js`, `ChatSidebar.js`, `ItineraryDay.js`, `Loader.js`, ...).
  - `services/api.js` : client HTTP centralisé (gère JWT + endpoints multimodaux).

**Fonctionnalités UI — Assistant IA (multimodal)**
- Vue principale: `front/app/chat/page.js` — interface conversationnelle avec historique, suggestions rapides (QUICK_SUGGESTIONS) et contexte de voyage (current trip).
- Composant d'envoi: `front/app/chat/SendMessage.jsx` — permet:
  - Envoi de texte (champ `text`)
  - Upload d'un fichier audio (`accept=\"audio/*\"`) et d'une image (`accept=\"image/*\"`).
  - Formulaire multipart envoyé via `sendMultimodalMessage` dans [front/services/api.js](front/services/api.js#L1).
- Comportement côté UI:
  - Affichage bulles messages: `MessageBubble` dans `page.js` gère formatage simple Markdown (gras) et indicateur de frappe.
  - Gestion du token JWT dans `localStorage` (set lors du `login` et ajouté à chaque requête par un interceptor axios dans `front/services/api.js`).

**Besoins API — Contrats Frontend → Backend**
Les endpoints existants et leurs contrats (forme et formats exacts) :

- Endpoint multimodal principal (FastAPI service):
  - POST `/api/chat/message-with-attachments` (FastAPI router)
  - Content-Type: `multipart/form-data`
  - Champs attendus:
    - `conversationId` (string, optional) — identifiant de conversation (si absent, backend crée un new UUID)
    - `text` (string, optional) — contenu textuel envoyé
    - `audio` / `audio_file` (file, optional) — fichier audio (accept `audio/*`)
    - `image` (file, optional) — image (accept `image/*`)
  - Réponse: JSON contenant `conversationId` et `message` { id, role, type, content, createdAt }
  - Voir implémentation: [back/app/routes/chat.py](back/app/routes/chat.py#L1).

- Endpoint texte-only (FastAPI):
  - POST `/api/chat/message` — JSON body `{ conversationId?, content }`
  - Renvoie réponse AI et persistance message (Message model SQLAlchemy).

- Endpoint Node/Express (legacy/simple assistant):
  - POST `/api/chat` — JSON `{ message }` — renvoie `{ answer }` (implémentation simple dans `back/controllers/chatController.js`). Voir [back/routes/chat.js](back/routes/chat.js#L1) et [back/controllers/chatController.js](back/controllers/chatController.js#L1).

- Auth & Users (prérequis):
  - `POST /api/auth/login` — credentials { email, password } → retourne `access_token` / `token` et `user` object (front stocke `token`/`user` en localStorage via `login` dans `front/services/api.js`).
  - Middleware `get_current_user` (FastAPI) et `auth.js` (Node middleware) protègent endpoints (voir `back/app/utils/dependencies.py` et `back/middleware/auth.js`).

Payload & formats recommandés pour IA:
- Texte: UTF-8 plain text (body field `text` or `content`).
- Audio: send as file (common formats MP3, WAV, M4A). Backend doit accept `audio/*` and read bytes. Transcription service attendu pour convertir audio→text (current placeholder in `back/app/services/audio_service.py`).
- Image: send as file JPEG/PNG; AI service should produce short textual description / OCR or scene understanding. Current `ai_service.py` has placeholders for `describe_image` usage.

Sécurité & limites:
- Auth: JWT via `Authorization: Bearer <token>` header. Frontend sets header in axios interceptor ([front/services/api.js](front/services/api.js#L1)).
- Rate limiting: applied to auth endpoints in Node backend (`express-rate-limit` in [back/index.js](back/index.js#L1)).

**Navigation & Routes (Frontend)**
- Pages principales (Next.js app-router):
  - `/` : landing/home (page.js)
  - `/chat` : assistant multimodal — `front/app/chat/page.js`
  - `/itinerary` : aperçu itinéraire — `front/app/itinerary/page.js`
  - `/trip/[id]` : page de voyage, avec sous-route `/trip/[id]/itinerary`
  - `/login`, `/register` : auth pages
  - `/trips` : liste des voyages (front/pages/trips.js)

Flux utilisateur (exemples):
- Login → token stocké → accès `/chat` → envoi de texte/audio/image → appel `/api/chat/message-with-attachments` → réponse AI affichée dans UI.

**Guide de conception Backend & Infrastructure AI (instructions pas-à-pas)**
But: fournir à une IA les étapes pour concevoir et déployer un backend fiable, scalable et sécurisé aligné sur le frontend existant.

1) Infra & déploiement
  - Conteneuriser services (Dockerfiles existants: `back/Dockerfile`). Séparer services en 2 conteneurs: `api-node` (Express) et `ai-service` (FastAPI). Ajouter un `docker-compose.yml` pour orchestration local (Postgres container, optional MongoDB).
  - Provisionner base Postgres (DB schema initial dans `back/db/init.sql`) et configurer variables d'environnement (`DATABASE_URL`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME`).
  - Secrets: stocker clés (GEMINI_API_KEY, JWT_SECRET) dans vault (Azure KeyVault / AWS Secrets Manager / HashiCorp Vault) et injecter dans containers / CI.

2) API contract & validation
  - Standardiser les endpoints AI et versions (ex: `/v1/chat/message`, `/v1/chat/attachments`). Documenter OpenAPI/Swagger (FastAPI fournit autogénération).
  - Valider inputs: tailles max (audio/image), mime-types acceptés, max message length (ex 5000 chars). Rejeter fichiers > 10MB (configurable).
  - Implémenter streaming réponses / chunked responses pour longues générations (si le provider le permet).

3) AI service
  - Remplacer placeholders de `back/app/services/ai_service.py` et `audio_service.py` par intégrations réelles:
    - Transcription: intégrer Whisper/Whisper API/OpenAI/AssemblyAI or Google Speech-to-Text.
    - Generative model: configurer provider (Google Gemini via `google.generativeai` SDK si disponible, ou OpenAI/Anthropic). Gérer fallback et erreurs réseaux.
    - Image understanding: utiliser provider's image describe API or dedicated vision model.
  - Normaliser interface interne: `process_message(text, audio_file, image_file) -> { text_response, audio_transcript, image_description }`.

4) Persistance & Conversation state
  - Table `messages` (conversation_id, id, role, type, content, created_at, user_id). Index on `conversation_id` and `user_id`.
  - CRUD endpoints pour récupérer l'historique: GET `/api/chat/history?conversationId=...&limit=50`.

5) Auth & sécurité
  - JWT token expiry + refresh tokens. Implement refresh endpoint `/api/auth/refresh`.
  - RBAC minimal: users & admins; protect admin-only endpoints.
  - Rate-limiting per-user on chat generation endpoints to avoid abuse + cost control.

6) Observabilité
  - Ajouter logs structurés (JSON) dans AI service pour prompt/responses size/cost estimate.
  - Metrics: request latency, tokens used (if provider reports), error rates. Export via Prometheus; dashboards Grafana.

7) Tests & CI
  - Unit tests for `ai_service` (mock provider), `audio_service` (mock transcription), et FastAPI routers.
  - API contract tests (Postman/Newman ou pytest + httpx pour FastAPI) pour assurer compatibilité avec le frontend.

8) Scalabilité et coûts
  - Host AI workloads separately: lightweight FastAPI acts as gateway; heavy transcription/generation tasks dispatched to scalable workers (Celery/RQ/Kafka) if synchronous latency est problématique.
  - Implement async queuing and background processing pour long-running audio transcriptions.

---

Fichiers clés à consulter pour implémentation et références rapides:
- [back/index.js](back/index.js#L1)
- [back/package.json](back/package.json#L1)
- [back/config/db.js](back/config/db.js#L1)
- [back/controllers/chatController.js](back/controllers/chatController.js#L1)
- [back/app/main.py](back/app/main.py#L1)
- [back/app/services/ai_service.py](back/app/services/ai_service.py#L1)
- [back/app/routes/chat.py](back/app/routes/chat.py#L1)
- [front/services/api.js](front/services/api.js#L1)
- [front/app/chat/SendMessage.jsx](front/app/chat/SendMessage.jsx#L1)

---

Actions proposées (je peux les générer automatiquement si vous le souhaitez):
- Générer `docker-compose.yml` et Dockerfiles pour déploiement local multi-service.
- Rédiger schéma SQL détaillé pour `messages`, `users`, `trips`.
- Ajouter tests API basiques pour valider contrat frontend→backend.

Fin du document.
