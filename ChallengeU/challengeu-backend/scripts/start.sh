#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Start the application using Nodemon for automatic restarts
npx nodemon src/index.ts