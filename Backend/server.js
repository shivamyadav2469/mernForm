// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const formRoutes = require('./routes/formRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/form', formRoutes); // Ensure this route is properly defined

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
