import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from './LanguageSelector';
import { TranslationProvider } from '../contexts/TranslationContext';

// Wrapper pour les tests avec le contexte de traduction
const TestWrapper = ({ children }) => (
  <TranslationProvider>
    {children}
  </TranslationProvider>
);

test('renders language selector with all three languages', () => {
  render(
    <TestWrapper>
      <LanguageSelector />
    </TestWrapper>
  );
  
  const selector = screen.getByRole('combobox');
  expect(selector).toBeInTheDocument();
  
  // Vérifier que les 3 langues sont présentes
  expect(screen.getByText('Français')).toBeInTheDocument();
  expect(screen.getByText('Deutsch')).toBeInTheDocument();
  expect(screen.getByText('Italiano')).toBeInTheDocument();
});

test('changes language when option is selected', () => {
  render(
    <TestWrapper>
      <LanguageSelector />
    </TestWrapper>
  );
  
  const selector = screen.getByRole('combobox');
  fireEvent.change(selector, { target: { value: 'de' } });
  
  expect(selector.value).toBe('de');
});

test('has proper accessibility attributes', () => {
  render(
    <TestWrapper>
      <LanguageSelector />
    </TestWrapper>
  );
  
  const selector = screen.getByRole('combobox');
  expect(selector).toHaveAttribute('aria-label');
  expect(selector).toHaveAttribute('title');
});
