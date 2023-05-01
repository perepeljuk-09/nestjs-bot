import { Model, Table, Column, DataType } from "sequelize-typescript";

type TaskCreationAttr = {
    name: string;
    isCompleted: boolean;
}

@Table({tableName: "tasks"})
export class Task extends Model<Task, TaskCreationAttr> {
    
    @Column({ type: DataType.INTEGER, primaryKey: true,  unique: true, autoIncrement: true, allowNull: false})
    id: number;

    @Column({type: DataType.STRING, allowNull: false})
    name: string;

    @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
    isCompleted: boolean;
}