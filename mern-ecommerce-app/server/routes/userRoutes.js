// =========================================================
// server/routes/userRoutes.js
// --- REFINED VERSION (No changes needed) ---
// =========================================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getUsers,
    getUserById,
    updateUserProfile,
    updateUserStatus,
    adminResetUserPassword,
    deleteUser
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});
// --- End Multer Setup ---

router.route('/:id')
    // Multer middleware must be applied *before* the controller to parse the file
    .put(protect, upload.single('profileImage'), updateUserProfile)
    .get(protect, getUserById);

router.route('/')
    .get(protect, authorizeRoles('admin'), getUsers);

router.route('/:id/status')
    .put(protect, authorizeRoles('admin'), updateUserStatus);

router.route('/:id/reset-password')
    .put(protect, authorizeRoles('admin'), adminResetUserPassword);

router.route('/:id')
    .delete(protect, authorizeRoles('admin'), deleteUser);


module.exports = router;