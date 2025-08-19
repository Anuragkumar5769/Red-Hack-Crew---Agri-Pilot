# MongoDB Connection Testing Guide

This guide explains how to test and monitor MongoDB connection in the Krishi Pilot application.

## Features Added

### 1. Enhanced Server Connection Monitoring
- **Connection Status Tracking**: Real-time monitoring of MongoDB connection state
- **Automatic Retry Logic**: Exponential backoff retry mechanism (up to 5 attempts)
- **Connection Event Listeners**: Monitor connect, disconnect, error, and reconnect events
- **Graceful Shutdown**: Proper cleanup on server termination

### 2. API Endpoints for Monitoring

#### Health Check Endpoint
```
GET /api/health
```
Returns server status including MongoDB connection information:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "mongodb": {
    "status": "connected",
    "connected": true,
    "host": "cluster0.crvsxsr.mongodb.net",
    "database": "your_database_name"
  }
}
```

#### MongoDB Status Endpoint
```
GET /api/mongodb-status
```
Returns detailed MongoDB connection status:
```json
{
  "success": true,
  "status": "connected",
  "connected": true,
  "host": "cluster0.crvsxsr.mongodb.net",
  "database": "your_database_name",
  "retries": 0
}
```

### 3. Frontend MongoDB Status Component
- Real-time MongoDB connection status display
- Auto-refresh every 30 seconds
- Visual indicators (green/red status)
- Manual refresh button
- Connection details (host, database, retry count)

## Testing Instructions

### 1. Test MongoDB Connection (Standalone)
Run the standalone test script:
```bash
cd server
node test-mongodb-connection.js
```

This script will:
- Check if MONGODB_URI is configured
- Attempt to connect to MongoDB
- Test basic database operations
- Display connection details
- Provide helpful error messages if connection fails

### 2. Test Server with MongoDB Monitoring
Start the server:
```bash
cd server
npm start
```

The server will:
- Attempt to connect to MongoDB with retry logic
- Display detailed connection information
- Start monitoring connection events
- Provide health check endpoints

### 3. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# MongoDB status
curl http://localhost:5000/api/mongodb-status
```

### 4. Test Frontend Integration
Start the frontend:
```bash
npm run dev
```

Navigate to the home page to see the MongoDB status component.

## Connection States

MongoDB connection can be in one of these states:
- **0**: disconnected
- **1**: connected
- **2**: connecting
- **3**: disconnecting

## Error Handling

The system handles various MongoDB connection errors:
- **MongoNetworkError**: Network connectivity issues
- **MongoServerSelectionError**: Server selection problems
- **Authentication errors**: Invalid credentials
- **Configuration errors**: Missing or invalid MONGODB_URI

## Troubleshooting

### Common Issues and Solutions

1. **MONGODB_URI not configured**
   - Check if `config.env` file exists
   - Verify MONGODB_URI is set correctly

2. **Network connectivity issues**
   - Check internet connection
   - Verify MongoDB Atlas cluster is running
   - Check IP whitelist in MongoDB Atlas

3. **Authentication errors**
   - Verify username and password in connection string
   - Check if user has proper permissions

4. **Connection timeout**
   - Check network latency
   - Verify MongoDB Atlas cluster status
   - Check firewall settings

### Debug Mode
For detailed debugging, set environment variable:
```bash
NODE_ENV=development
```

## Configuration

### Environment Variables
Make sure these are set in `config.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Connection Options
The MongoDB connection uses these optimized settings:
- `serverSelectionTimeoutMS: 5000` - Fast timeout for server selection
- `socketTimeoutMS: 45000` - Socket timeout after 45s inactivity
- `maxPoolSize: 10` - Maximum 10 connections in pool
- `minPoolSize: 2` - Minimum 2 connections in pool

## Monitoring in Production

For production monitoring:
1. Use the `/api/health` endpoint for health checks
2. Monitor `/api/mongodb-status` for detailed connection info
3. Set up alerts for connection failures
4. Log connection events for debugging
5. Use the frontend component for real-time status display
