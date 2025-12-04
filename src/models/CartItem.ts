import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Cart } from "./Cart.js";
import { Product } from "./Product.js";
import { Affiliate } from "./Affiliate.js";

@Table({
  tableName: "cart_items",
  timestamps: true,
})
export class CartItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Cart)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare cartId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  })
  declare quantity: number;

  @ForeignKey(() => Affiliate)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare referralCode: string | null;

  @BelongsTo(() => Cart, "cartId")
  cart!: Cart;

  @BelongsTo(() => Product, "productId")
  product!: Product;

  @BelongsTo(() => Affiliate, "referralCode")
  affiliate!: Affiliate | null;
}
