import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Server, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface WebhookLog {
  id: string;
  method: string;
  source: string;
  status: number;
  payload: any;
  response: any;
  createdAt: any;
}

const Integrations: React.FC = () => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Lógica de URL Inteligente:
  // Se estiver em DEV (Vite), assume localhost:3001.
  // Se estiver em PROD (Docker/Easypanel), usa a própria URL do site (window.location.origin).
  const getBaseUrl = () => {
    if ((import.meta as any).env.DEV) {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  };

  const webhookUrl = currentUser 
    ? `${getBaseUrl()}/webhook/${currentUser.uid}` 
    : 'Carregando...';

  useEffect(() => {
    if (!currentUser) return;

    // Escutar logs em tempo real do Firestore
    const q = query(
      collection(db, 'users', currentUser.uid, 'webhook_logs'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WebhookLog[];
      setLogs(loadedLogs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (status >= 400) return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  return (
    <div className="p-8 ml-64 min-h-screen animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Integrações</h1>
        <p className="text-slate-400">Conecte sua clínica a ferramentas externas via Webhook</p>
      </header>

      {/* Endpoint Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/5 p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-primary-400" /> Endpoint da Sua Clínica
        </h2>
        
        {(import.meta as any).env.DEV && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm text-yellow-200">
                  <p className="font-bold">Modo Desenvolvimento</p>
                  <p className="opacity-80 mt-1">
                    Certifique-se de que o backend está rodando em <code>npm run server</code>.
                  </p>
              </div>
          </div>
        )}

        <p className="text-slate-400 mb-4 text-sm">
          Este é o seu endpoint exclusivo.
          <br />
          <span className="text-xs text-slate-500">
            A requisição deve ser do tipo <strong>POST</strong> e conter um corpo <strong>JSON</strong>.
          </span>
        </p>

        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <code className="flex-1 text-primary-300 font-mono text-sm break-all">
              {webhookUrl}
            </code>
            <button
              onClick={copyToClipboard}
              className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Copiar URL"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          {copied && <span className="absolute -bottom-6 right-0 text-xs text-emerald-400">Copiado para área de transferência!</span>}
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/30">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" />
              Logs de Webhooks Recebidos
            </h2>
            <p className="text-xs text-slate-500 mt-1">Monitoramento em tempo real via Firestore</p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-3">
                <Server className="h-8 w-8 text-slate-600" />
              </div>
              <p>Nenhum webhook recebido ainda.</p>
              <p className="text-xs mt-2 text-slate-600">
                Teste enviando um POST para a URL acima.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="transition-colors hover:bg-white/[0.02]">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${log.status >= 200 && log.status < 300 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {log.status >= 200 && log.status < 300 ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.method}</span>
                        <span className="text-slate-400 text-sm">• {log.source}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Processando...'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <button className="text-slate-500 hover:text-white transition-colors">
                      {expandedLog === log.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {expandedLog === log.id && (
                  <div className="px-4 pb-4 bg-slate-950/30 border-t border-white/5 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payload (Recebido)</label>
                        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-x-auto custom-scrollbar">
                          <pre className="text-xs text-blue-300 font-mono">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resposta (Enviada)</label>
                        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-x-auto custom-scrollbar">
                          <pre className="text-xs text-emerald-300 font-mono">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Integrations;