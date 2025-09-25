import { Sequelize } from 'sequelize-typescript';
import { config } from './index.js';
import { User } from '../models/User.js';

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.db.host ?? '',
    username: config.db.user ?? '',
    password: config.db.password ?? '',
    database: config.db.name ?? '',
    port: config.db.port,
    logging: false,
    models: [User], // Daftarkan semua model di sini
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); 
        console.log('PostgreSQL Connection has been established successfully. ✅');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default sequelize;