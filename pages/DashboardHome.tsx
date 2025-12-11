import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Patient, Deal } from '../types';

const StatCard: React.FC<{
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}> = ({ title, value, trend, icon: Icon, color, glowColor }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${glowColor}-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-${glowColor}-500/20`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-lg shadow-black/20`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1 text-sm text-emerald-400 font-medium">
      <TrendingUp className="h-4 w-4" />
      <span>{trend}</span>
    </div>
  </div>
);

const DashboardHome: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    appointmentsToday: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Dados fictícios para o gráfico por enquanto (agregamento complexo requer Cloud Functions ou queries pesadas)
  const chartData = [
    { name: 'Seg', novos: 2 },
    { name: 'Ter', novos: 5 },
    { name: 'Qua', novos: 3 },
    { name: 'Qui', novos: 8 },
    { name: 'Sex', novos: 4 },
  ];

  useEffect(() => {
    if (!currentUser) return;

    const patientsRef = collection(db, 'users', currentUser.uid, 'patients');
    const funnelRef = collection(db, 'users', currentUser.uid, 'funnel');

    // Listener para Pacientes
    const unsubscribePatients = onSnapshot(query(patientsRef), (snapshot) => {
      const patients = snapshot.docs.map(doc => doc.data() as Patient);
      const scheduled = patients.filter(p => p.status === 'Agendado').length;
      
      // Simulação: Considerar "Hoje" qualquer agendado para este exemplo simples
      // Num app real, comparariamos datas
      
      setStats(prev => ({
        ...prev,
        totalPatients: patients.length,
        appointmentsToday: scheduled
      }));
    });

    // Listener para Funil (Receita)
    const unsubscribeFunnel = onSnapshot(query(funnelRef), (snapshot) => {
      const deals = snapshot.docs.map(doc => doc.data() as Deal);
      const totalRev = deals.reduce((acc, deal) => acc + Number(deal.value), 0);
      
      const finished = deals.filter(d => d.status === 'Finalizados').length;
      const total = deals.length;
      const rate = total > 0 ? Math.round((finished / total) * 100) : 0;

      setStats(prev => ({
        ...prev,
        totalRevenue: totalRev,
        conversionRate: rate
      }));
    });

    setLoading(false);

    return () => {
      unsubscribePatients();
      unsubscribeFunnel();
    };
  }, [currentUser]);

  return (
    <div className="p-8 ml-64 min-h-screen animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Dashboard</h1>
        <p className="text-slate-400">Visão geral do seu consultório</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Pacientes"
          value={stats.totalPatients.toString()}
          trend="Base atual"
          icon={Users}
          color="bg-blue-600"
          glowColor="blue"
        />
        <StatCard
          title="Faturamento Previsto"
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`}
          trend="Acumulado funil"
          icon={DollarSign}
          color="bg-emerald-600"
          glowColor="emerald"
        />
        <StatCard
          title="Agendados (Ativos)"
          value={stats.appointmentsToday.toString()}
          trend="Pacientes agendados"
          icon={Calendar}
          color="bg-purple-600"
          glowColor="purple"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          trend="Deals finalizados"
          icon={TrendingUp}
          color="bg-orange-600"
          glowColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500 opacity-50"></div>
          <h3 className="text-xl font-bold text-white mb-6">Atividade Recente</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="novos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNovos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col justify-center items-center text-center">
          <Calendar className="h-16 w-16 text-primary-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">Sem consultas hoje</h3>
          <p className="text-slate-400 mb-6">Sua agenda está livre por enquanto.</p>
          <button className="w-full py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
            Ver agenda completa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;