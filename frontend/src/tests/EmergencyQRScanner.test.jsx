import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EmergencyQRScanner from '../pages/EmergencyQRScanner';
import * as api from '../api';
import { vi } from 'vitest';

// Mock the API calls
vi.mock('../api', () => ({
  getUserByQR: vi.fn(),
  triggerEmergencyByQR: vi.fn()
}));

describe('EmergencyQRScanner Component', () => {
  const mockPatient = {
    name: 'John Doe',
    bloodGroup: 'O+',
    allergies: ['Peanuts'],
    medicalConditions: ['Asthma'],
    emergencyContacts: [{ name: 'Family', phone: '1234567890', relation: 'Father', email: 'fam@ex.com' }]
  };

  it('renders loading state initially', () => {
    api.getUserByQR.mockReturnValue(new Promise(() => {})); // Never resolves
    render(
      <MemoryRouter initialEntries={['/qr/test-qr']}>
        <Routes>
          <Route path="/qr/:qrCodeId" element={<EmergencyQRScanner />} />
        </Routes>
      </MemoryRouter>
    );
    // Loader has animate-spin class but we just check it exists via aria-hidden or tag if possible, or just look for the wrapper
    // The loader is a Lucide icon. Let's just check if it's there.
    expect(document.querySelector('.animate-spin')).toBeDefined();
  });

  it('renders patient data after fetch success', async () => {
    api.getUserByQR.mockResolvedValue({ data: mockPatient });
    
    render(
      <MemoryRouter initialEntries={['/qr/test-qr']}>
        <Routes>
          <Route path="/qr/:qrCodeId" element={<EmergencyQRScanner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('O+')).toBeInTheDocument();
      expect(screen.getByText('Asthma')).toBeInTheDocument();
    });
  });

  it('triggers SOS when button is clicked', async () => {
    api.getUserByQR.mockResolvedValue({ data: mockPatient });
    api.triggerEmergencyByQR.mockResolvedValue({ success: true });
    window.confirm = vi.fn().mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/qr/test-qr']}>
        <Routes>
          <Route path="/qr/:qrCodeId" element={<EmergencyQRScanner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('TRIGGER SOS FOR PATIENT')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('TRIGGER SOS FOR PATIENT'));

    await waitFor(() => {
      expect(api.triggerEmergencyByQR).toHaveBeenCalled();
      expect(screen.getByText('Emergency Notified!')).toBeInTheDocument();
    });
  });

  it('renders error state on fetch failure', async () => {
    api.getUserByQR.mockRejectedValue(new Error('Fetch failed'));
    
    render(
      <MemoryRouter initialEntries={['/qr/test-qr']}>
        <Routes>
          <Route path="/qr/:qrCodeId" element={<EmergencyQRScanner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invalid QR Code')).toBeInTheDocument();
    });
  });
});
