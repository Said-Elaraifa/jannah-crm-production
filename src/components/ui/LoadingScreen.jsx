export function LoadingScreen({ message = "Chargement OS1.0..." }) {
    return (
        <div className="flex h-screen bg-[#0b141d] items-center justify-center">
            <div className="text-center animate-fade-in">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
                    </div>
                </div>
                <p className="text-white font-display font-bold text-lg tracking-tight mb-2">{message}</p>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Initialisation des protocoles...</p>
            </div>
        </div>
    );
}
