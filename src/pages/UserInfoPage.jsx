import { useState, useEffect } from 'react';
import { User, Edit, Save, Camera, Settings, Bell, Shield, HelpCircle, LogOut, Phone, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

const UserInfoPage = ({ onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    farmSize: '5 acres',
    crops: ['Wheat', 'Rice', 'Cotton'],
    joinDate: '',
    profileImage: null
  });

  const [formData, setFormData] = useState({ ...userData });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const fullName = `${user.firstName} ${user.lastName}`.trim();
          const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          });
          
          const updatedUserData = {
            name: fullName,
            phone: user.phone || '',
            email: user.email || '',
            farmSize: '5 acres', // Default farm size
            crops: ['Wheat', 'Rice', 'Cotton'], // Default crops
            joinDate: joinDate,
            profileImage: null
          };
          
          setUserData(updatedUserData);
          setFormData(updatedUserData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleSave = () => {
    setUserData(formData);
    
    // Update localStorage with new user data
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const updatedUser = {
          ...user,
          firstName: firstName,
          lastName: lastName,
          phone: formData.phone,
          email: formData.email,
          farmSize: formData.farmSize,
          crops: formData.crops
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCropsChange = (value) => {
    setFormData(prev => ({ ...prev, crops: value.split(',').map(c => c.trim()) }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', action: () => alert('Settings coming soon!') },
    { icon: Bell, label: 'Notifications', action: () => alert('Notifications coming soon!') },
    { icon: Shield, label: 'Privacy & Security', action: () => alert('Privacy settings coming soon!') },
    { icon: HelpCircle, label: 'Help & Support', action: () => alert('Help center coming soon!') },
    { icon: LogOut, label: 'Logout', action: handleLogout }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
            <p className="text-gray-600 text-sm">Manage your account information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  userData.name.charAt(0)
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-2xl font-bold text-gray-800 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none mb-2"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{userData.name}</h2>
            )}
            
            <p className="text-gray-600 text-sm">Farmer • {userData.joinDate}</p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              ) : (
                <span className="text-gray-700">{userData.phone}</span>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none"
                />
              ) : (
                <span className="text-gray-700">{userData.email}</span>
              )}
            </div>
          </div>

          {/* Farm Information */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Farm Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Farm Size</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.farmSize}
                    onChange={(e) => handleInputChange('farmSize', e.target.value)}
                    className="w-full bg-transparent border-b border-green-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{userData.farmSize}</p>
                )}
              </div>
              <div>
                <p className="text-gray-600">Primary Crops</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.crops.join(', ')}
                    onChange={(e) => handleCropsChange(e.target.value)}
                    placeholder="Enter crops separated by commas"
                    className="w-full bg-transparent border-b border-green-500 focus:outline-none"
                  />
                ) : (
                  <p className="font-medium text-gray-800">{userData.crops.join(', ')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-soft">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <item.icon className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Card */}
        {/* <div className="bg-white rounded-2xl p-6 shadow-soft mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Schemes Applied</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-600">Diseases Detected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">45</p>
              <p className="text-sm text-gray-600">AI Consultations</p>
            </div>
          </div>
        </div> */}
      </div>

      <Navbar active="profile" onNavigate={onNavigate} />
    </div>
  );
};

export default UserInfoPage;