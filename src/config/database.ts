import { Sequelize } from "sequelize-typescript";
import { config } from "./index.js";
import path from "path";

declare global {
  var __sequelize: any;
}

const commonOptionsBase = {
  dialect: (process.env.DB_DIALECT as any) || "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX || 5), 
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    freezeTableName: false,
  },
} as const;

function getDialectOptions() {
  if (config.db.url && config.supabase?.apiKey) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false,
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

const createSequelize = () => {
  const modelsPath = [path.resolve(__dirname, "../models")];
  if (config.db.url) {
    return new Sequelize(config.db.url, {
      ...commonOptionsBase,
      models: modelsPath,
      ...(dialectOptions ? { dialectOptions } : {}),
    });
  }

  return new Sequelize({
    ...commonOptionsBase,
    models: modelsPath,
    host: config.db.host!,
    username: config.db.user!,
    password: config.db.password!,
    database: config.db.name!,
    port: config.db.port ? Number(config.db.port) : undefined,
    ...(dialectOptions ? { dialectOptions } : {}),
  });
};

// reuse across serverless invocations
const getSequelize = (): Sequelize => {
  if (global.__sequelize) return global.__sequelize;
  const s = createSequelize();
  global.__sequelize = s;
  return s;
};

const sequelize = getSequelize();
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB authenticated");

    if (config.nodeEnv !== "production") {
      if (process.env.FORCE_DEV_SYNC === "true") {
        console.log("DEV: running sequelize.sync({ alter: true })");
        await sequelize.sync({ alter: true });
      } else {
        console.log("DEV: skip automatic sync (set FORCE_DEV_SYNC=true to enable)");
      }
    } else {
      console.log("Production mode: skipping automatic sync (use migrations)");
    }
  } catch (error) {
    console.error("Unable to connect to DB:", error);
    throw error;
  }
};

export default sequelize;
