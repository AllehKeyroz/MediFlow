import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, X, Save } from 'lucide-react';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Patient } from '../types';

const Patients: React.FC = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Lead'
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'patients'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPatients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(loadedPatients);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'patients'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', status: 'Lead' });
    } catch (error) {
      console.error("Erro ao criar paciente:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Tratamento': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'Agendado': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'Finalizado': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600/30';
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 ml-64 min-h-screen animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Pacientes</h1>
          <p className="text-slate-400">Gerencie todos os seus pacientes em um só lugar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" /> Novo Paciente
        </button>
      </header>

      {/* Tabela */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 h-5 w-5 transition-colors" />
            <input
              type="text"
              placeholder="Buscar pacientes por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {loading ? 'Carregando...' : 'Nenhum paciente encontrado.'}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/30 text-slate-400 text-sm font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 font-bold border border-white/5 group-hover:border-primary-500/50 group-hover:text-primary-300 transition-all">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-white">{patient.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300">{patient.email}</div>
                    <div className="text-sm text-slate-500">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Novo Paciente</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" 
                    />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status Inicial</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
                >
                  <option value="Lead">Lead (Interessado)</option>
                  <option value="Agendado">Agendado</option>
                  <option value="Em Tratamento">Em Tratamento</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-600/20 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;