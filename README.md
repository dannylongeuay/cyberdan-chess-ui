# cyberdan-chess-ui

A chess web application built with React, TypeScript, and TailwindCSS. Communicates with a backend API for move validation and game state management.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- Click and drag-and-drop piece movement
- Legal move indicators (dots for empty squares, rings for captures)
- Check, checkmate, and stalemate detection with visual highlighting
- Pawn promotion dialog
- Last move highlighting
- Game status display with turn indicator
- New game button to reset the board

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5.9** — Type safety
- **Vite 8** — Build tool and dev server
- **TailwindCSS 4** — Utility-first styling
- **Bun** — Package manager and runtime
- **Nginx** — Production static file server (Docker)

## Prerequisites

- [Bun](https://bun.sh/) v1+

Or, if you use Nix:

- [Nix](https://nixos.org/) with flakes enabled
- [direnv](https://direnv.net/) (optional, for automatic shell activation)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/cyberdan/cyberdan-chess-ui.git
cd cyberdan-chess-ui

# Install dependencies
bun install

# Configure the API URL (defaults to http://localhost:8080)
# Edit .env to change:
#   VITE_API_URL=http://localhost:8080

# Start the dev server
bun run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `bun run dev`     | Start the Vite dev server with HMR       |
| `bun run build`   | Type-check with `tsc` and build for prod |
| `bun run lint`    | Lint the codebase with ESLint            |
| `bun run preview` | Preview the production build locally     |

## Project Structure

```
src/
├── api/
│   ├── client.ts          # API client (fetch wrapper)
│   └── types.ts           # Request/response type definitions
├── assets/
│   └── pieces/
│       ├── index.ts       # Piece SVG re-exports
│       └── *.svg          # Chess piece SVGs (wK, wQ, bN, etc.)
├── components/
│   ├── Board.tsx          # Chessboard grid with drag-and-drop
│   ├── Square.tsx         # Individual square rendering
│   ├── Piece.tsx          # Piece image component
│   ├── GameInfo.tsx       # Turn indicator and game status
│   ├── PromotionDialog.tsx# Pawn promotion piece picker
│   └── NewGameButton.tsx  # Reset game button
├── hooks/
│   └── useChessGame.ts    # Core game logic and state management
├── types/
│   └── chess.ts           # Domain types (Board, Piece, etc.)
├── utils/
│   ├── fen.ts             # FEN string parsing utilities
│   └── squares.ts         # Square coordinate helpers
├── App.tsx                # Root component
├── main.tsx               # Entry point
└── index.css              # Global styles and Tailwind imports
```

## API

The app expects a backend API serving two POST endpoints. Configure the base URL via the `VITE_API_URL` environment variable.

### `POST /validmoves`

Returns all legal moves for a given position.

**Request:**

```json
{ "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }
```

**Response:**

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "side_to_move": "white",
  "status": "ongoing",
  "move_count": 20,
  "moves": [
    {
      "uci": "e2e4",
      "san": "e4",
      "from": "e2",
      "to": "e4",
      "capture": false,
      "promotion": null,
      "castling": false,
      "check": false
    }
  ]
}
```

### `POST /submitmove`

Submits a move and returns the resulting position.

**Request:**

```json
{ "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "move": "e2e4" }
```

**Response:**

```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "san": "e4",
  "status": "ongoing",
  "side_to_move": "black"
}
```

### Status Values

`status` is one of: `ongoing`, `checkmate`, `stalemate`, `fifty_move_rule`, `insufficient_material`.

## Docker

The Docker image builds the app with Bun and serves it with Nginx.

### Build

```bash
docker build -t cyberdan-chess-ui .
```

### Run

```bash
docker run -p 8080:80 cyberdan-chess-ui
```

The app will be available at `http://localhost:8080`.

## Development Environment

This project includes a [Nix flake](flake.nix) that provides Bun in a reproducible dev shell.

### With direnv (recommended)

```bash
# Allow the .envrc (one-time)
direnv allow

# Bun is now available automatically when you cd into the project
bun --version
```

### Without direnv

```bash
nix develop
```

## CI/CD

The [release-and-publish](.github/workflows/release-and-publish.yml) workflow runs on every push to `main`:

1. **Release** — [semantic-release](https://github.com/semantic-release/semantic-release) analyzes commits and creates a GitHub release with a semantic version tag
2. **Docker publish** — If a new release was created, builds a multi-platform Docker image (`linux/amd64`, `linux/arm64`) and pushes it to GitHub Container Registry (`ghcr.io`)

Image tags: `latest`, `<version>`, `<major>.<minor>`, `main-<sha>`
