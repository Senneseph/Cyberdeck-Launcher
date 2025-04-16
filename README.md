# Cyberdeck Launcher

A modern, lightweight application launcher for the Cyberdeck ecosystem.

## Overview

Cyberdeck Launcher is a PWA-launch windowing system with pre-installed apps, designed to provide a seamless user experience for accessing Cyberdeck applications. It serves as the primary interface for users to interact with the Cyberdeck ecosystem.

## Features

- Modern, responsive UI based on the jellicule component library
- Seamless integration with CyberdeckOS
- Application management and organization
- Customizable layouts and themes
- Real-time notifications and updates
- Offline support

## Project Structure

```
/
├── app/                # Application source code
│   ├── src/            # Source files
│   │   ├── components/ # UI components
│   │   ├── services/   # Application services
│   │   ├── styles/     # CSS styles
│   │   └── utils/      # Utility functions
│   └── public/         # Public assets
├── cicd/               # CI/CD configuration
├── develop/            # Development utilities
├── dist/               # Distribution files
└── docs/               # Documentation
```

## Development

### Prerequisites

- Node.js 16+
- Docker (optional, for containerized development)

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to `http://localhost:8080`

## Integration with CyberdeckOS

Cyberdeck Launcher interfaces with CyberdeckOS, which provides privileged system access. The launcher itself has no direct GUI but its settings are viewable in the Cyberdeck Launcher app.

## Design Philosophy

The UI design philosophy is modeled after WebOS, providing a clean, intuitive interface that works well on various device form factors.

## License

MIT License
