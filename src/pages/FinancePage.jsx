import Header from '../components/Header'
import Navbar from '../components/Navbar'
import ChatInput from '../components/ChatInput'
import dummyData from '../data/dummyData'

const FinancePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header />
      <div className="p-4 space-y-4">
        <div className="rounded-2xl p-4 text-white gradient-green shadow-soft">
          <span className="pill bg-white/20">Rs SUBSIDY</span>
          <h3 className="text-lg font-bold mt-1">PM-Kisan Samman Nidhi</h3>
          <p className="text-sm opacity-95">₹6,000 annual support for small farmers</p>
          <button className="mt-4 bg-white text-green-600 font-bold py-2 px-4 rounded-xl">Apply Now</button>
        </div>

        <h3 className="text-lg font-bold text-gray-800">Quick Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <h4 className="font-semibold">Loan Calculator</h4>
            <p className="text-xs text-gray-500">Calculate EMI</p>
          </div>
          <div className="card p-4">
            <h4 className="font-semibold">Subsidy Finder</h4>
            <p className="text-xs text-gray-500">Find subsidies</p>
          </div>
        </div>

        <div className="flex justify-around text-sm">
          {['All','Loans','Subsidies','Insurance'].map(t => <button key={t} className="text-gray-500 p-2">{t}</button>)}
        </div>

        <div className="space-y-2">
          {dummyData.schemes.map(s => (
            <div key={s.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="flex gap-2 mb-1">
                  <span className="pill bg-gray-100 text-gray-700">{s.tag}</span>
                  <span className={`pill ${s.status==='OPEN'?'bg-green-100 text-green-700': s.status==='CLOSING SOON'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{s.status}</span>
                </div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-600">{s.description}</p>
                {s.deadline && <p className="text-xs text-gray-500 mt-1">Deadline: {s.deadline}</p>}
              </div>
              <div className="text-gray-400">›</div>
            </div>
          ))}
        </div>
      </div>
      <ChatInput />
      <Navbar active="finance" onNavigate={onNavigate} />
    </div>
  )
}

export default FinancePage