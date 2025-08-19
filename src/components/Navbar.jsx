import { SunIcon, TrendingUp, Bot, Building2, UserIcon } from 'lucide-react';

const Navbar = ({ active, onNavigate }) => {
  const items = [
    { key: 'weather', label: 'Weather', icon: SunIcon },
    { key: 'market', label: 'Prices', icon: TrendingUp },
    { key: 'ai', label: 'AI Agent', icon: Bot },
    { key: 'schemes', label: 'Schemes', icon: Building2 },
    { key: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 frost rounded-t-2xl shadow-soft p-2 flex justify-around z-20">
      {items.map((it) => (
        <button key={it.key} onClick={() => onNavigate(it.key)} className={`flex flex-col items-center p-2 ${active === it.key ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
          <it.icon size={20} />
          <span className="text-xs">{it.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Navbar;