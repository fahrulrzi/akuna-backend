import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./User.js";

export enum AffiliateRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Table({
  tableName: "affiliate_requests",
  timestamps: true,
})
export class AffiliateRequest extends Model {
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
  })
  declare userId: number;

  @Column({
    type: DataType.ENUM(...Object.values(AffiliateRequestStatus)),
    allowNull: false,
    defaultValue: AffiliateRequestStatus.PENDING,
  })
  declare status: AffiliateRequestStatus;

  @BelongsTo(() => User, "userId")
  user!: User;
}
