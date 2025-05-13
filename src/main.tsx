
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SidebarProvider } from '@/components/ui/sidebar'

createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <App />
  </SidebarProvider>
);
