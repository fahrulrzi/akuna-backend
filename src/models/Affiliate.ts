import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  HasMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { AffiliateCommission } from "./AffiliateCommission.js";
import { WithdrawRequest } from "./WithdrawRequest.js";
export enum BankType {
  BCA = "BCA",
  MANDIRI = "Mandiri",
  BNI = "BNI",
  BRI = "BRI",
  CIMB = "CIMB",
}

@Table({
  tableName: "affiliates",
  timestamps: true,
})
export class Affiliate extends Model {
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
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare referralCode: string;

  @Column({
    type: DataType.ENUM(...Object.values(BankType)),
    allowNull: false,
  })
  declare bankType: BankType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare nameOnAccount: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare accountNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare bankBookImageUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare bankBookImageKey: string;

  //   @Column({
  //     type: DataType.FLOAT,
  //     allowNull: false,
  //     defaultValue: 0.1,
  //   })
  //   declare commissionRate: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  declare totalCommission: number;

  @BelongsTo(() => User, "userId")
  user!: User;
  
  @HasMany(() => AffiliateCommission)
  declare commissions: AffiliateCommission[];

  @HasMany(() => WithdrawRequest)
  declare withdrawRequests: WithdrawRequest[];
}
