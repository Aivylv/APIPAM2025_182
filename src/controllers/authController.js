const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    //Validasi Body
    if (!req.body) return res.status(400).json({ success: false, message: 'Data kosong' });

    const { full_name, email, password, role } = req.body;

    //SRS REQ-2: Validasi Input
    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); //SRS REQ-336: Hashing
        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'officer']
        );
        res.status(201).json({ success: true, message: 'Registrasi Berhasil' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    if (!req.body) return res.status(400).json({ success: false, message: 'Data kosong' });
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email & Password wajib diisi' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Password salah' });

        res.json({
            success: true,
            message: 'Login Berhasil',
            token: "dummy-token-123",
            user: { 
                user_id: rows[0].user_id, 
                full_name: rows[0].full_name, 
                role: rows[0].role 
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};