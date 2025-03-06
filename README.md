# Lottie Animation Player Project

## Project Overview
A React-based Lottie animation player that provides a flexible and reusable component for displaying and controlling Lottie animations. Built with React, TypeScript, and Vite, this project offers a robust solution for implementing Lottie animations in web applications.

## Technologies Used
- React 
- TypeScript
- Vite
- Lottie-web
- ESLint
- Tailwind CSS (for styling)

## Features
- Customizable animation playback
- Animation control methods (play, pause, stop)
- Frame navigation
- Loop control
- Autoplay support
- Multiple renderer options (SVG, Canvas, HTML)
- Event handling for animation loading and completion

## Component Documentation

### LottieWeb Component

#### Props Interface
```typescript
interface LottieWebProps {
  src?: string;              // URL of the Lottie animation JSON
  onLoad?: (container?: HTMLDivElement | null) => void;  // Callback when animation loads
  onComplete?: () => void;   // Callback when animation completes
  loop?: boolean;            // Controls if animation should loop
  autoplay?: boolean;        // Controls if animation should autoplay
  renderer?: "svg" | "canvas" | "html";  // Animation renderer type
}