import { Category } from "../models/Category.js";
import slugify from "slugify";

export const categorySeeder = async () => {
  const categories = [
    {
      name: "Shampoo Bar",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/2b21e472-9aa5-43e3-8aee-476c01a90899.jpg",
    },
    {
      name: "Clarifying Shampoo",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/5f3f6f6c-3f7e-4f12-9f12-6e2f5e4e4b8b.jpg",
    },
    {
      name: "Face",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/face-category.jpg",
    },
    {
      name: "Perfume & Candles",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/62e254fc-a9cb-48da-a7d2-381680304db4.png",
    },
    {
      name: "Lotion & Butter",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/lotion-category.jpg",
    },
    {
      name: "Solid Soap",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/solid-soap-category.jpg",
    },
    {
      name: "Conditioner",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/conditioner-category.jpg",
    },
    {
      name: "Daily Light",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/daily-light-category.jpg",
    },
    {
      name: "Perfume Balm",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/perfume-balm-category.jpg",
    },
    {
      name: "Bath Oil",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/bath-oil-category.jpg",
    },
    {
      name: "Soap",
      slug: "soap",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/solid-soap-category.jpg",
    },
    {
      name: "Shampoo",
      slug: "shampoo",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/shampoo-category.jpg",
    },
    {
      name: "Lotion",
      slug: "lotion",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/lotion-category.jpg",
    },
    {
      name: "Perfume",
      slug: "perfume",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/perfume-category.jpg",
    },
    {
      name: "Makeup",
      slug: "makeup",
      imageUrl:
        "https://pub-d843a2ecaefc44d1b76d8109ceebcfe3.r2.dev/products/makeup-category.jpg",
    },
  ];

  for (const category of categories) {
    // const slug = slugify.default(category.name, { lower: true, strict: true });
    const slug = slugify(category.name, { lower: true, strict: true });
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
