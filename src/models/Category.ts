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
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @HasMany(() => Product, "categoryId")
  products!: Product[];
}

