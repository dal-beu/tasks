import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    BelongsToMany
} from 'sequelize-typescript';
import User from "./user";
import {baseTable} from "../helpers/baseTable";
import TaskTag from "./taskTag";
import Tag from "./tag";

@Table(baseTable("task", "tasks"))
class Task extends Model {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number

    @CreatedAt
    createdAt: Date

    @UpdatedAt
    updatedAt: Date

    @Column({
        type: DataType.STRING(50),
        allowNull: false
    })
    title: string;

    @Column({
        type: DataType.STRING(300),
        allowNull: false
    })
    description: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false
    })
    priority: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: true
    })
    status: string;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    dueDate: Date;

    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    @ForeignKey(() => User)
    createdBy: string;

    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    @ForeignKey(() => User)
    assignedTo: string;

    @BelongsToMany(() => Tag, () => TaskTag)
    tags: Tag[];
}

export default Task;