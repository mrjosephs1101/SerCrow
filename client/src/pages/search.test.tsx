import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Search from './search';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('Search', () => {
  it('renders the search button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Search />
      </QueryClientProvider>
    );
    expect(screen.getByText('SerCrow Search')).toBeInTheDocument();
  });
});

