import express from 'express';
import path from 'path';
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Adjust folder if needed

// Route to serve index.html or any other pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle all routes and send back shop.html (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});

// Example: Replace with your actual backend Heroku URL
const backendURL = "https://charlie-card-backend-fbbe5a6118ba.herokuapp.com/api/auth/register";

const response = await fetch(backendURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username, email, password }),
});
