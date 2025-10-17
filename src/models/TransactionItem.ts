import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Transaction } from "./Transaction.js";

// Model untuk detail items (opsional, jika ingin lebih normalize)
@Table({
  tableName: "transaction_items",
  timestamps: true,
})
export class TransactionItem extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Transaction)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare transactionId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare productId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare productName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare subtotal: number;

  @BelongsTo(() => Transaction, "transactionId")
  transaction!: Transaction;
}
