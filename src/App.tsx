import { FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuotesList from "./components/QuotesList";
import './App.css';

const queryClient = new QueryClient();

const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    <QuotesList />
  </QueryClientProvider>
)

export default App;
