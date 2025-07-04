import React, { useState } from 'react';
import './styles/Pass.css'; // Ensure you import the CSS file for styling
import jsPDF from 'jspdf';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

const AdminOutpass = () => {
  const [rollNo, setRollNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [error1, setError1] = useState('');
  const [expectedOutTime,  setExpectedOutTime] = useState('');

  const [fingerprintData, setFingerprintData] = useState(null);
 
  // Function to verify and fetch full data for Pink Pass
  const handleVerifyPinkPass = async () => {
    setFingerprintData(null);
    setError1(null);
    if (rollNo.trim() === '') {
      setError('Please enter a valid Roll Number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3300/verify-roll-outpass/${rollNo}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setError(''); // Clear error

        // After fetching user data, update the gatepass table
        await updateGatepass(rollNo,data.parentno);
      } else if (response.status === 404) {
        setError('User not found');
        setUserData(null);
      } else {
        setError('Error fetching user data');
        setUserData(null);
      }
    } catch (err) {
      console.log(err);
      setError('Server error');
      setUserData(null);
    }
  };

  // Function to update gate pass with current date and time
  const updateGatepass = async (rollNo,parentno) => {
    try {
      const response = await fetch(`http://localhost:3300/update-outpass-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roll_no: rollNo }),
      });
      const data = await response.json();
      if (!response.ok) {
        
        setError(data.message);
        console.error('Error updating out pass:', data.message);
      } else {
        // sendSMS(parentno);
        console.log('Gate pass updated successfully.');
        setExpectedOutTime(data.expectedOutTime);
        // Send a WhatsApp message to the parent
        // await sendWhatsAppMessage(parentWhatsAppNumber, 'The MSG SENT successfully.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  

//   app.post('/update-outpass', async (req, res) => {
//     const { roll_no } = req.body;
//     const currentDateTime = new Date();
//     const currentDay = currentDateTime.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

//     // Function to format date and time as 'YYYY-MM-DD HH:MM:SS'
//     const formatDateTime = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         const hours = String(date.getHours()).padStart(2, '0');
//         const minutes = String(date.getMinutes()).padStart(2, '0');
//         const seconds = String(date.getSeconds()).padStart(2, '0');
//         return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//     };

//     const formattedDateTime = formatDateTime(currentDateTime);
//     console.log("Formatted DateTime:", formattedDateTime);

//     try {
//         // Check if there’s a recent outpass record within the current week
//         const checkQuery = `
//             SELECT * FROM outpass
//             WHERE roll_no = ? AND WEEKOFYEAR(issueDate) = WEEKOFYEAR(NOW())
//             ORDER BY issueDate DESC
//             LIMIT 1
//         `;
//         const [rows] = await dbconnect.execute(checkQuery, [roll_no]);

//         if (rows.length > 0) {
//             const lastOutpassDate = new Date(rows[0].issueDate);
//             const daysDifference = (currentDateTime - lastOutpassDate) / (1000 * 60 * 60 * 24);

//             if (daysDifference < 2 && currentDay !== 0) { // Ensure it’s not Sunday for weekly reset
//                 return res.status(400).send({ message: 'You took an outpass yesterday. You can take it again tomorrow.' });
//             }
//         }

//         // Check for expired passes and clean up as before
//         const existingRecord = rows[0];
//         const expectedOutTime = new Date(existingRecord.expOutTime);
//         const timeDifferenceInHours = (currentDateTime - expectedOutTime) / (1000 * 60 * 60);

//         if (timeDifferenceInHours >= 2) {
//             const deleteQuery = `DELETE FROM outpass WHERE outpassID = ?`;
//             await dbconnect.execute(deleteQuery, [existingRecord.outpassID]);
//             return res.status(400).send({ message: 'Your time is over, and your issued pass has been rejected.' });
//         }
//         if (timeDifferenceInHours < -2) {
//             return res.status(400).send({ message: 'You have still time to go.' });
//         }

//         // Update outTime if valid
//         const updateQuery = `UPDATE outpass SET outTime = ? WHERE outpassID = ?`;
//         await dbconnect.execute(updateQuery, [formattedDateTime, existingRecord.outpassID]);
//         res.status(200).send({
//             message: 'Outpass updated successfully!',
//             expectedOutTime: formatDateTime(expectedOutTime),
//         });
//     } catch (error) {
//         console.error('Error updating Outpass:', error);
//         res.status(500).send({ error: 'Failed to update Outpass.' });
//     }
// });







  
  // Function to generate Pink Pass PDF
 
  // Function to generate Outpass PDF

//   const sendSMS = async ( message) => {
//     try {
//         const response = await axios.post('http://localhost:3300/send-sms-out', {
           
//             message: message
//         });
//         if (response.data.success) {
//             console.log('SMS sent successfully!');
//             enqueueSnackbar('SMS Sent Successfully!', { variant: 'success' });
//         } else {
//             console.error('Failed to send SMS:', response.data.message);
//             enqueueSnackbar('SMS not Sent!', { variant: 'error' });
//         }
//     } catch (error) {
//         console.error('Error sending SMS:', error);
//     }
// };

 

  const handleVerifyFingerprint = async () => {
    setUserData(null);
    try {
        const response = await axios.post('http://localhost:3300/run-jar-verify');
        const data = response.data;

        // Assuming data is the student object now
        if (data && Object.keys(data).length > 0) {
            setFingerprintData(data); // Set the entire student data
            await updateGatepass(data.studentId,data.parentno); // Use data.studentId
        } else {
            alert("No user found.");
        }
    } catch (error) {
        console.error('Error running JAR:', error);
        // alert('Error occurred while adding fingerprint.');
    }
};
const generateOutpassPDF = () => {
  if (userData) {
    
    // updateGatepass(userData.studentId,userData.parentno);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Formats date as MM/DD/YYYY
    const formattedTime = currentDate.toLocaleTimeString();
    // const expectedDateTime = new Date(expectedOutTime); // Formats time as HH:MM:SS AM/PM
   
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 100],
      margin: 0 // Remove margins
    });



// Add the image to the PDF at the specified position (x, y) and size (width, height)
// doc.addImage(base64image, 'JPEG', 15, 1, 40, 10); // Adjust position and size as needed


// Header Section
doc.setFontSize(10);
doc.setFont('helvetica', 'bold'); // Bold font for header
doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 10); // Adjusted to start near the left
doc.setFontSize(8.5);
doc.text('OUTPASS FOR HOSTLERS', 14, 16);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 21);

// Draw a line to divide the header from the data
doc.line(2, 23, 75, 23); // Divider line

// Student Information Section
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('Student Name:', 3, 28);
doc.setFont('helvetica', 'normal');
doc.text(userData.sname?.toString() || '', 28.5, 28); // Ensure toString()

doc.setFont('helvetica', 'bold');
doc.text('Roll No:', 3, 35);
doc.setFont('helvetica', 'normal');
doc.text(userData.studentId?.toString() || '',  28.5, 35);

// Display Branch and Year separately
doc.setFont('helvetica', 'bold');
doc.text('Branch:', 3, 42);
doc.setFont('helvetica', 'normal');
doc.text(userData.branch?.toString() || '',  28.5, 42);

doc.setFont('helvetica', 'bold');
doc.text('Year:', 3, 49);
doc.setFont('helvetica', 'normal');
doc.text(userData.syear?.toString() || '',  28.5, 49);

doc.setFont('helvetica', 'bold');
doc.text('Block Name:', 3, 56);
doc.setFont('helvetica', 'normal');
doc.text(userData.hostelblock?.toString() || '',  28.5, 56);

doc.setFont('helvetica', 'bold');
doc.text('Room No:', 3, 63);
doc.setFont('helvetica', 'normal');
doc.text(userData.roomno?.toString() || '',  28.5, 63);

// Separate Out Time and Out Date
doc.setFont('helvetica', 'bold');
doc.text('Out DateTime: ', 3, 70);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate} ${formattedTime}`?.toString() || '',  28.5, 70); // Display only time


doc.setFont('helvetica', 'italic');
doc.text('Note: Return to college by 8:30pm',  10, 77); // Display only date

// Display only date

// Note Section
// doc.setFont('helvetica', 'italic');
// doc.text('Note: Return to college by 8:30 PM.', 4, 93);

// Implementing the PDF printing logic
const pdfBlob = doc.output('blob');
const url = URL.createObjectURL(pdfBlob);
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
iframe.src = url;
document.body.appendChild(iframe);
iframe.onload = function() {
iframe.contentWindow.print();
};
} else {
alert("No user data to generate the Outpass.");
}
};



const generateOutpassPDF1 = () => {
  if (fingerprintData) {
    

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Formats date as MM/DD/YYYY
    const formattedTime = currentDate.toLocaleTimeString(); // Formats time as HH:MM:SS AM/PM

    // Create PDF with 80x100 mm layout without margins
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 100],
      margin: 0 // Remove margins
    });

        

// Add the image to the PDF at the specified position (x, y) and size (width, height)
  // doc.addImage(base64image, 'JPEG', 16, 1, 40, 10); // Adjust position and size as needed

    // Header Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold'); // Bold font for header
    doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 10); // Adjusted to start near the left
    doc.setFontSize(9);
    doc.text('OUTPASS FOR HOSTLERS', 14, 16);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 21);
    
    // Draw a line to divide the header from the data
    doc.line(2, 23, 75, 23); // Divider line

    // Student Information Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Student Name:', 3, 26);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.sname?.toString() || '',  28.5, 26); // Ensure toString()

    doc.setFont('helvetica', 'bold');
    doc.text('Roll No:', 3, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.studentId?.toString() || '',  28.5, 35);

    // Display Branch and Year separately
    doc.setFont('helvetica', 'bold');
    doc.text('Branch:', 3, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.branch?.toString() || '',  28.5, 42);

    doc.setFont('helvetica', 'bold');
    doc.text('Year:', 3, 49);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.syear?.toString() || '',  28.5, 49);

    doc.setFont('helvetica', 'bold');
    doc.text('Block Name:', 3, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.hostelblock?.toString() || '',  28.5, 56);

    doc.setFont('helvetica', 'bold');
    doc.text('Room No:', 3, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(fingerprintData.roomno?.toString() || '',  28.5, 63);

    // Separate Out Time and Out Date
    doc.setFont('helvetica', 'bold');
    doc.text('Out DateTime:', 3, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formattedDate} ${formattedTime}`?.toString() || '',  28.5, 70); // Display only time

    // doc.text(formattedTime?.toString() || '',  28.5, 77); // Display only time

    // doc.setFont('helvetica', 'bold');
    // doc.text('Out Date:', 4.2, 84);
    // doc.setFont('helvetica', 'normal');
    // doc.text(formattedDate?.toString() || '',  28.5, 84); // Display only date

    // Note Section
    doc.setFont('helvetica', 'italic');
    doc.text('Note: Return to college by 8:30 PM.', 10, 77);

    // Implementing the PDF printing logic
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = function() {
      iframe.contentWindow.print();
    };
  } else {
    alert("No fingerprint data to generate the Outpass.");
  }
};





  return (
    <div className="p-5 ">
      <h1 className="text-center text-white text-2xl font-bold">OutPass Generation</h1>
      {/* <p className="text-center">Welcome to the Gate Pass Generation system.</p> */}
      
      <div className="button-container text-center mb-5">
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleVerifyFingerprint}>
          Verify Fingerprint
        </button>
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200 ml-2" onClick={handleVerifyPinkPass}>
          Verify Roll Number
        </button>
      </div>

      <input 
        type="text" 
        value={rollNo} 
        onChange={(e) => setRollNo(e.target.value)} 
        placeholder="Enter Roll Number" 
        className="border rounded w-1/3 px-3 py-2 mx-auto mb-4 block"
      />

{error && <p style={{
            color: 'white',
            textAlign: 'center',
            backgroundColor: 'red',
            opacity:0.7,
            fontWeight: 'bold',
            fontSize: 'px',
            padding: '8px',
            borderRadius: '9px',
            margin: '10px auto',
            maxWidth: '400px',
          }}
>{error}</p>}

{(!error) && fingerprintData && (
  <div style={{ marginTop: '20px', textAlign: 'center' }}>
   
    <div className="flex items-center bg-white shadow-md p-6 rounded-lg mx-auto" style={{ maxWidth: '800px' }}>
                  {/* Image Section */}
                  {fingerprintData.imageUrl ? (
                      <img 
                          src={fingerprintData.imageUrl} 
                          alt="Student" 
                          className="h-32 w-32 object-cover rounded mr-6" 
                      />
                  ) : (
                      <span>No image available</span>
                  )}
                  {/* Details Section */}
                  <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                      <div><strong>Name:</strong> {fingerprintData.sname}</div>
                      <div><strong>Roll No:</strong> {fingerprintData.studentId}</div>
                      <div><strong>Branch:</strong> {fingerprintData.branch}</div>
                      <div><strong>Year:</strong> {fingerprintData.syear}</div>
                     
                      <div><strong>Hostel Name:</strong> {fingerprintData.hostelblock}</div>
                      <div><strong>Room No:</strong> {fingerprintData.roomno}</div>
                      {/* <div><strong>Gatepass Count:</strong> {userData.gatepassCount}</div> */}
                      <div><strong>Parent Mobile No:</strong> {fingerprintData.parentno}</div>
                      
                      <div><strong>Date:</strong> {new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}</div>
                      <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                  </div>
              </div>
            
    <br />
    {/* <div style={{ margin: '20px 0' }}>
      <strong>Outing Count for Current Month: {fingerprintData.gatepassCount}</strong>
      {fingerprintData.gatepassCount > 4 && (
          <button className="bg-gray-500 text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-700 transition duration-200">
              Get Permission
          </button>
      )}
  </div> */}
    {/* <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generatePinkPassPDF1}>
      Print Pink Pass
    </button> */}
    <button className="bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generateOutpassPDF1}>
      Print Outpass
    </button>
  </div>
)}



{(!error) && userData &&  (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
        
        


<div className="flex items-center bg-white shadow-md p-6 rounded-lg mx-auto" style={{ maxWidth: '800px' }}>
                        {/* Image Section */}
                        {userData.imageUrl ? (
                            <img 
                                src={userData.imageUrl} 
                                alt="Student" 
                                className="h-32 w-32 object-cover rounded mr-6" 
                            />
                        ) : (
                            <span>No image available</span>
                        )}
                        {/* Details Section */}
                        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                            <div><strong>Name:</strong> {userData.sname}</div>
                            <div><strong>Roll No:</strong> {userData.studentId}</div>
                            <div><strong>Branch:</strong> {userData.branch}</div>
                            <div><strong>Year:</strong> {userData.syear}</div>
                           
                            <div><strong>Hostel Name:</strong> {userData.hostelblock}</div>
                            <div><strong>Room No:</strong> {userData.roomno}</div>
                            {/* <div><strong>Gatepass Count:</strong> {userData.gatepassCount}</div> */}
                            <div><strong>Parent Mobile No:</strong> {userData.parentno}</div>
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  

        <br />
        
        {/* Display Gatepass Count */}
        {/* <div style={{ margin: '20px 0' }}>
            <strong>Outing Count for Current Month: {userData.gatepassCount}</strong>
            {userData.gatepassCount > 4 && (
                <button className="bg-gray-500 text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-700 transition duration-200">
                    Get Permission
                </button>
            )}
        </div> */}

        {/* Print Buttons */}
        {/* <button className=" bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generatePinkPassPDF}>
            Print Pink Pass
        </button> */}
        <button className=" bg-gray-900 text-white font-semibold py-2 ml-3 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generateOutpassPDF}>
            Print Outpass
        </button> 
    </div>
)}
      {error1 && <p style={{
            color: 'white',
            textAlign: 'center',
            backgroundColor: 'red',
            opacity:0.7,
            fontWeight: 'bold',
            fontSize: 'px',
            padding: '8px',
            borderRadius: '9px',
            margin: '10px auto',
            maxWidth: '400px',
          }}
>{error1}</p>}

    </div>
  );
};

export default AdminOutpass;
