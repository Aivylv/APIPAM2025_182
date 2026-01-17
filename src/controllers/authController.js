const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//REQ-335: Fungsi Register Petugas Baru
exports.register = async (req, res) => {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    try {
        //REQ-336: Hashing password sebelum disimpan ke database
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            'INSERT INTO users (full_name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [full_name, email, hashedPassword, role || 'officer']
        );

        res.status(201).json({ success: true, message: 'Registrasi Berhasil' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//REQ-01: Fungsi Login (Autentikasi Petugas)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan Password wajib diisi' });
    }

    try {
        //Cek apakah user ada di database
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const user = rows[0];

        //Verifikasi password dengan bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password salah' });
        }

        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                full_name: user.full_name, 
                role: user.role 
            },
            process.env.JWT_SECRET, //Mengambil dari .env
            { expiresIn: '1h' }     //REQ-337: Token berlaku selama 1 jam
        );

        res.json({
            success: true,
            message: 'Login Berhasil',
            token: token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};