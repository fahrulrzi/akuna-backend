import 'reflect-metadata'; // Wajib diimport di paling atas
import express from 'express';
import type { Application, Request, Response } from 'express';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';

const app: Application = express();
const PORT = config.port;

app.use(cors({origin: '*'}));

// Middlewares
app.use(express.json()); // Untuk parsing body JSON

// Database Connection
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/delivery', deliveryRoutes);


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});