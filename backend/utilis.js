function calculateSMA(data, windowSize) {
    if (data.length < windowSize) return [];
    const sma = [];
    for (let i = windowSize - 1; i < data.length; i++) {
        const window = data.slice(i - windowSize + 1, i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
        sma.push(avg);
    }
    return sma;
}

module.exports = { calculateSMA };