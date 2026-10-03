# PREVIA XR

### “Preview Before You Act.”

> **Different Decisions → Different Possible Futures**

PREVIA XR is an immersive XR-inspired spatial decision simulation platform where users can take a hypothetical action inside an interactive 3D environment and visualize its possible consequences before actually taking that action in the real world.

---

## 🚀 Live Hackathon Evaluation (1-Click Demo)

1. Launch PREVIA XR in your browser.
2. Click **START DEMO (EXIT A BLOCKED)** or **ENTER SIMULATOR**.
3. **Observe Baseline**: 10 occupants on standard paths to 3 designated emergency exits (Exit A, Exit B, Exit C).
4. **Take Action**: Move/place the movable hazard trolley near **Emergency Exit A** (or click the preset button).
5. **Click SIMULATE FUTURE**:
   - The deterministic A* Pathfinding Engine detects blocked navigation cells.
   - Recalculates 3D paths for all 6 affected occupants toward alternative exits (Exit B & Exit C).
   - Dynamic real-time movement occurs directly inside the 3D scene (no teleportation!).
   - Detects bottleneck chokepoints & crowd density index (+48%).
   - Calculates estimated evacuation delay (**+18 sec**, clearly labeled `*SIMULATED ESTIMATE`).
   - Recommends the optimal alternative exit (**Exit B - West Concourse**).
6. **Compare Scenarios**: Open the **Comparison** tab to contrast "Exit A Blocked" vs "Main Corridor Blocked" via side-by-side radar and bar charts.
7. **Save & Revisit**: Persist simulation outcomes to MongoDB and review past logs in **Simulation History**.

---

## 🛠️ Full-Stack Monorepo Architecture

```
PREVIA-XR/
├── client/                     # Frontend (React 19, Vite, Three.js, R3F, Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/             # SpatialScene, IndoorFloor, ObstacleMesh, AgentMesh, ExitPortal
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── ui/             # Preloader, ScenarioControls, ConsequencePanel, TimelineBar
│   │   │   └── modals/         # SaveScenarioModal
│   │   ├── contexts/           # AuthContext, SimulationContext
│   │   ├── simulation/
│   │   │   ├── engine/         # PathfindingEngine (A*), ConsequenceAnalyzer
│   │   │   └── types/          # simulationTypes.ts
│   │   ├── pages/              # Landing, Simulator, Dashboard, Scenarios, Comparison, History, About, Auth
│   │   └── services/           # api.ts, authService.ts, scenarioService.ts, simulationService.ts
├── server/                     # Backend (Node.js, Express, MongoDB, Mongoose, JWT, bcrypt)
│   ├── src/
│   │   ├── config/             # db.js (Dual Mongoose + resilient in-memory fallback layer)
│   │   ├── models/             # User.js, Scenario.js, SimulationRun.js
│   │   ├── controllers/        # authController, scenarioController, simulationController
│   │   ├── routes/             # authRoutes, scenarioRoutes, simulationRoutes
│   │   ├── middleware/         # auth.js (JWT validation), errorHandler.js
│   │   └── services/           # seedService.js (Campus facility seed data)
│   ├── .env.example
│   └── .env
└── package.json                # Root monorepo scripts
```

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new operator account (bcrypt hashed)
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/demo-login` — 1-Click instant demo login for hackathon judges
- `GET /api/auth/me` — Retrieve verified user profile

### Scenarios (`/api/scenarios`)
- `GET /api/scenarios` — List all spatial scenarios
- `GET /api/scenarios/:id` — Retrieve scenario by ID
- `POST /api/scenarios` — Create & persist new spatial scenario
- `PUT /api/scenarios/:id` — Update scenario properties
- `DELETE /api/scenarios/:id` — Delete scenario
- `POST /api/scenarios/:id/duplicate` — Clone scenario
- `POST /api/scenarios/:id/reset` — Reset environment state back to baseline

### Simulation Persistence (`/api/simulations`)
- `POST /api/simulations` — Store new simulation run results
- `GET /api/simulations` — List historical simulation runs
- `GET /api/simulations/:id` — Get simulation details
- `GET /api/simulations/compare?ids=a,b` — Multi-scenario comparison telemetry

---

## ⚡ Quick Start / Local Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Backend & Frontend
```bash
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Note: If a standalone MongoDB daemon is not running on your machine, PREVIA XR automatically boots an in-memory document store so all APIs and persistence work 100% out of the box with zero configuration!)*

---

## 🥽 XR Readiness & Future AI Integration

- **WebXR Ready**: Structured with distinct `SpatialScene`, `IndoorFloor`, and `CameraController` abstractions ready for WebXR hand tracking and immersive VR/AR headsets.
- **Local Deterministic Simulation**: The core simulation and A* pathfinding run offline in real time. Future AI endpoints (`/api/ai/analyze-consequence`) can be attached for natural-language safety reports without breaking the simulation loop.
