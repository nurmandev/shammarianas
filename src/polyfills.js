import { Buffer } from 'buffer'

// Add Buffer to the global scope
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}

// Optional: Add other polyfills if needed
if (!globalThis.process) {
  globalThis.process = { env: {}, browser: true }
}