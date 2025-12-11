import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, X, ArrowRightLeft, Trash2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Deal } from '../types';

interface KanbanCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ deal, onEdit, onDelete }) => (
  <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/5 mb-3 hover:shadow-primary-500/10 hover:border-primary-500/30 hover:-translate-y-1 transition-all group relative">
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{deal.patientName}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={() => onEdit(deal)} className="p-1 text-slate-500 hover:text-primary-400" title="Mover/Editar">
          <ArrowRightLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(deal.id)} className="p-1 text-slate-500 hover:text-red-400" title="Excluir">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">Valor</span>
      <span className="font-bold text-emerald-400 shadow-emerald-500/20">
        {Number(deal.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </span>
    </div>
  </div>
);

const Column: React.FC<{ title: string; count: number; children: React.ReactNode; color: string }> = ({ title, count, children, color }) => (
  <div className="flex-1 min-w-[300px] bg-slate-900/30 backdrop-blur-sm rounded-2xl p-4 border border-white/5 flex flex-col h-full">
    <div className={`flex justify-between items-center mb-4 pb-2 border-b-2 ${color}`}>
      <h3 className="font-bold text-slate-300">{title}</h3>
      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold border border-white/5">{count}</span>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
      {children}
    </div>
  </div>
);

const Funnel: React.FC = () => {
  const { currentUser } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    value: '',
    status: 'Interessados'
  });

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'funnel'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingDeal) {
        // Update existing
        await updateDoc(doc(db, 'users', currentUser.uid, 'funnel', editingDeal.id), {
          status: formData.status,
          value: Number(formData.value),
          patientName: formData.patientName
        });
      } else {
        // Create new
        await addDoc(collection(db, 'users', currentUser.uid, 'funnel'), {
          ...formData,
          value: Number(formData.value),
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
      }
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser || !confirm("Tem certeza que deseja excluir?")) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'funnel', id));
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      patientName: deal.patientName,
      value: deal.value.toString(),
      status: deal.status
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
    setFormData({ patientName: '', value: '', status: 'Interessados' });
  };

  const getDealsByStatus = (status: string) => deals.filter(d => d.status === status);

  return (
    <div className="p-8 ml-64 min-h-screen overflow-hidden flex flex-col animate-fade-in">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Funil de Vendas</h1>
          <p className="text-slate-400">Acompanhe a jornada dos seus pacientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-600/30"
        >
          <Plus className="h-5 w-5" /> Novo Negócio
        </button>
      </header>

      <div className="flex gap-6 flex-1 pb-4 overflow-x-auto">
        <Column title="Interessados" count={getDealsByStatus('Interessados').length} color="border-blue-500">
          {getDealsByStatus('Interessados').map(deal => (
            <KanbanCard key={deal.id} deal={deal} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </Column>

        <Column title="Agendados" count={getDealsByStatus('Agendados').length} color="border-yellow-500">
           {getDealsByStatus('Agendados').map(deal => (
            <KanbanCard key={deal.id} deal={deal} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </Column>

        <Column title="Em Tratamento" count={getDealsByStatus('Em Tratamento').length} color="border-purple-500">
           {getDealsByStatus('Em Tratamento').map(deal => (
            <KanbanCard key={deal.id} deal={deal} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </Column>

        <Column title="Finalizados" count={getDealsByStatus('Finalizados').length} color="border-emerald-500">
           {getDealsByStatus('Finalizados').map(deal => (
            <KanbanCard key={deal.id} deal={deal} onEdit={openEditModal} onDelete={handleDelete} />
          ))}
        </Column>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingDeal ? 'Editar Negócio' : 'Novo Negócio'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Paciente/Lead</label>
                <input 
                  type="text" 
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white outline-none focus:border-primary-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Valor Estimado (R$)</label>
                <input 
                  type="number" 
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white outline-none focus:border-primary-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Etapa do Funil</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white outline-none focus:border-primary-500"
                >
                  <option value="Interessados">Interessados</option>
                  <option value="Agendados">Agendados</option>
                  <option value="Em Tratamento">Em Tratamento</option>
                  <option value="Finalizados">Finalizados</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funnel;