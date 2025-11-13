import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "settings",
  timestamps: false,
})
export class Setting extends Model {
  @Column({ type: DataType.STRING, primaryKey: true })
  declare key: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare value: string;
}
