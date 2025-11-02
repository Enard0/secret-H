import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd()+"/../")};
  return defineConfig({
    plugins: [react()],
    envDir: "../",
    server: {
      port: process.env.VITE_FRONT_PORT,
      host: process.env.VITE_DEBUG || "localhost",
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.VITE_BACK_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  })};