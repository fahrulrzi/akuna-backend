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
}
