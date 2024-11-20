import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
} from 'sequelize-typescript';
import Task from "./task";
import Tag from "./tag";

import {baseTable} from "../helpers/baseTable";

@Table(baseTable("taskTag", "taskTags"))
class TaskTag extends Model {

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

    @ForeignKey(() => Tag)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    tagId: number;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    taskId: number;
}

export default TaskTag;

