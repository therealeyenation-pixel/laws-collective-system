import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './Home';

// Mock the dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>
}));

vi.mock('@/const', () => ({
  getLoginUrl: () => 'http://login.example.com'
}));

describe('Home Landing Page', () => {
  it('renders the hero section with title', () => {
    render(<Home />);
    expect(screen.getByText('The The The L.A.W.S. Collective')).toBeInTheDocument();
  });

  it('renders the tagline with colored letters', () => {
    render(<Home />);
    expect(screen.getByText(/Land/)).toBeInTheDocument();
    expect(screen.getByText(/Air/)).toBeInTheDocument();
    expect(screen.getByText(/Water/)).toBeInTheDocument();
    expect(screen.getByText(/Self/)).toBeInTheDocument();
  });

  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('A Sovereign Wealth Management & Trust Administration Platform')).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    render(<Home />);
    expect(screen.getByText(/We are building a sovereign wealth management/)).toBeInTheDocument();
  });

  it('renders the QR code image', () => {
    render(<Home />);
    const qrImage = screen.getByAltText('QR Code');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', '/qr-code.png');
  });

  it('renders the founder photo', () => {
    render(<Home />);
    const founderPhoto = screen.getByAltText('La Shanna K. Russell');
    expect(founderPhoto).toBeInTheDocument();
  });

  it('renders all major section titles', () => {
    render(<Home />);
    expect(screen.getByText('See What We\'re Building')).toBeInTheDocument();
    expect(screen.getByText('Education Simulators')).toBeInTheDocument();
    expect(screen.getByText('Interactive System Demo')).toBeInTheDocument();
    expect(screen.getByText('Business Simulators')).toBeInTheDocument();
    expect(screen.getByText('Academy & Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Community Network')).toBeInTheDocument();
    expect(screen.getByText('Trust Management')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Community Wealth Multiplier')).toBeInTheDocument();
    expect(screen.getByText('LuvLedger')).toBeInTheDocument();
    expect(screen.getByText('The L.A.W.S. Framework')).toBeInTheDocument();
    expect(screen.getByText('What\'s Coming')).toBeInTheDocument();
  });

  it('renders the About Luv section with founder name', () => {
    render(<Home />);
    expect(screen.getByText('About Luv')).toBeInTheDocument();
    expect(screen.getByText('La Shanna K. Russell (Luv)')).toBeInTheDocument();
  });

  it('renders the L.A.W.S. Framework pillars', () => {
    render(<Home />);
    expect(screen.getByText(/LAND/)).toBeInTheDocument();
    expect(screen.getByText(/AIR/)).toBeInTheDocument();
    expect(screen.getByText(/WATER/)).toBeInTheDocument();
    expect(screen.getByText(/SELF/)).toBeInTheDocument();
  });

  it('renders the waitlist section', () => {
    render(<Home />);
    expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
    expect(screen.getByText('Be among the first to access The The The L.A.W.S. Collective')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<Home />);
    expect(screen.getByText(/© 2026 The The The L.A.W.S. Collective/)).toBeInTheDocument();
  });
});
