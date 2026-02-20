import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans text-slate-200">
                    <div className="max-w-2xl w-full bg-[#1e293b] rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="bg-red-500/10 p-6 border-b border-red-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                                <ShieldAlert size={32} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Une erreur critique est survenue</h1>
                                <p className="text-red-400 text-sm mt-1">L'application a rencontré un problème inattendu.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 font-mono text-xs overflow-auto max-h-64 custom-scrollbar">
                                <p className="text-red-400 font-bold mb-2">{this.state.error?.toString()}</p>
                                <pre className="text-slate-500">{this.state.errorInfo?.componentStack}</pre>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    onClick={this.handleReload}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-green-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    <RefreshCw size={18} />
                                    Recharger l'application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
