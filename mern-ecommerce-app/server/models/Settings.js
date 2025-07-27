// server/models/Settings.js
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    logoUrl: { type: String },
    primaryColor: { type: String, default: '#007bff' },
    secondaryColor: { type: String, default: '#6c757d' },
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    dashboardCustomHtml: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Setting', SettingSchema);