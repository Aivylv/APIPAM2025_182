const db = require('../config/database');

// REQ-6 (Read) & REQ-10 (Search)
exports.getItems = async (req, res) => {
    try {
        const { keyword } = req.query; // Baca parameter ?keyword= dari Android
        
        let query = `
            SELECT i.*, p.name as patient_name, p.rm_number, u.full_name as officer_name 
            FROM items i 
            LEFT JOIN patients p ON i.patient_id = p.patient_id 
            LEFT JOIN users u ON i.user_id = u.user_id 
        `;
        
        const params = [];

        // Logika Pencarian (REQ-10)
        if (keyword) {
            query += ` WHERE i.item_name LIKE ? OR p.name LIKE ?`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        query += ` ORDER BY i.entry_date DESC`;

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REQ-14 (Create)
exports.createItem = async (req, res) => {
    // PERBAIKAN: Gunakan 'condition' (sesuai Android), bukan 'condition_text'
    const { item_name, condition, patient_id, user_id } = req.body; 

    if (!item_name || !user_id) {
        return res.status(400).json({ message: 'Data wajib tidak lengkap' });
    }

    try {
        await db.query(
            'INSERT INTO items (item_name, `condition`, patient_id, user_id, status, entry_date) VALUES (?, ?, ?, ?, "Disimpan", NOW())',
            [item_name, condition, patient_id, user_id]
        );
        res.status(201).json({ isSuccess: true, message: 'Data Barang Berhasil Disimpan' });
    } catch (err) {
        res.status(500).json({ isSuccess: false, message: err.message });
    }
};

// REQ-18 (Update)
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { status, receiver } = req.body;

    try {
        // REQ-330: Validasi Safety
        if (status === 'Dikembalikan' && !receiver) {
            return res.status(400).json({ message: 'Nama penerima wajib diisi!' });
        }

        await db.query(
            'UPDATE items SET status = ?, receiver = ? WHERE item_id = ?', 
            [status, receiver, id]
        );
        res.json({ isSuccess: true, message: 'Status berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REQ-20 (Delete)
exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM items WHERE item_id = ?', [id]);
        res.json({ isSuccess: true, message: 'Data dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};