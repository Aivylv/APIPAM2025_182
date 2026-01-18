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
    //Android akan mengirim 'photo' sebagai file, dan data lain sebagai text
    const { item_name, condition, patient_id, user_id } = req.body;
    const photo_path = req.file ? req.file.filename : null; 

    if (!item_name || !user_id || !patient_id) {
        return res.status(400).json({ message: 'Data wajib tidak lengkap' });
    }

    try {
        await db.query(
            //Tambahkan photo_path ke query
            'INSERT INTO items (item_name, `condition`, patient_id, user_id, status, photo_path, entry_date) VALUES (?, ?, ?, ?, "Disimpan", ?, NOW())',
            [item_name, condition, patient_id, user_id, photo_path]
        );
        res.status(201).json({ isSuccess: true, message: 'Data Barang Berhasil Disimpan' });
    } catch (err) {
        console.log("ERROR SQL DETAIL:", err);
        res.status(500).json({ isSuccess: false, message: err.message });
    }
};

// REQ-18 (Update)
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { item_name, condition, status, receiver } = req.body;

    try {
        if (status === 'Dikembalikan' && !receiver) {
            return res.status(400).json({ message: 'Nama penerima wajib diisi saat pengembalian!' });
        }

        await db.query(
            'UPDATE items SET item_name = ?, `condition` = ?, status = ?, receiver = ? WHERE item_id = ?', 
            [item_name, condition, status, receiver, id]
        );

        res.json({ isSuccess: true, message: 'Data barang berhasil diperbarui' });
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

//Mengambil detail 1 barang berdasarkan ID (REQ-12)
exports.getItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT i.*, p.name as patient_name, p.rm_number, u.full_name as officer_name 
            FROM items i 
            LEFT JOIN patients p ON i.patient_id = p.patient_id 
            LEFT JOIN users u ON i.user_id = u.user_id 
            WHERE i.item_id = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Barang tidak ditemukan' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};