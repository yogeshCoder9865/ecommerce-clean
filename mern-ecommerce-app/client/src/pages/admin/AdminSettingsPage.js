// client/src/pages/admin/AdminSettingsPage.js
import React, { useState, useEffect } from 'react';
import AdminNav from '../../components/admin/AdminNav';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assesets/logo.png';

const AdminSettingsPage = () => {
    const { authAxios } = useAuth();
    const [settings, setSettings] = useState({
        logoUrl: '',
        primaryColor: '#3498db', // Default primary color
        secondaryColor: '#2ecc71', // Default secondary color
        fontFamily: 'Inter, Arial, sans-serif', // Default font family
        dashboardCustomHtml: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- Custom Message Box Functions (Re-used for consistency) ---
    const showMessageBox = (message, type = 'info', onConfirm) => {
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 2000;
            text-align: center;
            font-family: 'Inter', Arial, sans-serif;
            max-width: 400px;
            width: 90%;
            animation: fadeIn 0.3s ease-out;
            border: 2px solid ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#007bff')};
        `;
        messageBox.innerHTML = `
            <p style="font-size: 1.2em; margin-bottom: 20px; color: ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#333')};">${message}</p>
            <button id="msgBoxConfirmBtn" style="
                padding: 10px 20px;
                background-color: ${type === 'error' ? '#e74c3c' : (type === 'success' ? '#28a745' : '#007bff')};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
                transition: background-color 0.3s ease;
            ">OK</button>
        `;
        document.body.appendChild(messageBox);

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(styleSheet);

        document.getElementById('msgBoxConfirmBtn').onclick = () => {
            messageBox.style.animation = 'fadeOut 0.3s ease-in forwards';
            messageBox.addEventListener('animationend', () => {
                document.body.removeChild(messageBox);
                document.head.removeChild(styleSheet);
                if (onConfirm) onConfirm();
            });
        };
    };

    // --- Fetch Settings on component mount ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await authAxios.get('/settings');
                // Assuming your /api/settings returns a single settings object
                setSettings(res.data);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [authAxios]);

    // --- Handlers for form changes ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            // You'll need to implement the PUT /api/settings endpoint on your backend
            const res = await authAxios.put('/settings', settings);
            setSettings(res.data); // Update state with confirmed saved settings
            showMessageBox('Settings updated successfully!', 'success');
        } catch (err) {
            console.error('Failed to update settings:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to update settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageContainerStyle}>
            <AdminNav />
            <div style={contentAreaStyle}>
                <div style={headerContainerStyle}>
                    <div style={brandContainerStyle}>
                        <img src={logo} alt="Yogi Tech Logo" style={brandLogoStyle} />
                        <h1 style={brandNameStyle}>Yogi Tech Admin</h1>
                    </div>
                    <h2 style={pageTitleStyle}>Portal Settings</h2>
                </div>

                {error && <p style={errorMessageStyle}>{error}</p>}
                {successMessage && <p style={successMessageStyle}>{successMessage}</p>}

                {loading ? (
                    <div style={loadingContainerStyle}>
                        <div style={spinnerStyle}></div>
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading settings...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={formStyle}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Logo URL:</label>
                            <input
                                type="text"
                                name="logoUrl"
                                value={settings.logoUrl}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="e.g., https://example.com/logo.png"
                            />
                            {settings.logoUrl && (
                                <div style={imagePreviewContainerStyle}>
                                    <img src={settings.logoUrl} alt="Current Logo" style={imagePreviewStyle} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x50/FF0000/FFFFFF?text=Error'; }} />
                                    <p style={imagePreviewLabelStyle}>Current Logo Preview</p>
                                </div>
                            )}
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Primary Color:</label>
                            <div style={colorInputGroupStyle}>
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={settings.primaryColor}
                                    onChange={handleInputChange}
                                    style={colorInputStyle}
                                />
                                <span style={colorValueStyle}>{settings.primaryColor}</span>
                            </div>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Secondary Color:</label>
                            <div style={colorInputGroupStyle}>
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    value={settings.secondaryColor}
                                    onChange={handleInputChange}
                                    style={colorInputStyle}
                                />
                                <span style={colorValueStyle}>{settings.secondaryColor}</span>
                            </div>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Font Family:</label>
                            <input
                                type="text"
                                name="fontFamily"
                                value={settings.fontFamily}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="e.g., 'Inter, sans-serif' or 'Roboto, sans-serif'"
                            />
                            <p style={{ ...fontPreviewStyle, fontFamily: settings.fontFamily }}>
                                This is a preview of the font.
                            </p>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Dashboard Custom HTML (for Customer Dashboard):</label>
                            <textarea
                                name="dashboardCustomHtml"
                                value={settings.dashboardCustomHtml}
                                onChange={handleInputChange}
                                rows="8"
                                style={textareaStyle}
                                placeholder="Enter custom HTML content for the customer dashboard welcome message. Use with caution as this will be rendered directly."
                            ></textarea>
                            <p style={helpTextStyle}>
                                This HTML will be rendered directly on the customer dashboard. Use with caution.
                            </p>
                        </div>

                        <div style={formActionsStyle}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={submitButtonStyle}
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Inline Styles for Luxury and Premium UI ---
const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5', // Light background for the whole page
    fontFamily: 'Inter, Arial, sans-serif', // Consistent font
};

const contentAreaStyle = {
    flex: 1,
    padding: '40px',
    backgroundColor: '#ffffff', // White background for the main content area
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', // Deeper shadow
    margin: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center content horizontally
    animation: 'fadeIn 0.5s ease-out', // Fade in animation for the content area
};

const headerContainerStyle = {
    display: 'flex',
    flexDirection: 'column', // Align items vertically
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0f2f7',
};

const brandContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
};

const brandLogoStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    marginRight: '15px',
    border: '3px solid #3498db',
    boxShadow: '0 0 15px rgba(52, 152, 219, 0.4)',
};

const brandNameStyle = {
    fontSize: '2.8em',
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: '1px',
    textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
};

const pageTitleStyle = {
    color: '#34495e',
    fontSize: '2em',
    fontWeight: '600',
    margin: 0,
    marginTop: '10px',
};

const errorMessageStyle = {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '12px',
    backgroundColor: '#fde7e7',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px',
    animation: 'shake 0.5s ease-in-out',
};

const successMessageStyle = {
    color: '#28a745',
    textAlign: 'center',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '12px',
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    border: '1px solid #28a745',
    width: '100%',
    maxWidth: '800px',
    marginBottom: '30px',
    animation: 'bounceIn 0.6s ease-out',
};

const loadingContainerStyle = {
    textAlign: 'center',
    padding: '50px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
};

const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const formStyle = {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '15px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
};

const formGroupStyle = {
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
};

const labelStyle = {
    marginBottom: '10px',
    fontWeight: '700',
    color: '#34495e',
    fontSize: '1.1em',
};

const inputStyle = {
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #cfd8dc',
    fontSize: '1em',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    ':focus': {
        borderColor: '#3498db',
        boxShadow: '0 0 0 4px rgba(52, 152, 219, 0.25)',
        outline: 'none',
    },
};

const textareaStyle = {
    ...inputStyle, // Inherit base input styles
    minHeight: '150px',
    resize: 'vertical',
    fontFamily: 'monospace',
};

const colorInputGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
};

const colorInputStyle = {
    width: '80px',
    height: '45px',
    padding: '0',
    border: '1px solid #cfd8dc',
    borderRadius: '8px',
    cursor: 'pointer',
    overflow: 'hidden', // Hide default color picker border
};

const colorValueStyle = {
    fontSize: '1em',
    color: '#555',
    fontWeight: '600',
};

const fontPreviewStyle = {
    fontSize: '1.1em',
    color: '#888',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#eef2f5',
    borderRadius: '8px',
    border: '1px dashed #cfd8dc',
};

const helpTextStyle = {
    fontSize: '0.9em',
    color: '#888',
    marginTop: '10px',
    lineHeight: '1.5',
};

const imagePreviewContainerStyle = {
    marginTop: '20px',
    padding: '15px',
    border: '1px dashed #cfd8dc',
    borderRadius: '10px',
    backgroundColor: '#eef2f5',
    textAlign: 'center',
};

const imagePreviewStyle = {
    maxWidth: '200px',
    maxHeight: '100px',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #fff',
};

const imagePreviewLabelStyle = {
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#666',
    fontWeight: '500',
};

const formActionsStyle = {
    marginTop: '40px',
    textAlign: 'right',
};

const submitButtonStyle = {
    padding: '15px 35px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
    boxShadow: '0 6px 15px rgba(0, 123, 255, 0.3)',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 20px rgba(0, 123, 255, 0.4)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
    },
    ':disabled': {
        backgroundColor: '#a0c8f8',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

// Keyframes for animations (ensure these are in your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
}

@keyframes zoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
*/
export default AdminSettingsPage;