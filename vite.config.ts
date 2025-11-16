import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-info'

const isProd = process.env['BUILD_MODE'] === 'prod'
export default defineConfig({
  plugins: [
    react({
      // 优化 JSX 运行时
      jsxRuntime: 'automatic',
    }),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 生产构建优化
    target: 'esnext',
    minify: 'terser',
    sourcemap: !isProd,
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-select'],
          utils: ['clsx', 'tailwind-merge', 'lucide-react']
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化资源大小
    assetsInlineLimit: 4096, // 4KB 以下的资源内联
    chunkSizeWarningLimit: 1000,
  },
  // 开发服务器优化
  server: {
    hmr: {
      overlay: false, // 减少开发时的错误遮罩
    },
    fs: {
      strict: false, // 允许访问更多文件
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@vercel/analytics']
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: true
  }
})

