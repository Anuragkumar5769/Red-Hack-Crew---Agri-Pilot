import { LocateIcon } from 'lucide-react';

const Header = () => (
  <div className="frost rounded-b-2xl sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2 text-gray-700">
      <LocateIcon size={16} className="text-green-600" />
      <span className="text-sm font-semibold">Ludhiana, Punjab</span>
    </div>
    <span className="text-xs text-gray-500">Updated: 7:15 AM</span>
  </div>
);

export default Header;