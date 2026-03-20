import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  preview: {
    port: parseInt(process.env.PORT, 10) || 8080,
    host: true,
    allowedHosts: true,
  },
});
