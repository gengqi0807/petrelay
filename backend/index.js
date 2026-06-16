const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const requestRoutes = require('./routes/request');
const applicationRoutes = require('./routes/application');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const petRoutes = require('./routes/pet');
const { sequelize } = require('./models');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'PetRelay backend running' });
});

const port = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected and models synchronized');
    app.listen(port, () => {
      console.log(`PetRelay backend listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
}

start();
