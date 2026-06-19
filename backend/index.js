// env vars injected by App Runner in production, dotenv for local dev only
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const uploadRoute   = require('./routes/upload');
const downloadRoute = require('./routes/download');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware — runs on every request
app.use(cors());           // allows the frontend (different port) to call this API
app.use(express.json());   // parses JSON request bodies

// Routes
app.use('/api/upload',   uploadRoute);
app.use('/api/download', downloadRoute);

// Health check — useful to verify the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 VaultDrop backend running on http://localhost:${PORT}`);
});
