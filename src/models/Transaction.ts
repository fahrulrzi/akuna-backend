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
import { TransactionItem } from "./TransactionItem.js";

@Table({
  tableName: "transactions",
  timestamps: true,
})
export class Transaction extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare orderId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: "[]",
  })
  declare products: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.ENUM("pending", "success", "failed", "expired", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  })
  declare status: "pending" | "success" | "failed" | "expired" | "cancelled";

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentType: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare transactionId: string;

  // @Column({
  //   type: DataType.TEXT,
  //   allowNull: true,
  // })
  // declare snapToken: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare snapRedirectUrl: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declare shippingCost: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare shippingDetails: object;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare biteshipId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare trackingId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare courierResi: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "idle",
  })
  declare deliveryStatus: string;

  @BelongsTo(() => User, "userId")
  user!: User;

  @HasMany(() => TransactionItem, "transactionId")
  items!: TransactionItem[];
}
