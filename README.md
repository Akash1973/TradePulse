# Algorithmic Trading Dashboard



A React-based trading dashboard that visualizes BTC/USDT price data with moving average crossover strategy signals, using Binance API for real-time data.

## Features

- *Real-time Price Data*: Fetches BTC/USDT prices from Binance API
- *Technical Indicators*:
  - 5-period Simple Moving Average (SMA)
  - 20-period Simple Moving Average (SMA)
- *Trading Signals*:
  - BUY when SMA-5 crosses above SMA-20
  - SELL when SMA-5 crosses below SMA-20
- *Interactive Chart*: Built with Chart.js
- *Responsive Design*: Works on desktop and mobile
- *Error Handling*: Graceful fallback to mock data

## Tech Stack

- *Frontend*: React, Chart.js, react-chartjs-2
- *Backend*: Node.js, Express
- *API*: Binance Public API
- *Styling*: CSS with modern UI components

## Installation

### Prerequisites
- Node.js 
- npm

### 1. Backend Setup
```bash
cd backend
npm install
npm start

Server runs on http://localhost:5001

2. Frontend Setup
bash
cd frontend
npm install
npm start
App runs on http://localhost:3000
