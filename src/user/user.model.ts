import { Column, DataType, Model, Table } from "sequelize-typescript";

type UserCreationAttr = {
  id: number;
  premiumDateEnd: number;
  quantityChats: number;
  quantityMessages: number;
  lastInterlocutorUserId: number;
};

@Table({ tableName: "users" })
export class User extends Model<User, UserCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  id: number;

  @Column({ type: DataType.BIGINT, defaultValue: null, allowNull: true })
  premiumDateEnd: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  quantityChats: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  quantityMessages: number;

  @Column({ type: DataType.BIGINT, defaultValue: 0, allowNull: false })
  lastInterlocutorUserId: number;
}
