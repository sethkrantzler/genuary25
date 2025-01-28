import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

// https://vite.dev/config/
export default defineConfig({
  base: '/toy/',
  plugins: [
    react(),
    glsl() // Add the GLSL plugin here
  ],
});
