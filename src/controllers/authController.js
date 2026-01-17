const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    //Validasi apakah req.body ada (Mencegah error destructuring)
    if (!req.body) {
        return res.status(400).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const { full_name, email, password, role } = req.body;

    //REQ-2: Validasi input wajib (Sesuai dokumen SRS)
    if (!full_name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Semua kolom (Nama, Email, Password) wajib diisi' 
        });
    }

    try {
        //Enkripsi Password (Security Requirement REQ-336)
        const hashedPassword = await bcrypt.hash(password, 10);

        //Eksekusi Query ke MySQL
        await db.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role || 'officer']
        );

        //Respon sukses (Gunakan 'success' agar sinkron dengan RegisterResponse di Android)
        res.status(201).json({ 
            success: true, 
            message: 'Petugas berhasil terdaftar' 
        });
    } catch (err) {
        //Penanganan error email duplikat atau database
        res.status(500).json({ 
            success: false, 
            message: err.code === 'ER_DUP_ENTRY' ? 'Email sudah terdaftar' : err.message 
        });
    }
};

exports.login = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const { email, password } = req.body;

    //REQ-2: Validasi input tidak boleh kosong
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email dan password wajib diisi' 
        });
    }

    try {
        //REQ-3: Verifikasi kredensial ke database
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User tidak ditemukan' 
            });
        }

        //Cek kecocokan password yang di-hash (REQ-337)
        const isMatch = await bcrypt.compare(password, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Password salah' 
            });
        }

        //Respon Login Berhasil
        res.json({
            success: true,
            message: 'Login Berhasil',
            token: "dummy-token-123", //dummy token agar sinkron dengan LoginResponse Android
            user: { 
                user_id: rows[0].user_id, 
                full_name: rows[0].full_name, 
                role: rows[0].role 
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error: ' + err.message 
        });
    }
};