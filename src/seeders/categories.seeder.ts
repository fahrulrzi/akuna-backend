import { Category } from "../models/Category.js";
import slugify from "slugify";

export const categorySeeder = async () => {
  const categories = [
    {
      name: "Shampoo Bar",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Clarifying Shampoo",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Face",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Perfume & Candles",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Lotion & Butter",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Solid Soap",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Conditioner",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Daily Light",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Perfume Balm",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Bath Oil",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Soap",
      slug: "soap",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Shampoo",
      slug: "shampoo",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Lotion",
      slug: "lotion",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Perfume",
      slug: "perfume",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
    },
    {
      name: "Makeup",
      slug: "makeup",
      imageUrl:
        "https://pbs.twimg.com/media/GcwRlkZbcAMCzRJ.jpg",
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
