# PLAYNEXUS

> **THE AI THAT LEARNS HOW YOU FIGHT.**
> *Fight. Learn. Adapt. Dominate.*

PLAYNEXUS is an anime-cyberpunk 3D web fighting game built for the CodeMania hackathon. An adaptive AI opponent observes the player's fighting style, records their combat habits into a **Fighting DNA** profile, and evolves dynamic counter-strategies in real time.

---

## ⚡ Core Loop

$$\text{FIGHT} \longrightarrow \text{OBSERVE} \longrightarrow \text{LEARN} \longrightarrow \text{ADAPT} \longrightarrow \text{COUNTER} \longrightarrow \text{EVOLVE}$$

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite 8
* **3D Game Engine**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
* **State Management**: Zustand
* **Routing**: React Router (`react-router-dom` v7)
* **Styling & FX**: Tailwind CSS, Framer Motion, Canvas Confetti, Lucide Icons

---

## 🎮 Game Screens & Features

1. **Login Gateway (`/login`)**:
   - Dark cyberpunk AI core with rotating telemetry rings and mouse parallax.
   - Glassmorphism authentication panel with 1-Click Judge Quick Access.
   - Cinematic `AUTHENTICATING...` $\rightarrow$ `ACCESS GRANTED` sequence.
2. **Command Dashboard (`/`)**:
   - Full-screen React Three Fiber 3D background with two animated fighter silhouettes.
   - Live AI analysis telemetry HUD & Fighting DNA quotient sliders.
   - Real-world AI feature teasers (Web Speech API, MediaPipe Vision, OpenAI engine).
   - Direct `START FIGHT →` CTA.
3. **Character / Fighting Style Selection (`/character-select`)**:
   - 6 Fighting style cards: **MELEE** (Playable), Archery, Wrestling, Sword, Defense, and Classified Locked archetype.
   - 3D interactive rotating player preview model.
4. **Pre-Fight Staging Lobby (`/pre-fight`)**:
   - Player Card vs AI Opponent Card with personality and intelligence status.
   - Sector 07 Tokyo Neon Ruins arena briefing.
   - Real-world AI vision simulator: `SCAN ROOM FOR WEAPON` (e.g. *Book detected $\rightarrow$ Tome of Wisdom*).
   - Cinematic countdown warp into the arena.
5. **3D Combat Arena (`/arena`)**:
   - Playable 3D combat stage with circular boundary clamping.
   - Third-person following camera.
   - Smooth **WASD** movement.
   - Melee combat: **J** (Attack), **K** (Block), **SPACE** (Dodge).
   - Dynamic combo counter (`COMBO x1`, `COMBO x2`, `COMBO x3` critical strikes).
   - AI opponent tracking and attacks.
   - Real-time HP gauges, hit sparks, and Victory/Defeat overlays.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* npm (v9+)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/suwarnathakur/algocrafters.git
cd algocrafters

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Build Verification

```bash
npm run build
```
