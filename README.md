# Website Setup & Run Guide

Follow the steps below to set up and run the project.

---

## 1. Setup Virtual Environment & Install Requirements

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\env\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
```

---
## 2. Set API keys:

Create a .env file.

```bash
GEMINI_API_KEY="your Gemini API key"
WEATHER_API_KEY="your openweathermap API key"
DATA_GOV_IN_API_KEY=579b464db66ec23bdd000001798dfe5b454546066ddae0d79944e04d  # this is a publically key
VITE_API_KEY="your openweathermap API key"
```

## 2. Run Backend

```bash
cd backend
python -m app.main
```

---

## 3. Setup Frontend

(Open a **new terminal** and run:)

```bash
npm install
npm install axios
npm install express
```

---

## 4. Run Server

(Open another **new terminal** and run:)

```bash
cd server
npm start
```

---

## 5. Start Frontend (Dev Mode)

(Open another **new terminal** and run:)

```bash
npm run dev
```
