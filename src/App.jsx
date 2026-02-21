// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatPanel from './components/chat/ChatPanel';
import Dashboard from './pages/Dashboard';
import SalesPipeline from './pages/SalesPipeline';
import BillingView from './pages/BillingView';
import ClientsProjects from './pages/ClientsProjects';
import Analytics from './pages/Analytics';
import AILogs from './pages/AILogs';
import SOPs from './pages/SOPs';
import Settings from './pages/Settings';
import Tools from './pages/Tools';
import CahierDesCharges from './pages/CahierDesCharges';
import ClientPortfolio from './pages/ClientPortfolio';
import Login from './pages/Login';
import { AddClientModal } from './features/clients/components/AddClientModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { useClients } from './hooks/useClients';
import { useLeads } from './hooks/useLeads';
import { useSops } from './hooks/useSops';
import { useAiLogs } from './hooks/useAiLogs';
import * as db from './services/supabase';
import { MOCK_CURRENT_USER } from './data/constants';

// Simple client-side routing for the public cahier des charges page
function getRouteInfo() {
  const path = window.location.pathname;
  const match = path.match(/^\/cahier\/(.+)$/);
  if (match) return { type: 'cahier', slug: match[1] };
  return { type: 'app' };
}

import { LoadingScreen } from './components/ui';

export default function App() {
  const route = getRouteInfo();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Supabase-backed data hooks
  const { clients, setClients, addClient, editClient, removeClient } = useClients();
  const { leads, setLeads, addLead, editLead, removeLead, moveLead } = useLeads();
  const { sops, setSops, addSop, editSop, removeSop } = useSops();
  const { aiLogs, setAiLogs, addAiLog, removeAiLog } = useAiLogs();

  const handleReplayPrompt = useCallback((query) => {
    setChatInitialMessage(query);
    setChatOpen(true);
    setActiveTab('AIChat');
  }, []);

  const handleViewCahier = useCallback((client) => {
    window.open(`/cahier/${client.slug}`, '_blank');
  }, []);

  const handleNewClient = useCallback(() => {
    setIsAddClientModalOpen(true);
  }, []);

  useEffect(() => {
    // Check current session with timeout guard
    const authTimeout = setTimeout(() => {
      console.warn("Auth timeout reached, forcing load");
      setAuthLoading(false);
    }, 5000);

    db.supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(authTimeout);
      setSession(session);
      setAuthLoading(false);
    }).catch(err => {
      console.error("Auth session error:", err);
      clearTimeout(authTimeout);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = db.supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Find team member by email or use defaults from metadata
      db.getTeamMembers().then(members => {
        const match = Array.isArray(members) ? members.find(m => m.email === session.user.email) : null;
        if (match) {
          setCurrentUser(match);
        } else {
          setCurrentUser({
            name: session.user.email.split('@')[0],
            role: 'Membre',
            roleId: 'admin', // Default to admin for now to allow dashboard access
            initial: session.user.email.charAt(0).toUpperCase(),
            color: 'bg-accent',
            text_color: 'text-primary'
          });
        }
      }).catch(err => {
        console.error("Failed to fetch team members:", err);
        setCurrentUser({
          name: session.user.email.split('@')[0],
          role: 'Membre (Fallback)',
          roleId: 'admin', // Fallback to admin
          initial: '?',
          color: 'bg-slate-500',
          text_color: 'text-white'
        });
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(null);
    }
  }, [session]);

  // Progressive Loading: Don't block the whole UI frame
  // We only wait for auth session to decide between Login or App
  if (authLoading) return <LoadingScreen message="Vérification de l'identité..." />;

  const handleCahierComplete = async () => {
    const client = clients.find(c => c.slug === route.slug);
    if (client) {
      await editClient(client.id, {
        cahier_completed: true,
        status: 'En Développement',
      });
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard onNewClient={handleNewClient} currentUser={currentUser} />;
      case 'Sales':
        return (
          <SalesPipeline
            leads={leads}
            setLeads={setLeads}
            onAddLead={addLead}
            onEditLead={editLead}
            onDeleteLead={removeLead}
            onMoveLead={moveLead}
          />
        );
      case 'Billing':
        return <BillingView />;
      case 'Portfolio':
        return <ClientPortfolio onEditClient={editClient} onNewClient={handleNewClient} />;
      case 'Clients':
        return (
          <ClientsProjects
            clients={clients}
            setClients={setClients}
            onAddClient={addClient}
            onEditClient={editClient}
            onDeleteClient={removeClient}
            onViewCahier={handleViewCahier}
            currentUser={currentUser}
            onNewClient={handleNewClient}
          />
        );
      case 'Analytics':
        return <Analytics />;
      case 'AIChat':
        return (
          <AILogs
            logs={aiLogs}
            setLogs={setAiLogs}
            onAddLog={addAiLog}
            onDeleteLog={removeAiLog}
            onReplay={handleReplayPrompt}
          />
        );
      case 'SOPs':
        return (
          <SOPs
            sops={sops}
            setSops={setSops}
            onAddSop={addSop}
            onEditSop={editSop}
            onDeleteSop={removeSop}
          />
        );
      case 'Tools':
        return <Tools onAddLog={addAiLog} />;
      case 'Settings':
        return <Settings currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      default:
        return <Dashboard onNewClient={handleNewClient} currentUser={currentUser} />;
    }
  };

  return (
    <ThemeProvider>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAdd={addClient}
        currentUser={currentUser}
      />
      {route.type === 'cahier' ? (
        <CahierDesCharges
          clientSlug={route.slug}
          clientName={clients.find(c => c.slug === route.slug)?.name || route.slug}
          onComplete={handleCahierComplete}
        />
      ) : !session ? (
        <Login />
      ) : (
        <div className="flex min-h-screen bg-white dark:bg-bg-dark text-slate-900 dark:text-white font-body transition-colors duration-300 overflow-x-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentUser={currentUser}
            onLogout={() => db.signOut()}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onChatToggle={() => setChatOpen(prev => !prev)}
              chatOpen={chatOpen}
              activeTab={activeTab}
              currentUser={currentUser}
            />

            <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-hidden">
              {renderPage()}
            </main>
          </div>

          <ChatPanel
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            initialMessage={chatInitialMessage}
            currentUser={currentUser}
            onNavigate={setActiveTab}
          />
        </div>
      )}
    </ThemeProvider>
  );
}
