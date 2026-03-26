import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This file tells Vite to load your .env variables
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    server: {
        watch: {
            usePolling: true,
        }
    }
})