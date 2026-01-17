const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { full_name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'officer']
        );
        res.status(201).json({ isSuccess: true, message: 'Petugas berhasil terdaftar' });
    } catch (err) {
        res.status(500).json({ isSuccess: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ isSuccess: false, message: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) return res.status(401).json({ isSuccess: false, message: 'Password salah' });

        res.json({
            isSuccess: true,
            message: 'Login Berhasil',
            user: { user_id: rows[0].user_id, full_name: rows[0].full_name, role: rows[0].role }
        });
    } catch (err) {
        res.status(500).json({ isSuccess: false, message: 'Internal Server Error' });
    }
};