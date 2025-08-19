import { useState } from 'react';
import {
  Building2, FileText, Calendar, DollarSign, CheckCircle,
  ArrowRight, Search, Filter, Shield, Briefcase
} from 'lucide-react';
import Navbar from '../components/Navbar';

const GovernmentSchemePage = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const categories = [
    { id: 'all', name: 'All Schemes', icon: Building2 },
    { id: 'subsidy', name: 'Subsidies', icon: DollarSign },
    { id: 'loan', name: 'Loans', icon: FileText },
    { id: 'insurance', name: 'Insurance', icon: Shield },
    { id: 'training', name: 'Training', icon: Calendar },
    { id: 'infrastructure', name: 'Infrastructure', icon: Briefcase },
    { id: 'other', name: 'Other', icon: Building2 },
  ];

  const schemes = [
    {
      id: 1,
      title: 'PM-KISAN Scheme',
      description: 'Income support of ₹6,000/year in 3 four-monthly installments via DBT',
      category: 'subsidy',
      eligibility: 'Small and marginal farmer families',
      amount: '₹6,000/year',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Aadhaar Card', 'Land Records', 'Bank Account'],
      benefits: ['Cash transfer via DBT', 'Supports 11 crore+ farmers'],
    },
    {
      id: 2,
      title: 'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)',
      description: 'Contributory pension scheme—₹3,000/month after 60',
      category: 'subsidy',
      eligibility: 'Small and marginal farmers, age 18–40',
      amount: '₹3,000/month pension',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Monthly contribution (₹55–₹200)', 'Age proof', 'CSC enrollment'],
      benefits: ['Pension security', 'Central co-contribution', 'Insurance-backed fund'],
    },
    {
      id: 3,
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Affordable crop insurance against natural calamities',
      category: 'insurance',
      eligibility: 'All farmers',
      amount: 'Premium: 1.5–2% of sum insured',
      deadline: 'Before sowing',
      status: 'active',
      requirements: ['Crop details', 'Land records', 'Bank account'],
      benefits: ['Comprehensive risk cover', 'Quick claims', 'Govt premium support'],
    },
    {
      id: 4,
      title: 'Modified Interest Subvention Scheme (MISS)',
      description: 'Short-term crop loans at 4% effective interest',
      category: 'loan',
      eligibility: 'KCC holders',
      amount: 'Loan up to ₹3 lakh @ 4% interest',
      deadline: 'Year-round',
      status: 'active',
      requirements: ['Kisan Credit Card (KCC)'],
      benefits: ['Concessional interest', '3% rebate for timely repayment'],
    },
    {
      id: 5,
      title: 'Agriculture Infrastructure Fund (AIF)',
      description: 'Credit facility for agri-infra projects with 3% interest subvention',
      category: 'infrastructure',
      eligibility: 'Farmers, FPOs, SHGs, startups, PACS, states, etc.',
      amount: 'Loans up to ₹2 crore/project',
      deadline: 'FY2020-21 to FY2032-33',
      status: 'active',
      requirements: ['Project proposal', 'Loan application'],
      benefits: ['Long-term financing', 'Credit guarantee via CGTMSE', 'Support for multiple projects'],
    },
    {
      id: 6,
      title: 'Formation & Promotion of 10,000 FPOs',
      description: 'Grants and equity support for FPO creation and onboarding',
      category: 'other',
      eligibility: 'Farmer Producer Organizations',
      amount: '₹18 lakh/FPO + ₹15 lakh equity + ₹2 crore loan guarantee',
      deadline: '2020–2025',
      status: 'active',
      requirements: ['FPO formation record', 'Farmer membership'],
      benefits: ['Financial aid', 'Market access via e-NAM', 'Training & capacity building'],
    },
    {
      id: 7,
      title: 'National Beekeeping & Honey Mission',
      description: 'Boosts beekeeping through labs, registrations, and infrastructure',
      category: 'training',
      eligibility: 'Beekeepers, FPOs, SHGs',
      amount: 'Subsidy-based supports',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Registration via Madhukranti portal'],
      benefits: ['Honey testing labs', 'Bee colonies registration', 'FPO support'],
    },
    {
      id: 8,
      title: 'Namo Drone Didi',
      description: 'Drones for Women SHGs with 80% subsidy + livelihood support',
      category: 'infrastructure',
      eligibility: 'Women Self-Help Groups',
      amount: '80% subsidy up to ₹8 lakh + AIF loan & 3% interest subvention',
      deadline: '2024–25 to 2025–26',
      status: 'active',
      requirements: ['SHG membership', 'Loan application'],
      benefits: ['Drone rental business', 'Extra ₹1 lakh/year income', 'Training'],
    },
    {
      id: 9,
      title: 'Rashtriya Krishi Vikas Yojana (RKVY-DPR)',
      description: 'State-driven agri/allied sector projects—capital & infra support',
      category: 'infrastructure',
      eligibility: 'State project authorities',
      amount: 'Varies per DPR',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['State DPR proposals'],
      benefits: ['State-specific flexibility', 'Startup grants via agri-startup programme'],
    },
    {
      id: 10,
      title: 'Soil Health Card (SHC)',
      description: 'Soil testing & nutrient recommendations—5 crore samples by 2025-26',
      category: 'subsidy',
      eligibility: 'All farmers',
      amount: 'Free soil testing',
      deadline: '2023–24 to 2025–26',
      status: 'active',
      requirements: ['Land holdings info'],
      benefits: ['Improved crop planning', 'GIS-based fertility map'],
    },
    {
      id: 11,
      title: 'Rainfed Area Development (RAD)',
      description: 'Cluster-based integrated farming in rainfed areas',
      category: 'training',
      eligibility: 'Rainfed-area farmers',
      amount: 'Capacity-building grants',
      deadline: 'Ongoing since 2014–15',
      status: 'active',
      requirements: ['Cluster participation'],
      benefits: ['Sustainable livelihoods', 'Diversified farming systems'],
    },
    {
      id: 12,
      title: 'Per Drop More Crop (PDMC)',
      description: 'Micro irrigation subsidies & support for drip/sprinkler systems',
      category: 'infrastructure',
      eligibility: 'Farmers in all states',
      amount: 'Varying subsidy; OI up to 40% in special areas',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Irrigation system proposal'],
      benefits: ['Water efficiency', 'Lower input cost', 'State-wise flexibility'],
    },
    {
      id: 13,
      title: 'Micro Irrigation Fund (MIF)',
      description: 'NABARD-led funding at low-interest under PDMC',
      category: 'loan',
      eligibility: 'State agri departments',
      amount: 'Rs. 5,000 crore corpus (to scale)',
      deadline: 'Merged with PDMC',
      status: 'active',
      requirements: ['State loan requests via NABARD'],
      benefits: ['Lower interest rates', 'Deeper micro-IR infrastructure'],
    },
    {
      id: 14,
      title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      description: 'Cluster-mode organic farming support—₹31,500/ha via DBT',
      category: 'subsidy',
      eligibility: 'Farmers in clusters (min 20 farmers)',
      amount: '₹31,500/ha support',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Cluster group formation'],
      benefits: ['Promotes organic produce', 'Cluster-based marketing'],
    },
    {
      id: 15,
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      description: 'Mechanization equipment, Custom Hiring Centres, Hitech hubs',
      category: 'infrastructure',
      eligibility: 'Small/marginal farmers & states',
      amount: 'Equipment grants & subsidies',
      deadline: 'Ongoing since April 2014',
      status: 'active',
      requirements: ['Applications via state agencies'],
      benefits: ['Machinery access', 'Drone demos & subsidies under SMAM'],
    },
    {
      id: 16,
      title: 'Crop Residue Management (CRM)',
      description: 'In situ crop residue machines & awareness in NCR and nearby states',
      category: 'infrastructure',
      eligibility: 'Farmers in Punjab, Haryana, UP, Delhi',
      amount: 'Machinery distribution & grants',
      deadline: '2018–onwards',
      status: 'active',
      requirements: ['Farmer/Mandi mobilization'],
      benefits: ['Reduces stubble burning', 'Environmental protection'],
    },
    {
      id: 17,
      title: 'Agro-forestry (under RKVY)',
      description: 'Tree planting on farmland with quality planting materials',
      category: 'subsidy',
      eligibility: 'Farmers across India',
      amount: 'Subsidy for planting materials & certification',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Application under state RKVY plan'],
      benefits: ['Livelihood improvement', 'Greater tree cover'],
    },
    {
      id: 18,
      title: 'National Food Security Mission (NFSM)',
      description: 'Boosts production of rice, wheat, pulses, nutri-cereals & millets',
      category: 'training',
      eligibility: 'Farmers in target districts/states',
      amount: 'Input support & start-up grants',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Region-specific enrollment'],
      benefits: ['Millet ecosystem development', 'Startup & FPO support'],
    },
    {
      id: 19,
      title: 'Sub-Mission on Seed & Planting Material (SMSP)',
      description: 'Complete seed chain support; launched SATHI portal in 2023',
      category: 'infrastructure',
      eligibility: 'Seed-producing organizations',
      amount: 'Infrastructure & quality seed grants',
      deadline: 'Merged with NFSM',
      status: 'active',
      requirements: ['Seed organization onboarding'],
      benefits: ['Quality seeds', 'Traceability via SATHI'],
    },
    {
      id: 20,
      title: 'National Mission on Edible Oils – Oil Palm (NMEO-OP)',
      description: 'Expands oil palm plantation (6.5 lakh ha) by 2025-26',
      category: 'other',
      eligibility: 'Farmers in participating zones',
      amount: 'Input & planting material support',
      deadline: '2021–22 to 2025–26',
      status: 'active',
      requirements: ['Oil palm plantation proposals'],
      benefits: ['Increases edible oil production', 'Focuses on North-East & Andamans'],
    },
    {
      id: 21,
      title: 'Mission for Integrated Development of Horticulture (MIDH)',
      description: 'Holistic horticulture development including organic farming & pollination',
      category: 'infrastructure',
      eligibility: 'Farmers, nurseries, agri organizations',
      amount: 'Infrastructure & cultivation grants',
      deadline: '2014–15 to 2023–24',
      status: 'active',
      requirements: ['Project proposals under MIDH'],
      benefits: ['Protected cultivation', 'Organic coverage', 'Pollination support'],
    },
    {
      id: 22,
      title: 'National Bamboo Mission (NBM)',
      description: 'Bamboo value-chain support—nurseries, plantations, VCDAP',
      category: 'training',
      eligibility: 'Farmers & artisans in 23 states + J&K',
      amount: 'Plantation & processing infrastructure grants',
      deadline: 'Merged with MIDH',
      status: 'active',
      requirements: ['Bamboo project proposals'],
      benefits: ['Nurseries', 'PL value addition units', 'Skill training'],
    },
    {
      id: 23,
      title: 'Integrated Scheme for Agriculture Marketing (ISAM)',
      description: 'Supports e-NAM integration & Agri-market infrastructure',
      category: 'infrastructure',
      eligibility: 'State market agencies & mandis',
      amount: 'Infrastructure & digital grants',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['APMC / mandi integration proposals'],
      benefits: ['e-NAM scalability', 'Trade access for farmers'],
    },
    {
      id: 24,
      title: 'Mission Organic Value Chain Development for NE Region (MOVCDNER)',
      description: 'Certified organic clusters & value chain in Northeast',
      category: 'infrastructure',
      eligibility: 'Farmers/FPOs in NE states',
      amount: 'Cluster development grants',
      deadline: 'Since 2015–16 (as of Dec 2023)',
      status: 'active',
      requirements: ['Cluster project proposals'],
      benefits: ['Certified organic value chain', 'Brand building & market linkage'],
    },
    {
      id: 25,
      title: 'Sub-Mission on Agriculture Extension (SMAE)',
      description: 'VISTAAR, Kisan Call Centre integration & digital agri-extension',
      category: 'other',
      eligibility: 'Agri extension agencies, states',
      amount: 'Digital infrastructure grants',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['State extension proposals'],
      benefits: ['Digital advisory (VISTAAR, Apurva AI)', '24×7 support via Krishi Sakhi'],
    },
    {
      id: 26,
      title: 'Digital Agriculture (AgriStack)',
      description: 'Open-source digital architecture for farmer services',
      category: 'other',
      eligibility: 'Governments and NGOs',
      amount: 'Platform funding & integration support',
      deadline: 'Ongoing',
      status: 'active',
      requirements: ['Integration plans with AgriStack'],
      benefits: ['Farmers registry', 'Crop planning tools', 'Data exchange APIs'],
    },
  ];

  // Enhanced search across multiple fields
  const filteredSchemes = schemes.filter(scheme => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      scheme.title.toLowerCase().includes(term) ||
      scheme.description.toLowerCase().includes(term) ||
      scheme.eligibility.toLowerCase().includes(term) ||
      scheme.requirements.some(r => r.toLowerCase().includes(term)) ||
      scheme.benefits.some(b => b.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (scheme) => {
    alert(`Application submitted for ${scheme.title}! Updates will be shared via SMS/Email.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Government Schemes</h1>
            <p className="text-gray-600 text-sm">Discover and apply for farming support programs</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-soft mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Category Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Cards */}
        <div className="space-y-4">
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{scheme.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{scheme.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{scheme.amount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">Deadline: {scheme.deadline}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  {scheme.status}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  View Details <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleApply(scheme)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Result Placeholder */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No schemes found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedScheme.title}</h2>
              <button onClick={() => setSelectedScheme(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">{selectedScheme.description}</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Eligibility</h3>
                <p className="text-gray-600 text-sm">{selectedScheme.eligibility}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Requirements</h3>
                <ul className="space-y-1">
                  {selectedScheme.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Benefits</h3>
                <ul className="space-y-1">
                  {selectedScheme.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" /> {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedScheme(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => { handleApply(selectedScheme); setSelectedScheme(null); }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Navbar active="schemes" onNavigate={onNavigate} />
    </div>
  );
};

export default GovernmentSchemePage;
