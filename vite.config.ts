import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [vue()],
    base: process.env.GITHUB_ACTIONS === 'true' && repositoryName ? `/${repositoryName}/` : '/',
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
