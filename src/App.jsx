// src/App.jsx
import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatPanel from './components/chat/ChatPanel';
import Dashboard from './pages/Dashboard';
import SalesPipeline from './pages/SalesPipeline';
import ClientsProjects from './pages/ClientsProjects';
import Analytics from './pages/Analytics';
import AILogs from './pages/AILogs';
import SOPs from './pages/SOPs';
import Settings from './pages/Settings';
import CahierDesCharges from './pages/CahierDesCharges';
import Login from './pages/Login';
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

// Global loading screen
function LoadingScreen() {
  return (
    <div className="flex h-screen bg-bg-dark items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm font-medium">Chargement OS1.0...</p>
      </div>
    </div>
  );
}

export default function App() {
  const route = getRouteInfo();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Supabase-backed data hooks
  const { clients, setClients, loading: clientsLoading, addClient, editClient, removeClient } = useClients();
  const { leads, setLeads, loading: leadsLoading, addLead, editLead, removeLead, moveLead } = useLeads();
  const { sops, setSops, loading: sopsLoading, addSop, editSop, removeSop } = useSops();
  const { aiLogs, setAiLogs, loading: aiLogsLoading, addAiLog, removeAiLog } = useAiLogs();

  useEffect(() => {
    // Check current session
    db.supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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
        const match = members.find(m => m.email === session.user.email);
        if (match) {
          setCurrentUser(match);
        } else {
          setCurrentUser({
            name: session.user.email.split('@')[0],
            role: 'Membre',
            initial: session.user.email.charAt(0).toUpperCase(),
            color: 'bg-accent',
            text_color: 'text-primary'
          });
        }
      });
    } else {
      setCurrentUser(null);
    }
  }, [session]);

  const isLoading = authLoading || (session && (clientsLoading || leadsLoading || sopsLoading || aiLogsLoading)) || (session && !currentUser);

  // Public cahier des charges route
  if (route.type === 'cahier') {
    const client = clients.find(c => c.slug === route.slug);
    const handleComplete = async (data) => {
      // Update client status in Supabase
      if (client) {
        await editClient(client.id, {
          cahier_completed: true,
          status: 'En Développement',
        });
      }
    };
    return (
      <CahierDesCharges
        clientSlug={route.slug}
        clientName={client?.name || route.slug}
        onComplete={handleComplete}
      />
    );
  }

  if (isLoading) return <LoadingScreen />;

  if (!session) return <Login />;

  const handleReplayPrompt = (query) => {
    setChatInitialMessage(query);
    setChatOpen(true);
    setActiveTab('AIChat');
  };

  const handleViewCahier = (client) => {
    window.open(`/cahier/${client.slug}`, '_blank');
  };

  const handleNewClient = () => {
    setActiveTab('Clients');
  };

  const handleChatMessageSent = async (message) => {
    try {
      await addAiLog({
        query: message,
        user_name: currentUser?.name || 'Ismael',
        category: 'Chat',
        status: 'Complété',
        tokens: 0,
      });
    } catch (e) {
      console.error('Failed to log AI message:', e);
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
      case 'Settings':
        return <Settings currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      default:
        return <Dashboard onNewClient={handleNewClient} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-dark text-white overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={() => db.signOut()}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onChatToggle={() => setChatOpen(prev => !prev)}
          chatOpen={chatOpen}
          activeTab={activeTab}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
          {renderPage()}
        </main>
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialMessage={chatInitialMessage}
        onMessageSent={handleChatMessageSent}
        currentUser={currentUser}
      />
    </div>
  );
}
