import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CartItem } from "./CartItem.js";

@Table({
  tableName: "carts",
  timestamps: true,
})
export class Cart extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare userId: number;

  @BelongsTo(() => User, "userId")
  user!: User;

  @HasMany(() => CartItem, "cartId")
  items!: CartItem[];
}

