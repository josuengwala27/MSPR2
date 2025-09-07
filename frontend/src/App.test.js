import { render, screen } from '@testing-library/react';
import App from './App';

test('renders OMS COVID & MPOX application', () => {
  render(<App />);
  const brandElement = screen.getByText(/OMS COVID & MPOX/i);
  expect(brandElement).toBeInTheDocument();
});

test('renders language selector', () => {
  render(<App />);
  const languageSelector = screen.getByRole('combobox');
  expect(languageSelector).toBeInTheDocument();
});

test('renders dashboard content', () => {
  render(<App />);
  const dashboardTitle = screen.getByText(/Surveillance et analyse en temps réel/i);
  expect(dashboardTitle).toBeInTheDocument();
});
