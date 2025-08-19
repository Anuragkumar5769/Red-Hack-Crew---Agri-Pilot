import React, { useState, useEffect } from 'react';

const MongoDBStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkMongoDBStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/mongodb-status');
      const data = await response.json();
      
      setStatus(data);
    } catch (err) {
      setError('Failed to check MongoDB status');
      console.error('Error checking MongoDB status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMongoDBStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkMongoDBStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (connected) => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (connected) => {
    return connected ? '🟢' : '🔴';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Checking MongoDB status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">❌</span>
          <span className="text-red-600">{error}</span>
          <button 
            onClick={checkMongoDBStatus}
            className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon(status?.connected)}</span>
          <div>
            <h3 className="font-semibold text-gray-800">MongoDB Status</h3>
            <p className={`text-sm ${getStatusColor(status?.connected)}`}>
              {status?.status || 'Unknown'}
            </p>
          </div>
        </div>
        
        <div className="text-right text-sm text-gray-600">
          <div>Host: {status?.host || 'N/A'}</div>
          <div>Database: {status?.database || 'N/A'}</div>
          {status?.retries > 0 && (
            <div className="text-orange-600">Retries: {status.retries}</div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <button 
          onClick={checkMongoDBStatus}
          className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
        
        <span className="text-xs text-gray-500">
          Last checked: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MongoDBStatus;
