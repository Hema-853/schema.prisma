import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';

// Mock fetch
global.fetch = vi.fn();

describe('File Upload', () => {
  it('should show file upload button', () => {
    render(<Home />);
    expect(screen.getByText(/upload .txt .md/i)).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockResponse = { id: '123', title: 'test' };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<Home />);
    const fileInput = screen.getByLabelText(/upload .txt .md/i);
    
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object));
    });
  });
});