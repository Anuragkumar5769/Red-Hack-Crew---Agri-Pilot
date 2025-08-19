# Project Title: Agri-Assistant Full Stack Application

This is a full-stack web application designed to assist with agricultural inquiries. It features a React (Vite) frontend, a FastAPI backend, and a Node.js server for MongoDB connectivity.

## 🚀 Features

* **Interactive Frontend**: A modern and responsive user interface built with React and Vite.
* **Powerful Backend**: A robust API built with FastAPI to handle business logic.
* **Database Integration**: Seamlessly connects to MongoDB for data persistence.

## 🛠️ Technology Stack

* **Frontend**: React, Vite, Tailwind CSS
* **Backend**: Python, FastAPI
* **Database**: MongoDB, Node.js (for direct DB connection)
* **Deployment**: Verce

## ⚙️ Local Development Setup

To get the project running on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone [https://github.com/Anuragkumar5769/Red-Hack-Crew---Agri.git](https://github.com/Anuragkumar5769/Red-Hack-Crew---Agri.git)
cd your-repo-name
```
### 2. Install Dependencies
#### Frontend
```bash
npm install
```
#### Backend
```bash
pip install -r requirements.txt
```
### 3. Environment Variables
Create a .env file in the server directory and add the following:
```bash
MONGODB_URI=your_mongodb_connection_string
JSW_SECRET=your_jwt_secret
PORT=5000
```
### 4. Run the Application
You'll need three separate terminals to run all parts of the application:
#### Terminal 1: Start the Node.js Server
```bash
cd server
npm start
```
#### Terminal 2: Start the FastAPI Backend
```bash
cd backend
python -m app.main
```
#### Terminal 3: Start the Vite Frontend
```bash
npm run dev
```
Once all services are running, you can access the application at http://localhost:5173.
