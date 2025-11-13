import { Category } from "../models/Category.js";
import slugify from "slugify";

export const categorySeeder = async () => {
  const categories = [
    { name: "Shampoo Bar" },
    { name: "Clarifying Shampoo" },
    { name: "Face" },
    { name: "Perfume & Candles" },
    { name: "Lotion & Butter" },
    { name: "Solid Soap" },
    { name: "Conditioner" },
    { name: "Daily Light" },
    { name: "Perfume Balm" },
    { name: "Bath Oil" }
  ];

  for (const category of categories) {
    const slug = slugify.default(category.name, { lower: true, strict: true });
    const created = await Category.findOrCreate({
      where: { name: category.name, slug },
      defaults: category,
    });

    if (created) {
      console.log(`Category ${category.name} created.`);
    } else {
      console.log(`Category ${category.name} already exists.`);
    }
  }
};
