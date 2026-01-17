const db = require('../config/database');

// REQ-6: Menampilkan daftar barang (Read)
exports.getAllItems = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, p.name as patient_name, p.rm_number, u.full_name as officer_name 
            FROM items i 
            JOIN patients p ON i.patient_id = p.patient_id 
            JOIN users u ON i.user_id = u.user_id 
            ORDER BY i.entry_date DESC`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REQ-14: Pencatatan barang baru (Create)
exports.createItem = async (req, res) => {
    const { item_name, condition_text, patient_id, user_id } = req.body;
    try {
        await db.query(
            'INSERT INTO items (item_name, condition_text, patient_id, user_id, status) VALUES (?, ?, ?, ?, "Disimpan")',
            [item_name, condition_text, patient_id, user_id]
        );
        res.status(201).json({ isSuccess: true, message: 'Data Barang Berhasil Disimpan' });
    } catch (err) {
        res.status(500).json({ isSuccess: false, message: 'Gagal menyimpan data' });
    }
};

// REQ-18: Update status barang (Update)
exports.updateItemStatus = async (req, res) => {
    const { id } = req.params;
    const { status, receiver } = req.body;
    try {
        // REQ-330: Validasi receiver jika status 'Kembali'
        if (status === 'Kembali' && !receiver) {
            return res.status(400).json({ message: 'Nama penerima wajib diisi untuk pengembalian' });
        }
        await db.query('UPDATE items SET status = ?, receiver = ? WHERE item_id = ?', [status, receiver, id]);
        res.json({ isSuccess: true, message: 'Status barang diperbarui' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REQ-20: Penghapusan barang (Delete)
exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM items WHERE item_id = ?', [id]);
        res.json({ isSuccess: true, message: 'Data berhasil dihapus permanen' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus data' });
    }
};