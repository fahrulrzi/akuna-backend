import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Affiliate } from "./Affiliate.js";

@Table({ tableName: "affiliate_commissions", timestamps: true })
export class AffiliateCommission extends Model {
  @ForeignKey(() => Affiliate)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare affiliateId: number;

  @Column({ type: DataType.STRING, allowNull: false }) 
  declare orderId: string; 

  @Column({ type: DataType.STRING, allowNull: false })
  declare productName: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare purchaseValue: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare commissionAmount: number;

  @Column({ 
    type: DataType.ENUM('Pending', 'Paid', 'Cancelled'), 
    defaultValue: 'Pending' 
  })
  declare status: string;

  @BelongsTo(() => Affiliate)
  affiliate!: Affiliate;
}