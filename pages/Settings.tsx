import React, { useEffect, useState } from 'react';
import { User, Bell, Shield, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.displayName || '');
        setSpecialty(data.specialty || '');
      } else {
        setName(currentUser.displayName || '');
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: name,
        specialty: specialty,
        email: currentUser.email
      }, { merge: true });
      setMsg('Perfil atualizado com sucesso!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      console.error(e);
      setMsg('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 ml-64 min-h-screen animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Configuração</h1>
        <p className="text-slate-400">Gerencie suas preferências e conta</p>
      </header>

      <div className="max-w-4xl">
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/5 overflow-hidden mb-6">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-primary-400" /> Perfil
            </h2>
             {msg && <span className="text-emerald-400 text-sm animate-pulse">{msg}</span>}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="h-24 w-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-3xl font-bold border-2 border-slate-700 shadow-inner">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white">{name || 'Usuário'}</h3>
                <p className="text-slate-400">{currentUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" 
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-slate-400 mb-1">Especialidade</label>
                <input 
                  type="text" 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all" 
                  placeholder="Ex: Cardiologista"
                />
              </div>
            </div>
            <div className="mt-6 text-right">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-600/20 inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;