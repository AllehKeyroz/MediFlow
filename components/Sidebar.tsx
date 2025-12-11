import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Filter, Settings, LogOut, Activity, Network } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
    { name: 'Funil', path: '/funil', icon: Filter },
    { name: 'Integrações', path: '/integracoes', icon: Network },
    { name: 'Configuração', path: '/configuracao', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950/40 backdrop-blur-xl border-r border-white/10 text-slate-300 transition-all duration-300 fixed left-0 top-0 z-20 shadow-2xl">
      <div className="flex items-center gap-3 p-6 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg shadow-primary-500/30 relative z-10">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">MediFlow</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-white/5 border border-white/10'
                  : 'hover:bg-white/5 hover:text-white text-slate-400 hover:border-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent opacity-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                <item.icon className={`h-5 w-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 text-primary-400' : 'group-hover:scale-110'}`} />
                <span className="font-medium relative z-10">{item.name}</span>
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full shadow-[0_0_10px_#3b82f6]"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors duration-200 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;