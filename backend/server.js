const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const PORT = 5001;

// 4.3: Retry logic with exponential backoff
const fetchWithRetry = async (url, maxRetries = 3, retryDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`Retrying... (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryDelay *= 2;
        }
    }
};

// 5.1: API endpoint with SMA calculation
app.get('/api/btc-data', async (req, res) => {
    try {
        const data = await fetchWithRetry(
            'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100'
        );

        const prices = data.map(k => parseFloat(k[4])); // Closing prices

        // 6.1: Calculate SMAs
        const calculateSMA = (data, window) => {
            return data.reduce((acc, _, idx, arr) => {
                if (idx < window - 1) return [...acc, null];
                const avg = arr.slice(idx - window + 1, idx + 1).reduce((sum, val) => sum + val, 0) / window;
                return [...acc, avg];
            }, []);
        };

        const sma5 = calculateSMA(prices, 5);
        const sma20 = calculateSMA(prices, 20);

        res.json({
            prices,
            sma5,
            sma20,
            currentPrice: prices.slice(-1)[0],
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed after retries' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));