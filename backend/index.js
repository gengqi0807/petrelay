const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const requestRoutes = require('./routes/request');
const applicationRoutes = require('./routes/application');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const certificationRoutes = require('./routes/certificationApplication');
const petRoutes = require('./routes/pet');
const dashboardRoutes = require('./routes/dashboard');
const serviceRecordRoutes = require('./routes/serviceRecord');
const { sequelize } = require('./models');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/certification-applications', certificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/service-records', serviceRecordRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'PetRelay backend running' });
});

const port = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
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
