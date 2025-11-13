import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

export const productSeeder = async () => {
  const products = [
    {
      name: "DHT Blocker Green Tea Shampoo Bar",
      price: 28000,
      description:
        "Green tea rich in antioxidants helps prevent hair loss by inhibiting DHT and promoting hair regrowth.",
      categoryName: "Shampoo Bar",
    },
    {
      name: "Mineral Rich Moringa Shampoo Bar",
      price: 47000,
      description:
        "Moringa, high in vitamins and minerals, stimulates hair growth and ensures a healthy scalp.",
      categoryName: "Shampoo Bar",
    },
    {
      name: "Exfoliating Papaya Shampoo Bar",
      price: 27000,
      description:
        "Papaya enzymes gently exfoliate the scalp, promoting healthy hair growth.",
      categoryName: "Shampoo Bar",
    },
    {
      name: "Clarifying Shampoo : First Rescue",
      price: 76500,
      description:
        "Deep-cleansing shampoo that removes buildup and impurities, leaving hair refreshed and clean.",
      categoryName: "Clarifying Shampoo",
    },
    {
      name: "Clarifying Shampoo : No Salt",
      price: 85500,
      description:
        "Gentle clarifying shampoo without salt, ideal for sensitive scalps and daily use.",
      categoryName: "Clarifying Shampoo",
    },
    {
      name: "Akuna Botanical Clarifying Shampoo Unstrip for Dry Dehydrated Hair Sensitive Scalp",
      price: 76500,
      description:
        "Moisturizing clarifying shampoo designed for dry and dehydrated hair, gentle on sensitive scalps.",
      categoryName: "Clarifying Shampoo",
    },
    {
      name: "Darken Blue Flower Soap Bar",
      price: 40200,
      description:
        "Natural soap bar with blue flower extract for gentle cleansing and skin nourishment.",
      categoryName: "Solid Soap",
    },
    {
      name: "Cinnamon Soap Bar",
      price: 28750,
      description:
        "Aromatic cinnamon soap bar with warming properties and natural cleansing benefits.",
      categoryName: "Solid Soap",
    },
    {
      name: "Sandalwood Soap Bar",
      price: 32200,
      description:
        "Luxurious sandalwood soap bar with calming fragrance and skin-soothing properties.",
      categoryName: "Solid Soap",
    },
    {
      name: "Cinci Conditioner Bar",
      price: 31500,
      description:
        "Solid conditioner bar for soft, manageable hair without plastic packaging.",
      categoryName: "Conditioner",
    },
    {
      name: "Lime Patchouli Daily Light Shampoo",
      price: 62500,
      description:
        "Lightweight daily shampoo with refreshing lime and earthy patchouli for everyday hair care.",
      categoryName: "Daily Light",
    },
    {
      name: "Lime Patchouli Daily Light Conditioner",
      price: 55000,
      description:
        "Lightweight daily conditioner with lime and patchouli for soft, manageable hair.",
      categoryName: "Daily Light",
    },
    {
      name: "Lavender Geranium Daily Light Conditioner",
      price: 53500,
      description:
        "Lightweight conditioner with calming lavender and geranium for daily use.",
      categoryName: "Daily Light",
    },
    {
      name: "Akuna Botanical Perfume Balm - Astronout Dream",
      price: 35500,
      description:
        "Solid perfume balm with a dreamy, celestial fragrance that transports you to the stars.",
      categoryName: "Perfume Balm",
    },
    {
      name: "Akuna Botanical Perfume Balm - Bliss",
      price: 45000,
      description:
        "Solid perfume balm with a blissful, uplifting scent that brings joy and positivity.",
      categoryName: "Perfume Balm",
    },
    {
      name: "Akuna Botanical Perfume Balm - Jakarta Diversity",
      price: 36000,
      description:
        "Solid perfume balm celebrating the diverse scents of Jakarta with a unique aromatic blend.",
      categoryName: "Perfume Balm",
    },
  ];

  for (const product of products) {
    const category = await Category.findOne({ where: { name: product.categoryName } });

    if (!category) {
      console.log(`Category ${product.categoryName} not found. Skipping product ${product.name}.`);
      continue;
    }

    const [record, created] = await Product.findOrCreate({
      where: { name: product.name },
      defaults: {
        name: product.name,
        price: product.price,
        description: product.description ?? "",
        stock: 50,
        images: [],
        imageKeys: [],
        categoryId: category.id,
      },
    });

    if (created) {
      console.log(`Product ${record.name} created.`);
    } else {
      console.log(`Product ${record.name} already exists.`);
    }
  }
};
