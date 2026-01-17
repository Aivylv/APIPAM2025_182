const db = require('../config/database');

exports.getPatients = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patients ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Gagal mengambil data pasien: " + err.message 
        });
    }
};

exports.createPatient = async (req, res) => {
    const { rm_number, name, room_info } = req.body;

    if (!rm_number || !name) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nomor RM dan Nama Pasien wajib diisi' 
        });
    }

    try {
        await db.query(
            'INSERT INTO patients (rm_number, name, room_info) VALUES (?, ?, ?)', 
            [rm_number, name, room_info]
        );
        res.status(201).json({ 
            success: true, 
            message: 'Pasien berhasil didaftarkan ke sistem SafeGuard' 
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'Nomor Rekam Medis sudah terdaftar' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

exports.updatePatient = async (req, res) => {
    const { id } = req.params;
    const { rm_number, name, room_info } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE patients SET rm_number = ?, name = ?, room_info = ? WHERE patient_id = ?', 
            [rm_number, name, room_info, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Data pasien tidak ditemukan' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Data pasien berhasil diperbarui' 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

exports.deletePatient = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM patients WHERE patient_id = ?', [id]);
        res.json({ 
            success: true, 
            message: 'Data pasien telah dihapus dari sistem' 
        });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'Pasien tidak bisa dihapus karena masih memiliki barang titipan yang aktif' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};