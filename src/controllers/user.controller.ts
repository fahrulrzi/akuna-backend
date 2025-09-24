import type { Request, Response } from 'express';
import { User, UserRole } from '../models/User.js';

// Extend Request type untuk menyertakan user dari middleware
interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export const applyForAffiliate = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        // Cek jika user sudah menjadi affiliate
        if (user.role === UserRole.AFFILIATE) {
            return res.status(400).json({ message: 'Anda sudah menjadi affiliate.' });
        }

        // Ubah role user menjadi affiliate
        // NOTE: Di dunia nyata, proses ini seharusnya melalui persetujuan admin,
        // bukan langsung diubah. Ini adalah versi sederhananya.
        user.role = UserRole.AFFILIATE;
        await user.save();

        res.status(200).json({ message: 'Selamat! Anda berhasil mendaftar sebagai affiliate.' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
    }
};