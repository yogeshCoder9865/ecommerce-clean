// server/controllers/settingsController.js
const Setting = require('../models/Settings');

// @desc    Get current settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }

        const fields = [
            'portalName', 'logoUrl', 'faviconUrl', 'primaryColor', 'secondaryColor',
            'fontFamily', 'homepageBannerText', 'homepageBannerHtml',
            'companyEmail', 'companyPhone', 'companyAddress',
            'socialFacebook', 'socialTwitter', 'socialInstagram', 'socialLinkedIn',
            'metaTitle', 'metaDescription', 'googleAnalyticsId',
            'currencySymbol', 'enableMaintenanceMode', 'dashboardCustomHtml'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        settings.updatedAt = Date.now();
        const updated = await settings.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };
