import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NovaShell } from '@/components/nova-shell';
import {
  AlarmsPage, CalendarPage, CountdownPage, HomePage, ProfilePage,
  SettingsPage, StopwatchPage, TimerPage, WorldClockPage,
} from '@/pages/nova-pages';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <NovaShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/alarms" component={AlarmsPage} />
          <Route path="/stopwatch" component={StopwatchPage} />
          <Route path="/timer" component={TimerPage} />
          <Route path="/world-clock" component={WorldClockPage} />
          <Route path="/countdown" component={CountdownPage} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </NovaShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;