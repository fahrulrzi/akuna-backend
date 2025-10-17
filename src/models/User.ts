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
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.BUYER, // Default role saat register
    })
    declare role: UserRole;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare address?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare city?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare state?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare postcode?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare country?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare phone?: string | null;

    // Address
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare addressFirstName?: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare addressLastName?: string | null;

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