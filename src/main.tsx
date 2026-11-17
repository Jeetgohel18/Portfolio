import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource-variable/instrument-sans/wght-italic.css';
import App from './App';
import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/case.css';
import './styles/pages.css';
import './styles/fx.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
