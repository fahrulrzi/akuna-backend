import type { Request, Response } from "express";
import { Cart } from "../models/Cart.js";
import { CartItem } from "../models/CartItem.js";
import { Product } from "../models/Product.js";
import { config } from "../config/index.js";
import { Affiliate } from "../models/Affiliate.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

const formatCartResponse = (cart: Cart | null) => {
  if (!cart) {
    return {
      id: null,
      userId: null,
      items: [],
      subtotal: 0,
      itemCount: 0,
      totalItems: 0,
    };
  }

  const plainCart = cart.get({ plain: true }) as Cart & {
    items?: Array<
      CartItem & {
        product: {
          id: number;
          name: string;
          price: string | number;
          stock: number;
          images: string[];
          description?: string;
        };
      }
    >;
  };

  const items = plainCart.items ?? [];
  let subtotal = 0;

  const formattedItems = items.map((item) => {
    const rawPrice = item.product?.price ?? 0;
    const numericPrice =
      typeof rawPrice === "number"
        ? rawPrice
        : Number.parseFloat(rawPrice) || 0;
    const itemSubtotal = numericPrice * item.quantity;
    subtotal += itemSubtotal;

    return {
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product?.id,
        name: item.product?.name,
        price: numericPrice,
        stock: item.product?.stock,
        images: item.product?.images,
        description: item.product?.description,
      },
      quantity: item.quantity,
      subtotal: itemSubtotal,
    };
  });

  return {
    id: plainCart.id,
    userId: plainCart.userId,
    items: formattedItems,
    subtotal,
    itemCount: formattedItems.length,
    totalItems: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity, referralCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      });
    }

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required.",
        data: null,
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
        data: null,
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
        data: null,
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
        data: null,
      });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const existingCartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`,
          data: null,
        });
      }

      existingCartItem.quantity = newQuantity;
      if (
        referralCode &&
        referralCode !== existingCartItem.referralCode &&
        referralCode !== ""
      ) {
        const referralAffiliate = await Affiliate.findOne({
          where: { referralCode },
        });

        if (!referralAffiliate) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code.",
            data: null,
          });
        }
        existingCartItem.referralCode = referralCode;
      }

      await existingCartItem.save();

      const updatedCart = await Cart.findByPk(cart.id, {
        include: [
          {
            model: CartItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "price", "stock", "images"],
              },
            ],
          },
        ],
      });

      if (!updatedCart) {
        return res.status(500).json({
          success: false,
          message: "Cart tidak ditemukan setelah pembaruan.",
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Item quantity updated in cart.",
        data: formatCartResponse(updatedCart),
      });
    }

    const cartItem = await CartItem.create({
      cartId: cart.id,
      productId: productId,
      quantity: quantity,
    });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price", "stock", "images"],
            },
          ],
        },
      ],
    });

    if (!updatedCart) {
      return res.status(500).json({
        success: false,
        message: "Cart tidak ditemukan setelah penambahan item.",
        data: null,
      });
    }

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully.",
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      });
    }

    let cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "price",
                "stock",
                "images",
                "description",
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully.",
      data: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
        data: null,
      });
    }

    const cartItem = await CartItem.findByPk(itemId, {
      include: [
        {
          model: Cart,
          as: "cart",
        },
        {
          model: Product,
          as: "product",
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
        data: null,
      });
    }

    const cartRecord = cartItem.get("cart") as Cart | undefined;

    if (!cartRecord || cartRecord.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this cart item.",
        data: null,
      });
    }

    const product = cartItem.get("product") as Product | undefined;
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
        data: null,
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
        data: null,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const cart = await Cart.findByPk(cartItem.cartId, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "price",
                "stock",
                "images",
                "description",
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully.",
      data: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      });
    }

    const cartItem = await CartItem.findByPk(itemId, {
      include: [
        {
          model: Cart,
          as: "cart",
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
        data: null,
      });
    }

    const cartRecord = cartItem.get("cart") as Cart | undefined;

    if (!cartRecord || cartRecord.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to remove this cart item.",
        data: null,
      });
    }

    const cartId = cartItem.cartId;
    await cartItem.destroy();

    const cart = await Cart.findByPk(cartId, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: [
                "id",
                "name",
                "price",
                "stock",
                "images",
                "description",
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully.",
      data: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
        data: null,
      });
    }

    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty.",
        data: {
          id: null,
          userId: userId,
          items: [],
          subtotal: 0,
          itemCount: 0,
          totalItems: 0,
        },
      });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: {
        id: cart.id,
        userId: cart.userId,
        items: [],
        subtotal: 0,
        itemCount: 0,
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};
