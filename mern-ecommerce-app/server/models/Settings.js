const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    // Branding & Appearance
    portalName: { type: String, default: 'Yogi Tech' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#3498db' },
    secondaryColor: { type: String, default: '#2ecc71' },
    fontFamily: { type: String, default: 'Inter, Arial, sans-serif' },
    homepageBannerText: { type: String, default: '' },
    homepageBannerHtml: { type: String, default: '' },

    // Contact & Social Media
    companyEmail: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    socialFacebook: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialLinkedIn: { type: String, default: '' },

    // SEO & Analytics
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },

    // Advanced Options
    currencySymbol: { type: String, default: '$' },
    enableMaintenanceMode: { type: Boolean, default: false },
    dashboardCustomHtml: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', SettingSchema);
