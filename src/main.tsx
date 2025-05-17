import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { InvoiceProvider } from './context/InvoiceContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InvoiceProvider>
      <App />
    </InvoiceProvider>
  </StrictMode>
);