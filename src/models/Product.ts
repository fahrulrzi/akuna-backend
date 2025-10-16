// src/models/Product.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Category } from "./Category.js";

@Table({
  tableName: "products",
  timestamps: true,
})
export class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true, 
  })
  description!: string;

  @Column({
    type: DataType.DECIMAL(10, 2), 
    allowNull: false,
  })
  price!: number;

  @Column({
    type: DataType.JSON, 
    allowNull: false,
    defaultValue: [], 
  })
  images!: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [], 
  })
  imageKeys!: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  stock!: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;

  @BelongsTo(() => Category)
  category?: Category;
}
