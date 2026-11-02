import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      env.VITE_SUPABASE_URL || 'https://zfacsflgjdfuecothkum.supabase.co',
    ),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
      env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_lMtgTBvL_FO4k4xHeKOJXw_mTg1L1tH',
    ),
    'import.meta.env.JWT': JSON.stringify(env.JWT),
  },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
