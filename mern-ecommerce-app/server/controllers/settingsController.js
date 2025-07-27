// server/controllers/settingsController.js
const Setting = require('../models/Settings');

// @desc    Get current settings
// @route   GET /api/settings
// @access  Public (or private if only admin can view, but UI needs it)
const getSettings = async (req, res) => {
    try {
        // Find the single settings document, or create if it doesn't exist
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({}); // Create a default settings document
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    const { logoUrl, primaryColor, secondaryColor, fontFamily, dashboardCustomHtml } = req.body;
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({}); // Create if it doesn't exist
        }

        settings.logoUrl = logoUrl || settings.logoUrl;
        settings.primaryColor = primaryColor || settings.primaryColor;
        settings.secondaryColor = secondaryColor || settings.secondaryColor;
        settings.fontFamily = fontFamily || settings.fontFamily;
        settings.dashboardCustomHtml = dashboardCustomHtml !== undefined ? dashboardCustomHtml : settings.dashboardCustomHtml;
        settings.updatedAt = Date.now();

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };