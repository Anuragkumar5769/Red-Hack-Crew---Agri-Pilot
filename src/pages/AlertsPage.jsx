import Header from '../components/Header'
import Navbar from '../components/Navbar'
import ChatInput from '../components/ChatInput'
import dummyData from '../data/dummyData'
import { Search, ChevronRight } from 'lucide-react'

const AlertsPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl p-4 text-white shadow-soft" style={{background:'linear-gradient(135deg,#ef4444,#dc2626)'}}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Pest Infestation Alert</h3>
            <span className="pill bg-white text-red-600">HIGH</span>
          </div>
          <p className="text-sm opacity-95">Aphids spotted in nearby fields. Immediate action recommended.</p>
          <button className="mt-4 bg-white text-red-600 font-semibold px-3 py-2 rounded-xl">View Details →</button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="w-full border rounded-xl pl-10 pr-10 py-2" placeholder="Search alerts or pests..." />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">⌄</div>
        </div>

        <h3 className="text-lg font-bold text-gray-800">Recent Alerts</h3>
        <div className="space-y-2">
          {dummyData.alerts.map(alert => (
            <div key={alert.id} className="card p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <img src={alert.icon} alt={alert.crop} className="w-12 h-12 rounded-lg object-cover"/>
                <div>
                  <p className="font-semibold">{alert.crop}</p>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  <p className="text-sm mt-1">{alert.recommendation}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`pill ${alert.severity==='HIGH'?'bg-red-100 text-red-700':alert.severity==='MEDIUM'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{alert.severity}</span>
                <ChevronRight className="text-gray-400 mt-4" size={18}/>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Recent Advice</h3>
          <div className="bg-blue-50 p-3 rounded-xl text-sm">Pest Prevention Tips — <span className="text-gray-600">Regular field inspection helps detect early signs</span></div>
        </div>
      </div>
      <ChatInput />
      <Navbar active="alerts" onNavigate={onNavigate} />
    </div>
  )
}

export default AlertsPage