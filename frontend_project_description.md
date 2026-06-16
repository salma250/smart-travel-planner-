```
POST /api/chat/message
{
  "conversationId": "c-123",
  "message": "Planifie-moi 3 jours à Lisbonne pour un budget moyen",
  "mode": "text",
  "context": { "cityId": "lisbon-uuid" }
}
```
```
POST /api/chat/message-with-attachments
Form-Data:
  message: "..."
  audio: <Blob webm>
  image: <photo.jpg>
```
```
{
  "conversationId": "c-123",
  "message": {
    "id": "m-456",
    "role": "assistant",
    "type": "text",
    "content": "Voici un itinéraire recommandé...",
    "attachments": [ { "type":"audio", "url":"/media/out-1.mp3" } ],
    "createdAt": "2026-05-05T14:30:00Z"
  }
}
```
```
fetch('/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({ message: 'Salut', conversationId: 'c1' })
})
.then(r => r.json())
```
# Smart Travel — Frontend Technical Description

Version: 1.1
Date: 2026-05-13
Projet: Smart Travel (Frontend)

Objectif
--------
Fournir au backend et à l'équipe infra (ou à une IA de génération de backend) un manuel d'instruction précis et exécutable décrivant la partie Frontend existante, ses attentes en matière d'API, ses contraintes multimodales (texte/audio/image), la navigation, et les exigences de sécurité/observabilité.

Résumé du repository frontal
---------------------------
- Framework principal: Next.js (App Router, dossier `app/`) + React 18+.
- Styling: Tailwind CSS + `styles/globals.css`.
- Etat global minimal: `AuthContext` (Context API) pour l'authentification; recommandations pour `SWR`/`React Query` pour cache côté client si besoin.
- Code client interactif: fichiers `app/*`, composants dans `components/`, services API dans `services/api.js`, contexte dans `context/AuthContext.js`.

1) Stack Technique — Versions et Outils
--------------------------------------
- Next.js 13+ (App Router)
- React 18+
- Tailwind CSS 3.x (configurée via `tailwind.config.js`)
- PostCSS 8+
- Node.js 18+ (runtime recommandé)
- Gestion de paquets: `npm` (voir `package.json` dans `front/`)
- Recommandé côté client pour requêtes: `fetch` natif + optionnellement `SWR` ou `React Query`.
- Tests UI recommandés: `Jest` + `@testing-library/react` pour composants critiques.

2) Architecture & Cartographie des fichiers
------------------------------------------
Arborescence clé (emplacements et responsabilité):
- `app/` : routes et UI pages principales
  - `app/layout.js` — layout global (header/footer)
  - `app/page.js` — page d'accueil
  - `app/chat/page.js` — UI principale du Chat/Assistant
  - `app/itinerary/page.js` — résumé itinéraire
  - `app/trip/page.js` et `app/trip/[id]/itinerary/page.js` — détails voyage
  - `app/login/page.js`, `app/register/page.js` — auth
- `components/` — composants réutilisables (Navbar, ChatSidebar, ItineraryDay, Button, Card, Loader, ErrorMessage, Input, CitiesList)
- `context/AuthContext.js` — gestion du token, login/logout, stockage local (localStorage)
- `services/api.js` — wrapper fetch (intercepte JWT, gère erreurs et formats JSON/multipart)
- `styles/globals.css`, `tailwind.config.js` — styles et configuration Tailwind

Responsabilités des composants liés à l'Assistant IA
- `ChatSidebar` — liste des conversations & sélection; envoie event au `chat/page`.
- `chat/page.js` — conteneur principal: history display, input area, file/audio uploader, boutons d'action (generate itinerary, save suggestion).
- `MessageList` (implémenté dans `chat/page.js` ou component séparé) — rendu des messages (texte, image, audio) avec métadonnées.

Server vs Client Components
- Marquer `'use client'` pour tout composant qui utilise des APIs du navigateur (MediaRecorder, File API, event listeners, hooks d'état).
- Les composants qui font du rendu statique/SSR peuvent rester Server Components pour performance.

3) Fonctionnalités UI — Assistant multimodal
------------------------------------------
Modes supportés par le frontend:
- Texte: saisie de prompt, envoi et affichage des réponses.
- Audio (entrée): enregistrement navigateur → envoi au backend pour ASR/transcription. Formats acceptés côté frontend: `audio/webm;codecs=opus` (préféré), `audio/ogg`, `audio/wav`.
- Audio (sortie): le backend fournit une URL ou stream audio (mp3/wav). Frontend doit pouvoir jouer via `<audio>`.
- Image: upload d'image (jpeg/png) pour enrichir le contexte d'une requête multimodale.

UX avancées souhaitées (à proposer au backend):
- Streaming de tokens (SSE ou WebSocket) pour afficher la réponse assistant en temps réel.
- Indication de progression pour traitements longs (génération itinéraire), et reprise via `jobId`.

Structure des messages côté frontend (modèle attendu)
---------------------------------------------------
Chaque message rendu par l'UI doit respecter ce schéma JS:

{
  id: string,
  conversationId?: string,
  role: 'user' | 'assistant' | 'system',
  type: 'text' | 'image' | 'audio',
  content: string, // texte ou URL (pour image/audio)
  attachments?: Array<{ type: 'image'|'audio', url: string, meta?: object }>,
  createdAt: string, // ISO 8601
  metadata?: object
}

4) Besoins API — Contrats précis et exemples
-------------------------------------------
Conventions générales:
- Auth: `Authorization: Bearer <token>` header
- JSON responses: `Content-Type: application/json`
- Uploads multipart: `multipart/form-data` (fields nommés clairement)
- Identifiants: utiliser UUIDs si possible

Endpoints prioritaires (spécifications):

a) Auth
- POST `/api/auth/register`
  - Request JSON: { name, email, password }
  - Response 201: { user: { id, name, email }, token }
- POST `/api/auth/login`
  - Request JSON: { email, password }
  - Response 200: { user, token }

b) Cities
- GET `/api/cities`?q=&limit=&page=
  - Response 200: { items: [ { id, name, country, lat, lng, summary } ], total }

c) Trips
- GET `/api/trips` (auth)
  - Response 200: { trips: [ { id, title, startDate, endDate, cityId, summary } ] }
- POST `/api/trips` (auth)
  - Request JSON: { title, startDate, endDate, cityId, preferences? }
  - Response 201: trip object

d) Itinerary
- GET `/api/itinerary/:tripId` (auth)
  - Response 200: { tripId, days: [ { date, activities: [ { id, time, title, location, description, durationMinutes } ] } ] }
- POST `/api/itinerary/generate` (auth)
  - Request JSON (sync): { tripId, preferences?, constraints? }
  - Or async response: { jobId }
  - POST `/api/itinerary/status/:jobId` => { status, result? }

e) Chat / Assistant (multimodal)
- POST `/api/chat/message` (auth)
  - Request JSON:
    {
      conversationId?: string,
      message: string,
      mode: 'text' | 'multimodal',
      context?: { tripId?, cityId?, itineraryId? }
    }
  - Response 200:
    {
      conversationId,
      message: { id, role: 'assistant', type: 'text', content, attachments?: [] }
    }

- POST `/api/chat/message-with-attachments` (auth,multipart)
  - multipart fields: `message` (string), `conversationId` (string optional), `audio` (file optional), `image` (file optional)
  - Backend: must accept `audio/webm`, `audio/wav`, `image/jpeg`, `image/png` (max 8MB par fichier)

- Streaming endpoint (recommandé):
  - WebSocket: `ws://.../api/chat/stream?conversationId=...`
  - Ou SSE POST `/api/chat/stream` avec body { message, conversationId }
  - Events: `token` (partial text), `chunk` (optional media chunk base64), `done` (message metadata)

Exemples de payloads (frontend -> backend)
- Texte:
```
POST /api/chat/message
{
  "conversationId": "c-123",
  "message": "Propose-moi 3 activités à Paris pour 2 jours.",
  "mode": "text",
  "context": { "cityId": "paris-uuid" }
}
```
- Multipart (audio+image):
```
POST /api/chat/message-with-attachments
Form-Data:
  message: "Voici une photo et un enregistrement"
  audio: <blob.webm>
  image: <photo.jpg>
```

Response attendu (schéma)
```
{
  "conversationId": "c-123",
  "message": {
    "id": "m-456",
    "role": "assistant",
    "type": "text",
    "content": "Jour 1: ...\nJour 2: ...",
    "attachments": [ { "type":"audio", "url":"https://.../out-1.mp3" } ],
    "createdAt": "2026-05-13T12:00:00Z"
  }
}
```

Format audio recommandé (frontend -> backend):
- `audio/webm;codecs=opus` (taille efficace, navigateur-friendly). Fournir fallback `audio/wav`.

5) Navigation & Flows Utilisateurs
---------------------------------
Pages principales:
- `/` — Accueil
- `/login` — Connexion
- `/register` — Inscription
- `/trips` — Liste voyages (création / suppression)
- `/trip/[id]` — Détail voyage
- `/trip/[id]/itinerary` — Itinéraire détaillé (par jour)
- `/chat` — Assistant (multimodal)
Flux critiques:
- Auth: login -> store token (`localStorage`) -> redirect `/trips`
- Chat: création/selection conversation -> envoi message -> affichage progressif (stream) -> enregistrement optionnel de suggestion dans un trip

6) Sécurité, CORS, et bonnes pratiques
------------------------------------
- JWT en header `Authorization` pour endpoints protégés; endpoints publics: `/auth/*`, `/cities`.
- CORS: autoriser origin `http://localhost:3000` (dev) + domaine prod.
- Validation serveur des uploads: vérifier taille (<= 8MB images, <= 10MB audio), type MIME, et mettre en place antivirus/malware scan si possible.
- Rate limiting par utilisateur (ex: 60 requêtes/minute), quotas pour endpoints LLM (coûts).

7) Streaming & Long Running Jobs
--------------------------------
- Pour réponses LLM longues: recommander WebSocket ou SSE (SSE simple à déployer pour unidirectional streaming). Fournir event `token` et `done`.
- Pour génération d'itinéraires lourde: job queue (Redis + Bull/Sidekiq), endpoint POST retourne `jobId`, poll `/api/itinerary/status/:jobId` ou webhook.

8) Stockage média & URLs sécurisées
---------------------------------
- Stocker audio/images sur S3-compatible; backend renvoie URLs signées (presigned) valables N minutes.
- Frontend doit accepter et utiliser ces URLs pour playback et affichage.

9) Observabilité & instrumentation
----------------------------------
- Backend doit exposer métriques: latence endpoints `/metrics` (Prometheus), logs structurés (JSON) avec requestId, userId.
- Frontend: injecter `X-Request-Id` header et log console errors avec context minimal.

10) Erreurs, codes & shape standard
----------------------------------
- Standardiser réponse d'erreur:
  - 4xx: { error: { code: "INVALID_INPUT", message: "...", details?: {} } }
  - 5xx: { error: { code: "SERVER_ERROR", message: "..." } }
- Frontend doit gérer codes: 401 (logout + redirect login), 403 (display), 429 (backoff UI), 500 (retry / show global error).

11) Checklist pour backend (livrables minimaux)
--------------------------------------------
- Endpoints listés et documentés (OpenAPI idéal)
- Auth JWT fonctionnel et samples pour `AuthContext` front
- Support multipart uploads image/audio
- SSE/WebSocket streaming pour `/api/chat/stream`
- Job queue pour génération itinéraire + polling
- Stockage média S3 avec presigned URLs
- Schéma de messages conforme au `Message` model ci-dessus

Annexes — exemples de commandes utiles pour tests
------------------------------------------------
- Test POST chat (curl):
```
curl -X POST "http://localhost:3000/api/chat/message" \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"message":"Test", "mode":"text"}'
```
- Upload audio (curl multipart):
```
curl -X POST "http://localhost:3000/api/chat/message-with-attachments" \
 -H "Authorization: Bearer $TOKEN" \
 -F "message=Audio test" \
 -F "audio=@./test.webm" \
 -F "image=@./photo.jpg"
```

Conclusion & prochaines étapes
------------------------------
Le fichier fournit un contrat détaillé et exécutable. Prochaine étape recommandée: générer une spécification OpenAPI (YAML/JSON) basée sur les endpoints listés — je peux la générer automatiquement afin de produire des mocks et accélérer le développement backend.

Fichiers frontend pertinents pour référence rapide:
- [front/services/api.js](front/services/api.js)
- [app/chat/page.js](app/chat/page.js)
- [context/AuthContext.js](context/AuthContext.js)

Fin du document.
