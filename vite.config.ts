import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 React 계열을 별도 청크로 분리해 브라우저 캐시를 재사용한다.
        // Firebase는 수동으로 묶지 않는다: 묶으면 auth와 공유하는 @firebase/app·util 때문에
        // Firestore까지 로그인 화면에 딸려 온다. 동적 import(React.lazy) 경계에 맡기면
        // Firestore는 할 일 화면 청크로만 분리된다.
        advancedChunks: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
