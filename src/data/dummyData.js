const dummyData = {
  alerts: [
    { id: 1, crop: "Rice", description: "Brown Plant Hopper", time: "2 hours ago", recommendation: "Spray recommended within 2 days.", severity: "HIGH", icon: "https://placehold.co/80x80?text=Rice" },
    { id: 2, crop: "Cotton", description: "Leaf Curl Disease", time: "5 hours ago", recommendation: "Monitor plants, apply organic spray", severity: "MEDIUM", icon: "https://placehold.co/80x80?text=Cot" },
    { id: 3, crop: "Tomato", description: "Early Blight", time: "1 day ago", recommendation: "Preventive measures recommended", severity: "LOW", icon: "https://placehold.co/80x80?text=Tom" },
  ],
  marketPrices: [
    { id: 1, crop: "Wheat", price: "2,150", change: "+2.4%", distance: "Ludhiana Mandi • 12 km", iconLetter: "W" },
    { id: 2, crop: "Rice (Basmati)", price: "3,850", change: "-1.2%", distance: "Khanna Mandi • 18 km", iconLetter: "R" },
    { id: 3, crop: "Mustard", price: "5,200", change: "-0.0%", distance: "Rajpura Mandi • 25 km", iconLetter: "M" },
    { id: 4, crop: "Cotton", price: "6,750", change: "+3.1%", distance: "Ludhiana Mandi • 12 km", iconLetter: "C" },
    { id: 5, crop: "Sugarcane", price: "350", change: "-0.8%", distance: "Khanna Mandi • 18 km", iconLetter: "S" },
  ],
  schemes: [
    { id: 1, tag: "LOAN", status: "OPEN", name: "Kisan Credit Card", description: "Easy crop loans at low interest rates" },
    { id: 2, tag: "INSURANCE", status: "CLOSING SOON", name: "Pradhan Mantri Fasal Bima", description: "Crop insurance against natural disasters", deadline: "Aug 31, 2024" },
    { id: 3, tag: "SUBSIDY", status: "OPEN", name: "Drip Irrigation Subsidy", description: "50% subsidy on drip irrigation systems" },
    { id: 4, tag: "GRANT", status: "CLOSED", name: "Organic Farming Grant", description: "Financial support for organic certification" },
  ]
};

export default dummyData;