import React, { useState } from 'react';
import './styles/StudentDetails.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function StudentDetails() {
    const [rollNo, setRollNo] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleGetDetails = async () => {
        if (!rollNo) {
            enqueueSnackbar('Please enter a roll number to view details.', { variant: 'error' });
            return;
        }

        try {
            const response = await axios.get(`http://localhost:3300/verify-rollupdate/${rollNo}`);
            if (response.data && response.data.length > 0) {
                enqueueSnackbar('Student data loaded successfully.', { variant: 'success' });
                // Navigate to Profile page if the student data is found
                navigate(`/studentprofile/${rollNo}`);
            } else {
                // Show Snackbar if the student is not found
                enqueueSnackbar('No student found with this roll number.', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            enqueueSnackbar('Failed to fetch student data. Please try again.', { variant: 'error' });
        }
    };

    return (
        <div className="form-container">
            <div className="form-grid1">
                <label htmlFor="rollNo" className="text-center text-xl font-bold text-gray-700">
                    Enter Register ID:
                </label>
                <input
                    type="text"
                    id="rollNo"
                    placeholder="Enter Roll No"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="input-field"
                />
                <button
                    onClick={handleGetDetails}
                    className={`get-details-btn ${rollNo ? 'enabled' : 'disabled'}`}
                    style={{ marginTop: '1rem' }}
                >
                    Get Details
                </button>
            </div>
        </div>
    );
}

export default StudentDetails;
