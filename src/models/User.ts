import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';

// Enum untuk role
export enum UserRole {
    BUYER = 'pembeli',
    AFFILIATE = 'affiliate',
}

@Table({
    tableName: 'users',
    timestamps: true,
})
export class User extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.BUYER, // Default role saat register
    })
    role!: UserRole;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    alamat!: string;

    // Hook untuk hash password sebelum user dibuat
    @BeforeCreate
    static async hashPassword(instance: User) {
        if (instance.password) {
            const salt = await bcrypt.genSalt(10);
            instance.password = await bcrypt.hash(instance.password, salt);
        }
    }

    // Method untuk membandingkan password
    public async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}