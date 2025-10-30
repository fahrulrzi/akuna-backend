import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./User.js";

@Table({
  tableName: "affiliate_requests",
  timestamps: true,
})
export class AffiliateRequest extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  })
  declare status: "pending" | "approved" | "rejected";

  @BelongsTo(() => User, "userId")
  user!: User;
}
