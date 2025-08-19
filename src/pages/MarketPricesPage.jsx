import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  AlertTriangle,
  Search,
  Leaf,
} from "lucide-react";
import Navbar from "../components/Navbar";

// --- DATA ---

// 1. Expanded list of commodities for filtering
const commodityMap = {
  // Cereals
  wheat: "Wheat",
  paddy: "Paddy(Dhan)",
  rice: "Rice",
  maize: "Maize",
  bajra: "Bajra",
  jowar: "Jowar",
  ragi: "Ragi",
  barley: "Barley",
  // Pulses
  arhar: "Arhar (Tur/Red Gram)",
  moong: "Moong(Green Gram)",
  urad: "Urad (Black Gram)",
  masur: "Masur (Lentil)",
  gram: "Gram",
  lentil: "Lentil",
  chana: "Bengal Gram(Chana)",
  // Oilseeds
  mustard: "Mustard",
  groundnut: "Groundnut",
  soyabean: "Soyabean",
  sunflower: "Sunflower",
  sesamum: "Sesamum(Sesame,Gingelly,Til)",
  castor: "Castor Seed",
  // Spices
  chilli: "Red Chilli",
  turmeric: "Turmeric",
  coriander: "Coriander",
  cumin: "Cumin Seed(Jeera)",
  pepper: "Black pepper",
  cardamom: "Cardamom",
  // Vegetables
  potato: "Potato",
  onion: "Onion",
  tomato: "Tomato",
  brinjal: "Brinjal",
  cabbage: "Cabbage",
  cauliflower: "Cauliflower",
  peas: "Green Peas",
  garlic: "Garlic",
  ginger: "Ginger",
  // Fruits
  banana: "Banana",
  mango: "Mango",
  orange: "Orange",
  apple: "Apple",
  grapes: "Grapes",
  pomegranate: "Pomegranate",
  guava: "Guava",
  // Fibres
  cotton: "Cotton",
  jute: "Jute",
};

// 2. Location data for filters (Sample - expand as needed for a full app)
const locationData = {
  "Andhra Pradesh": ["Chittoor", "Guntur", "Kurnool"],
  "Maharashtra": ["Pune", "Nashik", "Nagpur", "Ahmednagar"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Kanpur", "Varanasi"],
  "West Bengal": ["Kolkata", "Hooghly", "Bardhaman", "Nadia"],
  // Add all other states and districts for a complete application
};
const states = Object.keys(locationData);

// --- COMPONENT ---

const PriceListPage = ({ onNavigate }) => {
  // State for data, loading, and errors
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. State for filters
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtsForState, setDistrictsForState] = useState([]);

  // Effect to update district dropdown when state changes
  useEffect(() => {
    if (selectedState) {
      setDistrictsForState(locationData[selectedState] || []);
      setSelectedDistrict(""); // Reset district when state changes
    } else {
      setDistrictsForState([]);
    }
  }, [selectedState]);

  // 4. Effect to fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_KEY = "579b464db66ec23bdd000001798dfe5b454546066ddae0d79944e04d";
        let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=50`;

        // Dynamically add filters to the API URL
        const filters = {};
        if (selectedCommodity) filters.commodity = commodityMap[selectedCommodity];
        if (selectedState) filters.state = selectedState;
        if (selectedDistrict) filters.district = selectedDistrict;

        const filterParams = new URLSearchParams(filters).toString();
        if (filterParams) {
          // The data.gov.in API uses a specific format for filters
          const formattedFilters = Object.entries(filters)
            .map(([key, value]) => `&filters[${key}]=${encodeURIComponent(value)}`)
            .join('');
          url += formattedFilters;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch data from the server.");
        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
          const transformed = data.records.map((item, index) => ({
            id: `${item.timestamp}-${index}`, // More stable key
            commodity: item.commodity || "N/A",
            mandi: item.market || "Local Mandi",
            state: item.state || "N/A",
            district: item.district || "N/A",
            variety: item.variety || "Standard",
            price: item.modal_price ? `₹${item.modal_price}` : "N/A",
            minPrice: item.min_price ? `₹${item.min_price}` : "N/A",
            maxPrice: item.max_price ? `₹${item.max_price}` : "N/A",
            arrivalDate: item.arrival_date || "N/A",
          }));
          setMarketData(transformed);
          
        } else {
          setMarketData([]); // Clear data if no records are found
        }
      } catch (err) {
        setError("Unable to load market prices. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    

    fetchData();
  }, [selectedCommodity, selectedState, selectedDistrict]); // Re-run effect when filters change

  

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <div className="p-4 flex-grow">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Leaf className="text-green-600" />
            Live Mandi Prices
          </h1>
          <p className="text-gray-500">Find the latest prices for crops across India.</p>
        </header>

        {/* 5. Improved Filter UI */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Filter Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Commodity Filter */}
                <select 
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                    <option value="">All Commodities</option>
                    {Object.entries(commodityMap).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>

                {/* State Filter */}
                <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                    <option value="">All States</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>

                {/* District Filter */}
                <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedState}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">All Districts</option>
                    {districtsForState.map(district => <option key={district} value={district}>{district}</option>)}
                </select>
            </div>
        </div>

        {/* 6. Improved States (Loading, Error, Empty) */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-10 text-green-600">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="mt-2 text-lg">Fetching Prices...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-red-700 bg-red-100 p-4 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!loading && !error && marketData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-xl hover:border-green-500 border border-transparent transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-bold text-gray-800">
                        {item.commodity}
                        </h2>
                        <span className="bg-green-100 text-green-800 text-lg font-bold px-3 py-1 rounded-full">
                        {item.price}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3 -mt-2">{item.variety}</p>
                    
                    <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span>{item.mandi}, {item.district}, {item.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>Min: {item.minPrice} | Max: {item.maxPrice}</span>
                        </div>
                    </div>
                </div>
                <div className="border-t mt-3 pt-2 text-xs text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last Arrival: {item.arrivalDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && marketData.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <Search className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-800">No Results Found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to find what you're looking for.</p>
            </div>
        )}

      </div>

      {/* Navbar should always be last */}
      <Navbar active="prices" onNavigate={onNavigate} />
    </div>
  );
};

export default PriceListPage;