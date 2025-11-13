import { User } from "../models/User.js";

export const adminSeeder = async () => {
  const adminData = [
    {
      name: "Admin 1",
      email: "admin1@gmail.com",
      password: "admin123",
      role: "admin",
    },
  ];

  for (const admin of adminData) {
    const existingAdmin = await User.findOne({ where: { email: admin.email } });
    if (!existingAdmin) {
      await User.create(admin);
      console.log(`Admin with email ${admin.email} created.`);
    } else {
      console.log(`Admin with email ${admin.email} already exists.`);
    }
  }
};
