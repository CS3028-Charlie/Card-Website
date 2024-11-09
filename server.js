const cors = require('cors');
const express = require('express');
const path = require('path');
const app = express();

app.use(cors({
  origin: 'https://charlie-card-backend-fbbe5a6118ba.herokuapp.com', // Allow requests from frontend
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Adjust folder if needed

// Route to serve index.html or any other pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle all routes and send back shop.html (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
