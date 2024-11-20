import {
    Table,
    Column,
    BelongsToMany,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt
} from 'sequelize-typescript';
import TaskTag from "./taskTag";
import Task from "./task";
import {baseTable} from "../helpers/baseTable";

@Table(baseTable("tag", "tags"))
class Tag extends Model {

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
        type: DataType.STRING(30),
        allowNull: false
    })
    title: string;

    @BelongsToMany(() => Task, () => TaskTag)
    tasks: Task[];
}

export default Tag;