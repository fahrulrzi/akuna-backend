import "reflect-metadata";
import sequelize from "../config/database.js";
import { User, UserRole } from "../models/User.js";

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    const existingAdmin = await User.findOne({
      where: { email: "atmin@akuna.com" },
    });

    if (existingAdmin) {
      console.log("Admin account already exists. Skipping seed.");
      await sequelize.close();
      return;
    }

    const admin = await User.create({
      name: "atmin",
      email: "atmin@akuna.com",
      password: "hidupjok0",
      role: UserRole.ADMIN,
    });

    console.log("✅ Admin account created successfully!");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin account:", error);
    await sequelize.close();
    process.exit(1);
  }
};

seedAdmin();

