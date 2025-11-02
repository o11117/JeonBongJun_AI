// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // 1. Spring Boot 백엔드 API (포트 8080)
            '/api': {
                target: 'http://localhost:8080', // Spring Boot 서버
                changeOrigin: true,
            },

            // 2. AI 서버 API (포트 8001)
            '/ai': {
                target: 'http://127.0.0.1:8000', // Python AI 서버
                changeOrigin: true,
            }
        }
    }
})