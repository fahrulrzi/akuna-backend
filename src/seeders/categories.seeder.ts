import { Category } from "../models/Category.js";

export const categorySeeder = async () => {
  const categories = [
    { name: "Soap" },
    { name: "Shampoo" },
    { name: "Lotion" },
    { name: "Perfume" },
    { name: "Makeup" },
  ];

  for (const category of categories) {
    const created = await Category.findOrCreate({
      where: { name: category.name },
      defaults: category,
    });

    if (created) {
      console.log(`Category ${category.name} created.`);
    } else {
      console.log(`Category ${category.name} already exists.`);
    }
  }
};
