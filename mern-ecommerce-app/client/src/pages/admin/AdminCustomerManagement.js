// client/src/pages/admin/AdminCustomerManagement.js 
 import React, { useState, useEffect } from 'react'; 
 import AdminNav from '../../components/admin/AdminNav'; 
 import { useAuth } from '../../context/AuthContext'; 

 const AdminCustomerManagement = () => { 
    const { authAxios, user, impersonate } = useAuth(); 
    const [customers, setCustomers] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(''); 
    const [successMessage, setSuccessMessage] = useState(''); // Added for success messages 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [selectedCustomer, setSelectedCustomer] = useState(null); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalPages, setTotalPages] = useState(1); 
    const itemsPerPage = 10; // Number of customers per page 

    // --- Custom Message Box Functions (Copied from AdminProductManagement.js) --- 
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

    const showConfirmBox = (message, onConfirm, onCancel) => { 
        const confirmBox = document.createElement('div'); 
        confirmBox.style.cssText = ` 
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
            border: 2px solid #ffc107; /* Warning color */ 
        `; 
        confirmBox.innerHTML = ` 
            <p style="font-size: 1.2em; margin-bottom: 20px; color: #333;">${message}</p> 
            <button id="confirmBoxConfirmBtn" style=" 
                padding: 10px 20px; 
                background-color: #28a745; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 1em; 
                transition: background-color 0.3s ease; 
                margin-right: 10px; 
            ">Yes</button> 
            <button id="confirmBoxCancelBtn" style=" 
                padding: 10px 20px; 
                background-color: #6c757d; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 1em; 
                transition: background-color 0.3s ease; 
            ">No</button> 
        `; 
        document.body.appendChild(confirmBox); 

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

        const removeConfirmBox = () => { 
            confirmBox.style.animation = 'fadeOut 0.3s ease-in forwards'; 
            confirmBox.addEventListener('animationend', () => { 
                document.body.removeChild(confirmBox); 
                document.head.removeChild(styleSheet); 
            }); 
        }; 

        document.getElementById('confirmBoxConfirmBtn').onclick = () => { 
            removeConfirmBox(); 
            if (onConfirm) onConfirm(); 
        }; 
        document.getElementById('confirmBoxCancelBtn').onclick = () => { 
            removeConfirmBox(); 
            if (onCancel) onCancel(); 
        }; 
    }; 

    // --- Fetch Customers --- 
    useEffect(() => { 
        const fetchCustomers = async () => { 
            setLoading(true); 
            setError(''); 
            try { 
                const res = await authAxios.get('/users', { 
                    params: { 
                        page: currentPage, 
                        limit: itemsPerPage, 
                        search: searchQuery, 
                        role: 'customer' 
                    } 
                }); 
                const allUsers = res.data; 
                const filteredCustomers = allUsers.filter(u => u.role === 'customer'); 

                const startIndex = (currentPage - 1) * itemsPerPage; 
                const endIndex = startIndex + itemsPerPage; 
                const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex); 

                setCustomers(paginatedCustomers); 
                setTotalPages(Math.ceil(filteredCustomers.length / itemsPerPage)); 

            } catch (err) { 
                console.error('Failed to fetch customers:', err); 
                setError('Failed to load customers. Please try again.'); 
            } finally { 
                setLoading(false); 
            } 
        }; 
        fetchCustomers(); 
    }, [authAxios, currentPage, searchQuery]); 

    // --- Handlers for Customer Actions --- 

    const handleSearchChange = (e) => { 
        setSearchQuery(e.target.value); 
        setCurrentPage(1); 
    }; 

    const handlePageChange = (page) => { 
        setCurrentPage(page); 
    }; 

    const handleEditClick = (customer) => { 
        setSelectedCustomer({ ...customer }); 
        setIsEditModalOpen(true); 
        setError(''); // Clear errors on modal open 
        setSuccessMessage(''); // Clear success on modal open 
    }; 

    const handleEditModalChange = (e) => { 
        const { name, value } = e.target; 
        setSelectedCustomer(prev => ({ ...prev, [name]: value })); 
    }; 

    const handleUpdateCustomer = async (e) => { 
        e.preventDefault(); 
        setError(''); 
        setSuccessMessage(''); 
        try { 
            if (!selectedCustomer) return; 

            const res = await authAxios.put(`/users/${selectedCustomer._id}`, { 
                firstName: selectedCustomer.firstName, 
                lastName: selectedCustomer.lastName, 
                email: selectedCustomer.email, 
            }); 
            setCustomers(prev => prev.map(cust => cust._id === res.data._id ? res.data : cust)); 
            setIsEditModalOpen(false); 
            showMessageBox('Customer updated successfully!', 'success'); 
        } catch (err) { 
            console.error('Failed to update customer:', err.response?.data?.message || err.message); 
            setError(err.response?.data?.message || 'Failed to update customer.'); 
        } 
    }; 

    const handleToggleStatus = async (customerId, currentStatus) => { 
        showConfirmBox(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this customer?`, async () => { 
            try { 
                setError(''); 
                setSuccessMessage(''); 
                await authAxios.put(`/users/${customerId}/status`, { isActive: !currentStatus }); 
                setCustomers(prev => prev.map(cust => 
                    cust._id === customerId ? { ...cust, isActive: !currentStatus } : cust 
                )); 
                showMessageBox(`Customer ${currentStatus ? 'deactivated' : 'activated'} successfully!`, 'success'); 
            } catch (err) { 
                console.error('Failed to toggle customer status:', err.response?.data?.message || err.message); 
                setError(err.response?.data?.message || 'Failed to change customer status.'); 
            } 
        }); 
    }; 

    const handleDeleteCustomer = async (customerId) => { 
        showConfirmBox('Are you sure you want to delete this customer? This action cannot be undone.', async () => { 
            try { 
                setError(''); 
                setSuccessMessage(''); 
                await authAxios.delete(`/users/${customerId}`); 
                setCustomers(prev => prev.filter(cust => cust._id !== customerId)); 
                showMessageBox('Customer deleted successfully!', 'success'); 
            } catch (err) { 
                console.error('Failed to delete customer:', err.response?.data?.message || err.message); 
                setError(err.response?.data?.message || 'Failed to delete customer.'); 
            } 
        }); 
    }; 

    const handleImpersonate = async (customerId) => { 
        if (user?.role === 'admin') { 
            showConfirmBox('Are you sure you want to impersonate this customer? You will be logged in as them.', async () => { 
                try { 
                    setError(''); 
                    setSuccessMessage(''); 
                    const success = await impersonate(customerId); 
                    if (success) { 
                        showMessageBox('Impersonation successful! Redirecting to customer view.', 'success', () => { 
                            window.location.href = '/'; // Force full page reload to ensure all state is reset 
                        }); 
                    } else { 
                        setError('Impersonation failed.'); 
                    } 
                } catch (err) { 
                    console.error('Impersonation failed:', err); 
                    setError(err.response?.data?.message || 'Impersonation failed.'); 
                } 
            }); 
        } else { 
            showMessageBox('You do not have permission to impersonate users.', 'error'); 
        } 
    }; 

    return ( 
        <div style={pageContainerStyle}> 
            <AdminNav /> 
            <div style={contentAreaStyle}> 
                <div style={headerContainerStyle}> 
                    <h2 style={pageTitleStyle}>Customer Management</h2> 
                </div> 

                <div style={searchContainerStyle}> 
                    <input 
                        type="text" 
                        placeholder="Search customers by email..." 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        style={searchInputStyle} 
                    /> 
                    <i className="fas fa-search" style={searchIconStyle}></i> 
                </div> 

                {error && <p style={errorMessageStyle}>{error}</p>} 
                {successMessage && <p style={successMessageStyle}>{successMessage}</p>} 

                {loading ? ( 
                    <div style={loadingContainerStyle}> 
                        <div style={spinnerStyle}></div> 
                        <p style={{ color: '#555', marginTop: '15px' }}>Loading customers...</p> 
                    </div> 
                ) : customers.length === 0 ? ( 
                    <div style={noCustomersMessageStyle}> 
                        <p>No customers found matching your criteria.</p> 
                        <button onClick={() => setSearchQuery('')} style={resetSearchButtonStyle}>Reset Search</button> 
                    </div> 
                ) : ( 
                    <> 
                        <div style={tableContainerStyle}> 
                            <table style={customersTableStyle}> 
                                <thead> 
                                    <tr style={tableHeaderRowStyle}> 
                                        <th style={tableHeaderCellStyle}>Name</th> 
                                        <th style={tableHeaderCellStyle}>Email</th> 
                                        <th style={tableHeaderCellStyle}>Status</th> 
                                        <th style={tableHeaderCellStyle}>Actions</th> 
                                    </tr> 
                                </thead> 
                                <tbody> 
                                    {customers.map(customer => ( 
                                        <tr key={customer._id} style={tableRowStyle}> 
                                            <td style={tableCellStyle}>{customer.firstName} {customer.lastName}</td> 
                                            <td style={tableCellStyle}>{customer.email}</td> 
                                            <td style={tableCellStyle}> 
                                                <span style={{ ...statusBadgeStyle, backgroundColor: customer.isActive ? '#28a745' : '#dc3545' }}> 
                                                    {customer.isActive ? 'Active' : 'Inactive'} 
                                                </span> 
                                            </td> 
                                            <td style={tableActionCellStyle}> 
                                                <button 
                                                    onClick={() => handleEditClick(customer)} 
                                                    style={{ ...actionButtonStyle, backgroundColor: '#007bff' }} 
                                                > 
                                                    <i className="fas fa-edit"></i> Edit 
                                                </button> 
                                                <button 
                                                    onClick={() => handleToggleStatus(customer._id, customer.isActive)} 
                                                    style={{ ...actionButtonStyle, backgroundColor: customer.isActive ? '#ffc107' : '#28a745', marginLeft: '10px' }} 
                                                > 
                                                    <i className={`fas ${customer.isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i> {customer.isActive ? 'Deactivate' : 'Activate'} 
                                                </button> 
                                                <button 
                                                    onClick={() => handleImpersonate(customer._id)} 
                                                    style={{ ...actionButtonStyle, backgroundColor: '#6f42c1', marginLeft: '10px' }} 
                                                > 
                                                    <i className="fas fa-mask"></i> Impersonate 
                                                </button> 
                                                <button 
                                                    onClick={() => handleDeleteCustomer(customer._id)} 
                                                    style={{ ...actionButtonStyle, backgroundColor: '#dc3545', marginLeft: '10px' }} 
                                                > 
                                                    <i className="fas fa-trash-alt"></i> Delete 
                                                </button> 
                                            </td> 
                                        </tr> 
                                    ))} 
                                </tbody> 
                            </table> 
                        </div> 
                        {/* Pagination Controls */} 
                        <div style={paginationContainerStyle}> 
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => ( 
                                <button 
                                    key={page} 
                                    onClick={() => handlePageChange(page)} 
                                    style={{ 
                                        ...paginationButtonStyle, 
                                        backgroundColor: currentPage === page ? '#3498db' : '#ecf0f1', 
                                        color: currentPage === page ? 'white' : '#34495e', 
                                        fontWeight: currentPage === page ? 'bold' : 'normal', 
                                    }} 
                                > 
                                    {page} 
                                </button> 
                            ))} 
                        </div> 
                    </> 
                )} 

                {/* --- Edit Customer Modal --- */} 
                {isEditModalOpen && selectedCustomer && ( 
                    <div style={modalOverlayStyle}> 
                        <div style={modalContentStyle}> 
                            <h3 style={modalTitleStyle}>Edit Customer: {selectedCustomer.firstName} {selectedCustomer.lastName}</h3> 
                            {error && <p style={modalErrorMessageStyle}>{error}</p>} 
                            <form onSubmit={handleUpdateCustomer}> 
                                <div style={formGroupStyle}> 
                                    <label style={modalLabelStyle}>First Name:</label> 
                                    <input type="text" name="firstName" value={selectedCustomer.firstName} onChange={handleEditModalChange} required style={modalInputStyle} /> 
                                </div> 
                                <div style={formGroupStyle}> 
                                    <label style={modalLabelStyle}>Last Name:</label> 
                                    <input type="text" name="lastName" value={selectedCustomer.lastName} onChange={handleEditModalChange} required style={modalInputStyle} /> 
                                </div> 
                                <div style={formGroupStyle}> 
                                    <label style={modalLabelStyle}>Email:</label> 
                                    <input type="email" name="email" value={selectedCustomer.email} onChange={handleEditModalChange} required style={modalInputStyle} /> 
                                </div> 
                                <div style={modalActionsStyle}> 
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} style={modalCancelButtonStyle}> 
                                        Cancel 
                                    </button> 
                                    <button type="submit" style={modalAddButtonStyle}> 
                                        Save Changes 
                                    </button> 
                                </div> 
                            </form> 
                        </div> 
                    </div> 
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    maxWidth: '1200px', 
    marginBottom: '40px', 
    paddingBottom: '15px', 
    borderBottom: '2px solid #e0f2f7', 
 }; 

 const pageTitleStyle = { 
    color: '#2c3e50', // Darker title color 
    fontSize: '2.5em', 
    fontWeight: '700', 
    margin: 0, 
 }; 

 const searchContainerStyle = { 
    position: 'relative', 
    marginBottom: '30px', 
    width: '100%', 
    maxWidth: '400px', 
 }; 

 const searchInputStyle = { 
    padding: '12px 18px 12px 45px', // Left padding for icon 
    width: 'calc(100% - 24px)', // Account for padding 
    border: '1px solid #cfd8dc', 
    borderRadius: '8px', 
    fontSize: '1em', 
    boxSizing: 'border-box', 
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease', 
    // ':focus': { 
    //     borderColor: '#3498db', 
    //     boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)', 
    //     outline: 'none', 
    // }, 
 }; 

 const searchIconStyle = { 
    position: 'absolute', 
    left: '15px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#999', 
    fontSize: '1.1em', 
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

 const noCustomersMessageStyle = { 
    textAlign: 'center', 
    fontSize: '1.3em', 
    color: '#666', 
    padding: '50px', 
    border: '2px dashed #ccc', 
    borderRadius: '10px', 
    backgroundColor: '#f9f9f9', 
    width: '80%', 
    maxWidth: '600px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
    marginTop: '20px', 
 }; 

 const resetSearchButtonStyle = { 
    padding: '12px 25px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '1.1em', 
    fontWeight: 'bold', 
    marginTop: '20px', 
    transition: 'background-color 0.3s ease, transform 0.2s ease', 
    boxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)', 
 }; 

 const tableContainerStyle = { 
    width: '100%', 
    maxWidth: '1200px', 
    overflowX: 'auto', 
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', 
    borderRadius: '10px', 
    backgroundColor: '#fff', 
    marginBottom: '40px', 
 }; 

 const customersTableStyle = { 
    width: '100%', 
    borderCollapse: 'separate', 
    borderSpacing: '0', 
    borderRadius: '10px', 
    overflow: 'hidden', 
 }; 

 const tableHeaderRowStyle = { 
    backgroundColor: '#ecf0f1', 
    color: '#34495e', 
    fontSize: '1em', 
    fontWeight: '600', 
    textTransform: 'uppercase', 
 }; 

 const tableHeaderCellStyle = { 
    padding: '18px 20px', 
    textAlign: 'left', 
    borderBottom: '1px solid #ddd', 
 }; 

 const tableRowStyle = { 
    borderBottom: '1px solid #f0f0f0', 
    transition: 'background-color 0.2s ease', 
    // ':hover': { 
    //     backgroundColor: '#f8f8f8', 
    // }, 
 }; 

 const tableCellStyle = { 
    padding: '12px 15px', 
    borderBottom: '1px solid #eee', 
    color: '#333', 
 }; 

 const statusBadgeStyle = { 
    padding: '5px 10px', 
    borderRadius: '5px', 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: '0.9em', 
 }; 

 const tableActionCellStyle = { 
    padding: '12px 15px', 
    borderBottom: '1px solid #eee', 
    whiteSpace: 'nowrap', // Prevent buttons from wrapping 
 }; 

 const actionButtonStyle = { 
    padding: '8px 15px', 
    borderRadius: '5px', 
    border: 'none', 
    color: 'white', 
    cursor: 'pointer', 
    fontSize: '0.9em', 
    fontWeight: 'bold', 
    transition: 'background-color 0.3s ease, transform 0.2s ease', 
    display: 'inline-flex', 
    alignItems: 'center', 
    // ':hover': { 
    //     backgroundColor: '#218838', // Placeholder, specific colors will override 
    //     transform: 'translateY(-1px)', 
    // }, 
 }; 

 const paginationContainerStyle = { 
    marginTop: '30px', 
    textAlign: 'center', 
    display: 'flex', 
    justifyContent: 'center', 
    flexWrap: 'wrap', 
    gap: '10px', 
 }; 

 const paginationButtonStyle = { 
    padding: '12px 18px', 
    margin: '0 5px', 
    border: '1px solid #cfd8dc', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '1em', 
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease', 
    // ':hover': { 
    //     backgroundColor: '#3498db', 
    //     color: 'white', 
    //     transform: 'translateY(-2px)', 
    // }, 
 }; 

 // --- Modal Styles --- 
 const modalOverlayStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000, 
    animation: 'fadeIn 0.3s ease-out', 
 }; 

 const modalContentStyle = { 
    backgroundColor: 'white', 
    padding: '35px', 
    borderRadius: '15px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)', 
    width: '90%', 
    maxWidth: '650px', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    animation: 'zoomIn 0.3s ease-out', 
 }; 

 const modalTitleStyle = { 
    fontSize: '2em', 
    color: '#2c3e50', 
    marginBottom: '25px', 
    fontWeight: '700', 
    borderBottom: '2px solid #e0f2f7', 
    paddingBottom: '10px', 
 }; 

 const modalErrorMessageStyle = { 
    color: '#e74c3c', 
    textAlign: 'center', 
    fontSize: '1em', 
    fontWeight: 'bold', 
    padding: '10px', 
    backgroundColor: '#fde7e7', 
    borderRadius: '8px', 
    border: '1px solid #e74c3c', 
    marginBottom: '20px', 
 }; 

 const formGroupStyle = { 
    marginBottom: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    textAlign: 'left', 
 }; 

 const modalLabelStyle = { 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#555', 
    fontSize: '0.95em', 
 }; 

 const modalInputStyle = { 
    padding: '12px', 
    border: '1px solid #cfd8dc', 
    borderRadius: '8px', 
    fontSize: '1em', 
    boxSizing: 'border-box', 
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease', 
    // ':focus': { 
    //     borderColor: '#3498db', 
    //     boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)', 
    //     outline: 'none', 
    // }, 
 }; 

 const modalActionsStyle = { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    marginTop: '30px', 
    gap: '15px', 
 }; 

 const modalCancelButtonStyle = { 
    padding: '12px 25px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '1.1em', 
    fontWeight: 'bold', 
    transition: 'background-color 0.3s ease, transform 0.2s ease', 
    boxShadow: '0 4px 10px rgba(108, 117, 125, 0.3)', 
    // ':hover': { 
    //     backgroundColor: '#5a6268', 
    //     transform: 'translateY(-2px)', 
    // }, 
 }; 

 const modalAddButtonStyle = { // Re-used for Save Changes 
    padding: '12px 25px', 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '1.1em', 
    fontWeight: 'bold', 
    transition: 'background-color 0.3s ease, transform 0.2s ease', 
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)', 
    // ':hover': { 
    //     backgroundColor: '#218838', 
    //     transform: 'translateY(-2px)', 
    // }, 
 }; 

 // Keyframes for animations (ensure these are in your client/src/index.css) 
 /* @keyframes fadeIn { 
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
 export default AdminCustomerManagement;