import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { restoreSession } from './features/auth/session';
import { useAuthStore } from './features/auth/useAuthStore';
import { usePrefsStore } from './store/usePrefsStore';
import './index.css';

// Rouvre l'espace personnel de la dernière session avant le premier affichage.
void restoreSession().finally(() => {
  // Mode discret : l'espace rouvert reste verrouillé jusqu'à la saisie du code secret.
  if (useAuthStore.getState().currentUserId) usePrefsStore.getState().lock();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
