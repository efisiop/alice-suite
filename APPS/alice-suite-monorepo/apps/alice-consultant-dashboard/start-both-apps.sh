#!/bin/bash

# Start the WebSocket server in the background
npm run start-ws &

# Start the Vite development server
npm run dev

# Wait for all background processes to finish (optional, depending on desired behavior)
wait