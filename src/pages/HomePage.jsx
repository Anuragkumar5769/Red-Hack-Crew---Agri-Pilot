import Header from '../components/Header'
import Navbar from '../components/Navbar'
import ChatInput from '../components/ChatInput'
import MongoDBStatus from '../components/MongoDBStatus'
import dummyData from '../data/dummyData'
import { Bell } from 'lucide-react'

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />
      <div className="p-4 space-y-4">
        {/* MongoDB Status Component */}
        <MongoDBStatus />
        
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Today's Top Crop</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-700 grid place-items-center font-bold">W</div>
              <div>
                <p className="font-bold">Wheat</p>
                <p className="text-2xl font-extrabold">₹2,150 <span className="text-sm font-normal text-gray-500">per quintal</span></p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-green-600 font-semibold">+2.4%</span>
              <p className="text-xs text-gray-500">vs yesterday</p>
            </div>
          </div>
        </div>

        <div className="flex justify-around text-sm">
          <button className="text-green-600 font-semibold border-b-2 border-green-600 pb-1">List View</button>
          <button className="text-gray-500 pb-1">Graph View</button>
        </div>

        <div className="space-y-2">
          {dummyData.marketPrices.map((item) => (
            <div key={item.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 grid place-items-center text-gray-600">{item.iconLetter}</div>
                <div>
                  <p className="font-semibold">{item.crop}</p>
                  <p className="text-xs text-gray-500">{item.distance}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{item.price}</p>
                <p className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.change}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          <Bell size={18} /> Set Price Alert
        </button>
      </div>
      <ChatInput />
      <Navbar active="home" onNavigate={onNavigate} />
    </div>
  )
}

export default HomePage