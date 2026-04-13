# svelte-chat

A realtime peer-to-peer chat application built with [Svelte](https://svelte.dev/), [Express](https://expressjs.com/), and [Socket.io](https://socket.io/).

When a user opens the app, a random identity is fetched from the [Random User API](https://randomuser.me/). All connected users appear in a buddies list, and any two users can open a private chat window and exchange messages in real time. A typing indicator shows when the other person is actively composing a message.

## Features

- Random user identity on each session (no registration required)
- Live buddies list showing who is online/offline
- Private one-to-one messaging over WebSockets
- Typing/keyboard activity indicator
- Sound notifications for incoming messages

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Svelte 3, Socket.io-client, Lodash  |
| Backend  | Node.js, Express, Socket.io         |
| Bundler  | Rollup with livereload in dev mode  |

## Prerequisites

- Node.js >= 12.14.1
- npm

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd svelte-chat

# Install dependencies
npm install
```

## Running the App

### Development (with hot reload)

Start the backend server and the Svelte dev build in two separate terminals:

**Terminal 1 — backend server (port 4000):**
```bash
node server.js
```

**Terminal 2 — frontend dev build (port 5000, with livereload):**
```bash
npm run dev
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

### VS Code

A compound launch configuration is included. Open the **Run and Debug** panel (`Ctrl+Shift+D`) and select **Server + Frontend**, then press **F5**. This starts both the backend server and the Rollup watch process simultaneously.

### Production

Build the frontend bundle and serve everything from the Express server:

```bash
npm run build
node server.js
```

The app will be available at [http://localhost:4000](http://localhost:4000).

## Project Structure

```
├── server.js          # Express + Socket.io backend
├── rollup.config.js   # Rollup bundler configuration
├── public/            # Static assets and built bundle
│   ├── index.html
│   ├── global.css
│   ├── images/
│   └── sounds/
└── src/
    ├── main.js        # Svelte entry point
    ├── App.svelte     # Root component, socket event handling
    ├── store.js       # Svelte writable store (app state)
    └── components/    # UI components
```
