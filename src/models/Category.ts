import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Product } from "./Product.js";

@Table({
  tableName: "categories",
  timestamps: true,
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  // Relasi one-to-many dengan Product
  @HasMany(() => Product)
  products!: Product[];
}
