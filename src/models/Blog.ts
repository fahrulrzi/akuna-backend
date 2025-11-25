import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  tableName: "blogs",
  timestamps: true,
})
export class Blog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare author: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare thumbnailUrl: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare thumbnailKey: string | null;
}


