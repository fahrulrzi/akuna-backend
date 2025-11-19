import { Sequelize } from "sequelize-typescript";
import { config } from "./index.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";
import { Blog } from "../models/Blog.js";
import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { AffiliateRequest } from "../models/AffiliateRequest.js";
import { Affiliate } from "../models/Affiliate.js";
import { Setting } from "../models/Setting.js";

const models = [
  User,
  Category,
  Product,
  Transaction,
  TransactionItem,
  Blog,
  Cart,
  CartItem,
  AffiliateRequest,
  Affiliate,
  Setting,
]; // Daftarkan semua model di sini

const commonOptions = {
  dialect: "postgres" as const,
  models,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    freezeTableName: false,
  },
};

function getDialectOptions() {
  if (config.supabase.url && config.supabase.apiKey) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: config.nodeEnv === "production",
      },
    };
  }

  if (config.db.ssl) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: config.nodeEnv === "production",
      },
    };
  }

  return undefined;
}

const dialectOptions = getDialectOptions();

const sequelize = config.supabase.url
  ? new Sequelize(config.supabase.url, {
      ...commonOptions,
      ...(dialectOptions ? { dialectOptions } : {}),
    })
  : new Sequelize({
      ...commonOptions,
      host: config.db.host!,
      username: config.db.user!,
      password: config.db.password!,
      database: config.db.name!,
      port: config.db.port!,
      ...(dialectOptions ? { dialectOptions } : {}),
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (config.nodeEnv !== "production") {
      await sequelize.sync({ alter: true });
      console.log("DB synced (alter).");
    } else {
      console.log("Production mode: skip sync, use migrations.");
    }
    console.log("PostgreSQL Connection established ✅");
  } catch (error) {
    console.error("Unable to connect to DB:", error);
    throw error;
  }
};

export default sequelize;
