// client/src/pages/customer/CustomerProfilePage.js
import React, { useState, useEffect } from 'react';
import CustomerNav from '../../components/customer/CustomerNav';
import { useAuth } from '../../context/AuthContext';

const CustomerProfilePage = () => {
    // Assuming useAuth provides a way to update the user object in context, e.g., updateUser
    const { user, authAxios, updateUser } = useAuth(); // Added updateUser to destructuring

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

    // New states for image upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // To display image before upload

    // Define the base URL for images. This should ideally come from an environment variable
    // like process.env.REACT_APP_API_BASE_URL. For demonstration, hardcoding to localhost.
    const API_BASE_URL = 'http://localhost:5000'; // IMPORTANT: Adjust this to your backend URL

    // Effect to fetch user data on component mount or if user data is missing/incomplete
    // This ensures that on page reload, the latest user data (including imageUrl) is fetched.
    useEffect(() => {
        const fetchUserData = async () => {
            // If user object is not available or incomplete (e.g., on a fresh page load before context populates)
            if (!user || !user._id) {
                setLoading(true);
                try {
                    // Assuming an endpoint to get the current user's profile
                    // You might have a specific '/users/profile' or '/users/me' endpoint
                    const res = await authAxios.get('/users/me'); 
                    updateUser(res.data); // Update the user in AuthContext with fresh data from the server
                    setFirstName(res.data.firstName);
                    setLastName(res.data.lastName);
                    setEmail(res.data.email);
                    // Construct full image URL for preview
                    setImagePreview(res.data.imageUrl ? `${API_BASE_URL}${res.data.imageUrl}` : null);
                    setError('');
                } catch (err) {
                    console.error('Failed to fetch user data on load:', err);
                    setError('Failed to load profile data. Please log in again.');
                    // Optionally redirect to login if user data cannot be fetched
                    // history.push('/login'); 
                } finally {
                    setLoading(false);
                }
            } else {
                // User data is already available from context, populate fields
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setEmail(user.email);
                // Construct full image URL from existing user data for preview
                setImagePreview(user.imageUrl ? `${API_BASE_URL}${user.imageUrl}` : null);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, authAxios, updateUser, API_BASE_URL]); // Dependencies: user, authAxios, updateUser, API_BASE_URL

    // Handle file selection for image upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a temporary URL for immediate image preview in the browser
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            // Revert to current user's saved image if no new file is selected
            setImagePreview(user?.imageUrl ? `${API_BASE_URL}${user.imageUrl}` : null);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('email', email);

        if (selectedFile) {
            formData.append('profileImage', selectedFile); // 'profileImage' should match your backend's expected field name for the file
        }

        try {
            const res = await authAxios.put(`/users/${user._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Important for sending files
                },
            });

            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setSelectedFile(null); // Clear selected file after successful upload

            // IMPORTANT: Update the user in AuthContext with the *newly returned* user data from the server.
            // This ensures the context has the latest imageUrl, which the useEffect above will then use.
            if (updateUser) {
                updateUser(res.data); 
            }
            
            // The imagePreview will automatically update via the useEffect that listens to 'user' changes.

            setTimeout(() => setSuccessMessage(''), 3000);
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
            await authAxios.put(`/users/${user._id}`, {
                currentPassword,
                newPassword
            });
            setSuccessMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsPasswordChangeOpen(false);
            setTimeout(() => setSuccessMessage(''), 3000);
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
                <p style={{ color: 'var(--text-medium)', marginTop: '20px', fontSize: '1.1em' }}>Loading profile data...</p>
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
                    <div style={cardHeaderContentStyle}>
                        <h3 style={cardHeaderStyle}>Personal Information</h3>
                        {/* Display user's profile image or placeholder */}
                        <img
                            // Use imagePreview state which holds the full URL
                            src={imagePreview || 'https://placehold.co/80x80/DAA520/FFFFFF/png?text=User'}
                            alt="Customer Profile"
                            style={customerProfileImageStyle}
                        />
                    </div>
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
                            {/* New: Profile Picture Upload Section */}
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Profile Picture:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={fileInputStyle}
                                />
                                {imagePreview && (
                                    <img src={imagePreview} alt="Profile Preview" style={imagePreviewStyle} />
                                )}
                            </div>
                            <div style={formActionsStyle}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setSelectedFile(null);
                                        // Revert image preview to the currently saved user image
                                        setImagePreview(user?.imageUrl ? `${API_BASE_URL}${user.imageUrl}` : null);
                                    }}
                                    style={cancelButtonStyle}
                                >
                                    Cancel
                                </button>
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

// --- Inline Styles for Super Premium, Elegant, and Attractive UI ---

// Define a sophisticated color palette using CSS variables for easy management
const colors = {
    primaryDarkBlue: '#1A237E', // Deep Indigo
    secondaryGold: '#DAA520', // Goldenrod
    backgroundLight: '#F8F9FA', // Off-white
    textDark: '#263238', // Dark Slate
    textMedium: '#546E7A', // Medium Grey-Blue
    borderLight: '#CFD8DC', // Light Grey Blue
    successGreen: '#4CAF50', // Vibrant Green
    errorRed: '#D32F2F', // Deep Red
    infoBlue: '#2196F3', // Bright Blue
    buttonGrey: '#78909C', // Muted Blue-Grey
};

// Apply CSS variables to the root for global access (conceptually, would be in index.css)
// document.documentElement.style.setProperty('--primary-dark-blue', colors.primaryDarkBlue);
// ... and so on for all colors

const pageContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: colors.backgroundLight, // Soft background for the whole page
    fontFamily: 'Inter, Arial, sans-serif', // Consistent font
    backgroundImage: `url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')`, // Subtle paper texture
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
};

const contentAreaStyle = {
    flex: 1,
    padding: '50px', // Slightly reduced padding
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white for depth
    borderRadius: '20px', // More rounded corners
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)', // Multi-layered, deeper shadow
    margin: '30px', // Slightly reduced margin
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeInUp 0.8s ease-out forwards', // Fade in and slide up
    border: `1px solid ${colors.borderLight}`, // Subtle border
    backdropFilter: 'blur(5px)', // Glassmorphism effect
};

const pageTitleStyle = {
    color: colors.primaryDarkBlue, // Deep indigo title
    fontSize: '2.8em', // Slightly smaller title
    marginBottom: '10px', // Slightly reduced margin
    fontWeight: '800', // Extra bold
    textAlign: 'center',
    letterSpacing: '0.8px', // Slight letter spacing for elegance
    textShadow: '1px 1px 3px rgba(0,0,0,0.1)', // Subtle text shadow
};

const pageDescriptionStyle = {
    fontSize: '1.05em', // Slightly smaller description
    color: colors.textMedium, // Muted grey-blue
    marginBottom: '40px', // Slightly reduced margin
    textAlign: 'center',
    maxWidth: '600px',
    lineHeight: '1.6',
};

const errorMessageStyle = {
    color: colors.errorRed,
    textAlign: 'center',
    fontSize: '1em', // Slightly smaller font
    fontWeight: 'bold',
    padding: '12px 20px', // Slightly reduced padding
    backgroundColor: 'rgba(211, 47, 47, 0.1)', // Lighter red background
    borderRadius: '10px',
    border: `1px solid ${colors.errorRed}`,
    width: '100%',
    maxWidth: '600px',
    marginBottom: '25px', // Slightly reduced margin
    animation: 'shake 0.5s ease-in-out',
    boxShadow: '0 2px 10px rgba(211, 47, 47, 0.2)',
};

const successMessageStyle = {
    color: colors.successGreen,
    textAlign: 'center',
    fontSize: '1em', // Slightly smaller font
    fontWeight: 'bold',
    padding: '12px 20px', // Slightly reduced padding
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Lighter green background
    borderRadius: '10px',
    border: `1px solid ${colors.successGreen}`,
    width: '100%',
    maxWidth: '600px',
    marginBottom: '25px', // Slightly reduced margin
    animation: 'bounceIn 0.6s ease-out',
    boxShadow: '0 2px 10px rgba(76, 175, 80, 0.2)',
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
    border: `8px solid ${colors.borderLight}`,
    borderTop: `8px solid ${colors.infoBlue}`, // Blue spinner
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
};

const profileCardStyle = {
    backgroundColor: 'var(--background-light)', // Use light background for cards
    padding: '35px', // Slightly reduced padding
    borderRadius: '18px', // Even more rounded corners
    boxShadow: '0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)', // Deeper shadow for cards
    border: `1px solid ${colors.borderLight}`,
    width: '100%',
    maxWidth: '750px', // Slightly narrower cards
    marginBottom: '35px', // Slightly reduced space between cards
    transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth transition
    ':hover': {
        transform: 'translateY(-8px)', // Slightly less pronounced lift effect
        boxShadow: '0 15px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)', // Slightly less deep shadow on hover
    },
    background: 'linear-gradient(145deg, #ffffff, #f0f2f5)', // Subtle gradient for cards
};

const cardHeaderContentStyle = { // New style for header and image alignment
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px', // Adjusted margin
    borderBottom: `3px solid ${colors.secondaryGold}`, // Gold accent line
    paddingBottom: '15px',
};

const cardHeaderStyle = {
    color: colors.primaryDarkBlue,
    fontSize: '2em', // Slightly smaller header
    fontWeight: '700',
    letterSpacing: '0.5px',
    margin: 0, // Remove default margin
};

const customerProfileImageStyle = { // Renamed from customerFeatureImageStyle
    width: '70px', // Smaller image
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${colors.infoBlue}`, // Accent border
    boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)', // Blue shadow
};

const infoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', // Adjusted responsive grid
    gap: '25px', // Slightly less space between items
    marginBottom: '25px', // Slightly less space
};

const infoItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly transparent background for info items
    padding: '18px', // Slightly reduced padding
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'background-color 0.3s ease',
    ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
};

const infoLabelStyle = {
    fontWeight: 'bold',
    color: colors.textMedium,
    fontSize: '0.95em', // Slightly smaller font
    marginBottom: '6px', // Slightly reduced margin
    textTransform: 'uppercase', // Uppercase labels
    letterSpacing: '0.5px',
};

const infoValueStyle = {
    fontSize: '1.2em', // Slightly smaller value text
    color: colors.textDark,
    wordBreak: 'break-word',
    fontWeight: '600',
};

const editProfileButtonStyle = {
    padding: '12px 25px', // Slightly smaller padding
    background: `linear-gradient(45deg, ${colors.infoBlue}, #0056b3)`, // Blue gradient
    color: 'white',
    border: 'none',
    borderRadius: '10px', // More rounded
    cursor: 'pointer',
    fontSize: '1em', // Slightly smaller font
    fontWeight: 'bold',
    marginTop: '25px', // Slightly reduced margin
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)', // Slightly less deep shadow
    ':hover': {
        transform: 'translateY(-3px) scale(1.01)', // Slightly less pronounced lift and scale
        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.5)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 3px 8px rgba(33, 150, 243, 0.2)',
    },
};

const changePasswordButtonStyle = {
    padding: '12px 25px', // Slightly smaller padding
    background: `linear-gradient(45deg, ${colors.buttonGrey}, #546E7A)`, // Grey gradient
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1em', // Slightly smaller font
    fontWeight: 'bold',
    marginTop: '20px', // Slightly reduced margin
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 5px 15px rgba(120, 144, 156, 0.3)', // Slightly less deep shadow
    ':hover': {
        background: `linear-gradient(45deg, #546E7A, ${colors.buttonGrey})`,
        transform: 'translateY(-3px) scale(1.01)', // Slightly less pronounced lift and scale
        boxShadow: '0 8px 20px rgba(120, 144, 156, 0.5)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 3px 8px rgba(120, 144, 156, 0.2)',
    },
};

const formStyle = {
    marginTop: '25px', // Slightly reduced margin
    width: '100%',
};

const formGroupStyle = {
    marginBottom: '20px', // Slightly reduced space
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
};

const labelStyle = {
    marginBottom: '8px', // Slightly reduced space
    fontWeight: '600',
    color: colors.textDark,
    fontSize: '0.95em', // Slightly smaller font
    letterSpacing: '0.2px',
};

const inputStyle = {
    padding: '12px', // Slightly smaller padding
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px', // More rounded
    fontSize: '1em', // Slightly smaller font
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
    backgroundColor: 'white',
    ':focus': {
        borderColor: colors.infoBlue,
        boxShadow: `0 0 0 3px rgba(33, 150, 243, 0.2)`, // Slightly less glow
        outline: 'none',
        backgroundColor: '#fafffe', // Slight background change on focus
    },
};

const fileInputStyle = {
    padding: '12px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    fontSize: '1em',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    backgroundColor: 'white',
    cursor: 'pointer',
    ':focus': {
        borderColor: colors.infoBlue,
        boxShadow: `0 0 0 3px rgba(33, 150, 243, 0.2)`,
        outline: 'none',
    },
};

const imagePreviewStyle = {
    marginTop: '15px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${colors.secondaryGold}`, // Gold border for preview
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
};

const formActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px', // Slightly less space between buttons
    marginTop: '25px', // Slightly reduced margin
};

const cancelButtonStyle = {
    padding: '10px 20px', // Slightly smaller padding
    backgroundColor: colors.errorRed,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em', // Slightly smaller font
    fontWeight: 'bold',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 3px 10px rgba(211, 47, 47, 0.2)', // Slightly less deep shadow
    ':hover': {
        backgroundColor: '#C62828',
        transform: 'translateY(-2px)', // Slightly less lift
        boxShadow: '0 6px 15px rgba(211, 47, 47, 0.3)',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 6px rgba(211, 47, 47, 0.15)',
    },
};

const saveButtonStyle = {
    padding: '10px 20px', // Slightly smaller padding
    backgroundColor: colors.successGreen,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em', // Slightly smaller font
    fontWeight: 'bold',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 3px 10px rgba(76, 175, 80, 0.2)', // Slightly less deep shadow
    ':hover': {
        backgroundColor: '#388E3C',
        transform: 'translateY(-2px)', // Slightly less lift
        boxShadow: '0 6px 15px rgba(76, 175, 80, 0.3)',
    },
    ':disabled': {
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
    ':active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 6px rgba(76, 175, 80, 0.15)',
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

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(8px); }
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
}
*/
export default CustomerProfilePage;
