const app = require('./app');
const { testConnection } = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set port
const PORT = process.env.PORT || 5000;

// Test database connection before starting server
(async () => {
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } else {
    console.error('Failed to connect to database. Server will not start.');
    process.exit(1);
  }
})();
