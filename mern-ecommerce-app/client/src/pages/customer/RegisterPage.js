// client/src/pages/customer/RegisterPage.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Correctly pass a single userData object to the register function
            const userData = { firstName, lastName, email, password };
            const res = await register(userData); // Now passing a single object
            if (res) { // Check if res exists (successful registration)
                navigate('/'); // Redirect to customer dashboard or home page after successful registration
            } else {
                setError('Registration failed. Please try again.'); // Generic error if res is null/undefined
            }
        } catch (err) {
            // Catch errors thrown by the register function (e.g., Axios errors)
            console.error('Registration submission error:', err);
            setError(err.response?.data?.message || 'Registration failed. User might already exist or invalid data.');
        }
    };

    return (
        <div style={pageContainerStyle}>
            <div style={formCardStyle}>
                <h2 style={formTitleStyle}>Create Your Account</h2>
                {error && <p style={errorMessageStyle}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>First Name:</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Last Name:</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="Enter your last name"
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="Create a password"
                        />
                    </div>
                    <button
                        type="submit"
                        style={registerButtonStyle}
                    >
                        Register
                    </button>
                </form>
                <p style={loginLinkStyle}>
                    Already have an account? <a href="/login" style={linkStyle}>Login here</a>
                </p>
            </div>
        </div>
    );
};

// --- Inline Styles for Beautiful UI ---
const pageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#e0f2f7', // Light blue background
    fontFamily: 'Arial, sans-serif',
};

const formCardStyle = {
    padding: '40px',
    backgroundColor: '#ffffff', // White card background
    borderRadius: '15px', // More rounded corners
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)', // Deeper, softer shadow
    width: '90%',
    maxWidth: '450px',
    textAlign: 'center',
};

const formTitleStyle = {
    color: '#2c3e50', // Darker title color
    fontSize: '2.2em',
    marginBottom: '30px',
    fontWeight: '700',
};

const errorMessageStyle = {
    color: '#e74c3c', // Red for errors
    marginBottom: '20px',
    fontSize: '1em',
    fontWeight: 'bold',
};

const formGroupStyle = {
    marginBottom: '20px',
    textAlign: 'left',
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
    fontSize: '1em',
};

const inputStyle = {
    width: 'calc(100% - 24px)', // Account for padding
    padding: '12px',
    border: '1px solid #cfd8dc', // Light grey border
    borderRadius: '8px', // Rounded input fields
    fontSize: '1em',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    ':focus': {
        borderColor: '#3498db', // Blue focus border
        boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)', // Subtle blue glow
        outline: 'none',
    },
};

const registerButtonStyle = {
    width: '100%',
    padding: '15px 20px',
    backgroundColor: '#2ecc71', // Green for register
    color: 'white',
    border: 'none',
    borderRadius: '10px', // Rounded button
    cursor: 'pointer',
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    boxShadow: '0 5px 15px rgba(46, 204, 113, 0.3)', // Green shadow
    ':hover': {
        backgroundColor: '#27ae60', // Darker green on hover
        transform: 'translateY(-2px)', // Slight lift effect
    },
    ':active': {
        transform: 'translateY(0)',
    },
};

const loginLinkStyle = {
    marginTop: '25px',
    fontSize: '0.95em',
    color: '#666',
};

const linkStyle = {
    color: '#3498db', // Blue link
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'color 0.3s ease',
    ':hover': {
        textDecoration: 'underline',
    },
};

export default RegisterPage;
