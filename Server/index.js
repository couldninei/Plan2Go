const express = require('express');
const cors = require('cors');
const itineraryRoutes = require('./routes/itinerary');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', itineraryRoutes);

app.get('/', (req, res) => {
  console.log("ROOT HIT");
  res.send("Hello World");
});

app.get('/test', (req, res) => {
  console.log("TEST ROUTE HIT");
  res.json({ message: 'API working!' });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const exploreRoutes = require('./routes/explore');
app.use('/', exploreRoutes);