import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { TranslationProvider } from '../contexts/TranslationContext';

// Wrapper pour les tests avec le contexte de traduction
const TestWrapper = ({ children }) => (
  <TranslationProvider>
    {children}
  </TranslationProvider>
);

test('renders dashboard with main sections', () => {
  render(
    <TestWrapper>
      <Dashboard />
    </TestWrapper>
  );
  
  // Vérifier les sections principales
  expect(screen.getByText(/Surveillance et analyse en temps réel/i)).toBeInTheDocument();
  expect(screen.getByText(/Analyses et Tendances/i)).toBeInTheDocument();
  expect(screen.getByText(/Performance des Modèles IA/i)).toBeInTheDocument();
});

test('renders disease selector buttons', () => {
  render(
    <TestWrapper>
      <Dashboard />
    </TestWrapper>
  );
  
  // Vérifier les boutons de sélection de maladie
  expect(screen.getByText(/COVID-19/i)).toBeInTheDocument();
  expect(screen.getByText(/MPOX/i)).toBeInTheDocument();
});

test('renders risk map with legend', () => {
  render(
    <TestWrapper>
      <Dashboard />
    </TestWrapper>
  );
  
  // Vérifier la légende de la carte des risques
  expect(screen.getByText(/Risque Élevé/i)).toBeInTheDocument();
  expect(screen.getByText(/Risque Modéré/i)).toBeInTheDocument();
  expect(screen.getByText(/Risque Faible/i)).toBeInTheDocument();
  expect(screen.getByText(/Très Faible/i)).toBeInTheDocument();
});

test('has proper accessibility attributes', () => {
  render(
    <TestWrapper>
      <Dashboard />
    </TestWrapper>
  );
  
  // Vérifier les attributs d'accessibilité
  const diseaseSelector = screen.getByRole('radiogroup');
  expect(diseaseSelector).toHaveAttribute('aria-label');
});
