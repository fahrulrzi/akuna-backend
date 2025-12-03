import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Affiliate } from "./Affiliate.js";

@Table({ tableName: "withdraw_requests", timestamps: true })
export class WithdrawRequest extends Model {
  @ForeignKey(() => Affiliate)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare affiliateId: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare amount: number;

  @Column({ 
    type: DataType.ENUM('Pending', 'Approved', 'Rejected'), 
    defaultValue: 'Pending' 
  })
  declare status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare proofImageKey: string; 

  @BelongsTo(() => Affiliate)
  affiliate!: Affiliate;
}