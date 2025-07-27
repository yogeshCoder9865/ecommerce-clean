// client/src/pages/customer/CustomerProfilePage.js
import React, { useState, useEffect } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useAuth } from '../../context/AuthContext';

const CustomerProfilePage = () => {
    const { user, authAxios } = useAuth(); // Removed 'logout' as it's not used directly here
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
            setEmail(user.email);
            setLoading(false);
        } else {
            // If user is null (e.g., not authenticated or still loading), handle accordingly
            // In a real app, PrivateRoute should prevent this, but good for robustness
            setLoading(false);
            setError('User data not available. Please log in.');
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await authAxios.put(`/users/${user._id}`, { // Removed 'res' assignment
                firstName,
                lastName,
                email
            });
            // Update AuthContext user state if necessary (AuthContext's /me call should handle this)
            // For now, assume backend returns updated user and AuthContext will re-fetch or be updated
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } catch (err) {
            console.error('Profile update failed:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // This endpoint is for user to change their own password
            // Backend will verify currentPassword
            await authAxios.put(`/users/${user._id}`, {
                currentPassword,
                newPassword
            });
            setSuccessMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsPasswordChangeOpen(false);
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } catch (err) {
            console.error('Password change failed:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to change password. Check current password.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={spinnerStyle}></div>
                <p style={{ color: '#555', marginTop: '20px', fontSize: '1.1em' }}>Loading profile data...</p>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            <CustomerNav />
            <div style={contentAreaStyle}>
                <h2 style={pageTitleStyle}>My Profile</h2>
                <p style={pageDescriptionStyle}>Manage your account details and security settings.</p>

                {error && <p style={errorMessageStyle}>{error}</p>}
                {successMessage && <p style={successMessageStyle}>{successMessage}</p>}

                <div style={profileCardStyle}>
                    <h3 style={cardHeaderStyle}>Personal Information</h3>
                    {!isEditing ? (
                        <div style={infoGridStyle}>
                            <div style={infoItemStyle}>
                                <span style={infoLabelStyle}>First Name:</span>
                                <span style={infoValueStyle}>{firstName}</span>
                            </div>
                            <div style={infoItemStyle}>
                                <span style={infoLabelStyle}>Last Name:</span>
                                <span style={infoValueStyle}>{lastName}</span>
                            </div>
                            <div style={infoItemStyle}>
                                <span style={infoLabelStyle}>Email:</span>
                                <span style={infoValueStyle}>{email}</span>
                            </div>
                            <div style={infoItemStyle}>
                                <span style={infoLabelStyle}>Role:</span>
                                <span style={infoValueStyle}>{user?.role}</span>
                            </div>
                            <button onClick={() => setIsEditing(true)} style={editProfileButtonStyle}>
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileUpdate} style={formStyle}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>First Name:</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Last Name:</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Email:</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formActionsStyle}>
                                <button type="button" onClick={() => setIsEditing(false)} style={cancelButtonStyle}>Cancel</button>
                                <button type="submit" disabled={loading} style={saveButtonStyle}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div style={profileCardStyle}>
                    <h3 style={cardHeaderStyle}>Password Settings</h3>
                    {!isPasswordChangeOpen ? (
                        <button onClick={() => setIsPasswordChangeOpen(true)} style={changePasswordButtonStyle}>
                            Change Password
                        </button>
                    ) : (
                        <form onSubmit={handleChangePassword} style={formStyle}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Current Password:</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>New Password:</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Confirm New Password:</label>
                                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={formActionsStyle}>
                                <button type="button" onClick={() => setIsPasswordChangeOpen(false)} style={cancelButtonStyle}>Cancel</button>
                                <button type="submit" disabled={loading} style={saveButtonStyle}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Inline Styles for Beautiful UI and Animations ---
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

const pageTitleStyle = {
    color: '#2c3e50', // Darker title color
    fontSize: '2.5em',
    marginBottom: '10px',
    fontWeight: '700',
    textAlign: 'center',
};

const pageDescriptionStyle = {
    fontSize: '1.1em',
    color: '#555',
    marginBottom: '40px',
    textAlign: 'center',
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
    maxWidth: '600px',
    marginBottom: '30px',
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
    maxWidth: '600px',
    marginBottom: '30px',
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

const profileCardStyle = {
    backgroundColor: '#f9f9f9',
    padding: '35px',
    borderRadius: '15px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '30px',
    transition: 'transform 0.3s ease-in-out',
    ':hover': {
        transform: 'translateY(-5px)',
    },
};

const cardHeaderStyle = {
    color: '#34495e',
    fontSize: '1.8em',
    marginBottom: '25px',
    fontWeight: '600',
    borderBottom: '2px solid #e0f2f7',
    paddingBottom: '10px',
};

const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr', // Stacks on small screens
    gap: '20px',
    marginBottom: '20px',
    '@media (min-width: 600px)': { // Two columns on larger screens
        gridTemplateColumns: '1fr 1fr',
    },
};

const infoItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
};

const infoLabelStyle = {
    fontWeight: 'bold',
    color: '#7f8c8d',
    fontSize: '0.9em',
    marginBottom: '5px',
};

const infoValueStyle = {
    fontSize: '1.1em',
    color: '#2c3e50',
    wordBreak: 'break-word', // Prevent long words from overflowing
};

const editProfileButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
    ':hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
    },
};

const changePasswordButtonStyle = {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '15px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)',
    ':hover': {
        backgroundColor: '#5a6268',
        transform: 'translateY(-2px)',
    },
};

const formStyle = {
    marginTop: '20px',
};

const formGroupStyle = {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
};

const labelStyle = {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
    fontSize: '0.95em',
};

const inputStyle = {
    padding: '12px',
    border: '1px solid #cfd8dc',
    borderRadius: '8px',
    fontSize: '1em',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    ':focus': {
        borderColor: '#3498db',
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)',
        outline: 'none',
    },
};

const formActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
};

const cancelButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(220, 53, 69, 0.2)',
    ':hover': {
        backgroundColor: '#c82333',
        transform: 'translateY(-2px)',
    },
};

const saveButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.2)',
    ':hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-2px)',
    },
    ':disabled': {
        backgroundColor: '#a0d9b4',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

// Keyframes for animations (add these to your client/src/index.css or a global stylesheet)
/*
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/
export default CustomerProfilePage;
