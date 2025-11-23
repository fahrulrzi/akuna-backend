import { User } from "../models/User";

export const ownerSeeder = async () => {
  const ownerData = [
    {
      name: "Owner 1",
      email: "owner1@gmail.com",
      password: "ownerPass123",
      role: "owner",
    },
  ];

  for (const owner of ownerData) {
    const existingOwner = await User.findOne({ where: { email: owner.email } });
    if (!existingOwner) {
      await User.create(owner);
      console.log(`Owner with email ${owner.email} created.`);
    } else {
      console.log(`Owner with email ${owner.email} already exists.`);
    }
  }
};
