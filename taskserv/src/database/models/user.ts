import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    HasMany,
    Default,
    PrimaryKey
} from 'sequelize-typescript';
import Task from "./task";
import {baseTable} from "../helpers/baseTable";

@Table(baseTable("user", "users"))
class User extends Model {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    uid: string

    @CreatedAt
    createdAt: Date

    @UpdatedAt
    updatedAt: Date

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    name: string

    @Column({
        type: DataType.STRING(300),
        allowNull: false,
        unique: true
    })
    email: string

    @Column({
        type: DataType.STRING(300),
        allowNull: false,
    })
    password: string

    @Column({
        type: DataType.STRING(300),
        allowNull: true,
    })
    token: string

    @HasMany(() => Task)
    createdTasks: Task[];

    @HasMany(() => Task)
    assignedTasks: Task[];
}

export default User;