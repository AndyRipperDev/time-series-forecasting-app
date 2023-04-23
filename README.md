# Time Series Forecasting App

This app was developed as a part of bachelor thesis at VSB-TUO.

It's based on client-server architecture with React as a client app and FastAPI as a REST API server.

## Prerequisites

- Node.js **18.16.0**
- Python **3.10.7**
- MariaDB **10.7.3**
  - Port: 3306
  - User: Root
  - Password: No password, during installation was password input empty

## Setup

### FastAPI

1. Move to the backend directory: `cd backend`
2. Create Python virtual environment: `python -m venv venv`
3. Activate Python virtual environment: `venv/Scripts/activate`
4. Install all dependencies from **requirements.txt**: `pip install -r requirements.txt`
5. Run FastAPI server: `uvicorn main:app --reload`

### React

1. Move to the frontend directory: `cd frontend`
2. Install all dependencies from **package.json**: `npm i`
3. Run React app: `npm run start`
