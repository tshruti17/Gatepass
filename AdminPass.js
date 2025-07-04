import React, { useState } from 'react';
import './styles/Pass.css'; // Ensure you import the CSS file for styling
import jsPDF from 'jspdf';
import axios from 'axios';

const AdminPass = () => {
  const [rollNo, setRollNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [error1, setError1] = useState('');
  const [expectedOutTime, setExpectedOutTime] = useState('');
  const [fingerprintData, setFingerprintData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to verify and fetch full data for Pink Pass
  const handleVerifyPinkPass = async () => {
    setFingerprintData(null);
    setError1(null);
    if (rollNo.trim() === '') {
      setError('Please enter a valid Roll Number.');
      return;
    }
    if (expectedOutTime.trim() === '') {
      setError('Please enter a valid Expected Out Time.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3300/verify-roll/${rollNo}`);
      setLoading(true)
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      setLoading(false)

        setError(''); // Clear error

        // After fetching user data, update the gatepass table
        // await updateGatepass(rollNo);
        await updateGatepassIssue(rollNo,expectedOutTime);
        
      } else if (response.status === 404) {
        setError('User not found');
      setLoading(false)

        setUserData(null);
      } else {
        setError('Error fetching user data');
      setLoading(false)

        setUserData(null);
      }
    } catch (err) {
      console.log(err);
      setError('Server error');
      setUserData(null);
      setLoading(false)

    }
  };


 // Function to update gate pass with current date and time
 const updateGatepassIssue = async (rollNo , expectedOutTime) => {
  try {

    const currentDateTime = new Date();
    const expectedDateTime = new Date(expectedOutTime);
    console.log(currentDateTime)
    console.log(expectedDateTime)
    console.log(expectedOutTime)

if(expectedDateTime < currentDateTime){
  setError('Invalid Expected out time');
  return;
}

    const timeDifference = (expectedDateTime - currentDateTime);
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference > 48 ) {
      setError('You cannot issue a pink pass more than 48 hours in advance.');
      return;
    }



    const response = await fetch(`http://localhost:3300/update-gatepass-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roll_no: rollNo, current_time: currentDateTime, expected_out_time: expectedOutTime }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message);
      console.error('Error updating gate pass:', data.message);
    } else {
      console.log('Gate pass updated successfully.');
      // setError1( `You have issued pink pass on ${currentDateTime} with expected out time ${expectedDateTime}`);

      // Send a WhatsApp message to the parent
      // await sendWhatsAppMessage(parentWhatsAppNumber, 'The MSG SENT successfully.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
};



  const handleVerifyFingerprint = async () => {
    setUserData(null);
    setError(null)
   

    if (expectedOutTime.trim() === '') {
        setError('Please enter a valid Expected Out Time.');
        return;
      }
    try {
        const response = await axios.post('http://localhost:3300/run-jar-verify');
        setLoading(true)
        const data = response.data;


        // Assuming data is the student object now
        if (data && Object.keys(data).length > 0) {
            setFingerprintData(data); // Set the entire student data
            await updateGatepassIssue(data.studentId,expectedOutTime); // Use data.studentId
            setLoading(false)
        } else {
            alert("No user found.");
            setLoading(false)

        }
    } catch (error) {
        console.error('Error running JAR:', error);
        setError()
        setLoading(false)

        // alert('Error occurred while adding fingerprint.');
    }
};



  // Function to generate Pink Pass PDF
  const generatePinkPassPDF = () => {
    if (userData) {
      
      // updateGatepass(userData.studentId,userData.parentno);
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });; // Formats date as MM/DD/YYYY
      const formattedTime = currentDate.toLocaleTimeString();
      const expectedDateTime = new Date(expectedOutTime); // Formats time as HH:MM:SS AM/PM
      const formattedDate1 = expectedDateTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime1 = expectedDateTime.toLocaleTimeString();
     
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
doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 16); // Adjusted to start near the left
doc.setFontSize(8.5);
doc.text('PINKPASS FOR HOSTLERS', 14, 21);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 26);

// Draw a line to divide the header from the data
doc.line(2, 28, 75, 28); // Divider line

// Student Information Section
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('Student Name:', 3, 35);
doc.setFont('helvetica', 'normal');
doc.text(userData.sname?.toString() || '', 28.5, 35); // Ensure toString()

doc.setFont('helvetica', 'bold');
doc.text('Roll No:', 3, 42);
doc.setFont('helvetica', 'normal');
doc.text(userData.studentId?.toString() || '',  28.5, 42);

// Display Branch and Year separately
doc.setFont('helvetica', 'bold');
doc.text('Branch:', 3, 49);
doc.setFont('helvetica', 'normal');
doc.text(userData.branch?.toString() || '',  28.5, 49);

doc.setFont('helvetica', 'bold');
doc.text('Year:', 3, 56);
doc.setFont('helvetica', 'normal');
doc.text(userData.syear?.toString() || '',  28.5, 56);

doc.setFont('helvetica', 'bold');
doc.text('Block Name:', 3, 63);
doc.setFont('helvetica', 'normal');
doc.text(userData.hostelblock?.toString() || '',  28.5, 63);

doc.setFont('helvetica', 'bold');
doc.text('Room No:', 3, 70);
doc.setFont('helvetica', 'normal');
doc.text(userData.roomno?.toString() || '',  28.5, 70);

// Separate Out Time and Out Date
doc.setFont('helvetica', 'bold');
doc.text('Iss. DateTime: ', 3, 77);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate} ${formattedTime}`?.toString() || '',  29, 77); // Display only time

doc.setFont('helvetica', 'bold');
doc.text('Out DateTime:', 3, 84);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate1} ${formattedTime1}`?.toString() || '',  29, 84); // Display only time
// doc.text(expectedDateTime?.toString() || '',  28.5, 84); // Display only date

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
alert("No user data to generate the Pinkpass.");
}
  };
 

  // Function to generate Pink Pass PDF
  const generatePinkPassPDF1 = () => {
    if (fingerprintData) {
      
      // updateGatepass(userData.studentId,userData.parentno);
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Formats date as MM/DD/YYYY
      const formattedTime = currentDate.toLocaleTimeString();
      const expectedDateTime = new Date(expectedOutTime); // Formats time as HH:MM:SS AM/PM
      const formattedDate1 = expectedDateTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedTime1 = expectedDateTime.toLocaleTimeString();
     
      const doc = new jsPDF({
        unit: 'mm',
        format: [80, 100],
        margin: 0 // Remove margins
      });


// // Add the image to the PDF at the specified position (x, y) and size (width, height)
// doc.addImage(base64image, 'JPEG', 15, 1, 40, 10); // Adjust position and size as needed


// Header Section
doc.setFontSize(10);
doc.setFont('helvetica', 'bold'); // Bold font for header
doc.text('GMR INSTITUTE OF TECHNOLOGY', 1.5, 16); // Adjusted to start near the left
doc.setFontSize(8.5);
doc.text('PINKPASS FOR HOSTLERS', 14, 21);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('GMR Nagar, RAJAM-532 127,  1800-129-118', 5, 26);

// Draw a line to divide the header from the data
doc.line(2, 28, 75, 28); // Divider line

// Student Information Section
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.text('Student Name:', 3, 35);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.sname?.toString() || '', 28.5, 35); // Ensure toString()

doc.setFont('helvetica', 'bold');
doc.text('Roll No:', 3, 42);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.studentId?.toString() || '',  28.5, 42);

// Display Branch and Year separately
doc.setFont('helvetica', 'bold');
doc.text('Branch:', 3, 49);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.branch?.toString() || '',  28.5, 49);

doc.setFont('helvetica', 'bold');
doc.text('Year:', 3, 56);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.syear?.toString() || '',  28.5, 56);

doc.setFont('helvetica', 'bold');
doc.text('Block Name:', 3, 63);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.hostelblock?.toString() || '',  28.5, 63);

doc.setFont('helvetica', 'bold');
doc.text('Room No:', 3, 70);
doc.setFont('helvetica', 'normal');
doc.text(fingerprintData.roomno?.toString() || '',  28.5, 70);

// Separate Out Time and Out Date
doc.setFont('helvetica', 'bold');
doc.text('Iss. DateTime: ', 3, 77);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate} ${formattedTime}`?.toString() || '',  29, 77); // Display only time

doc.setFont('helvetica', 'bold');
doc.text('Out DateTime:', 3, 84);
doc.setFont('helvetica', 'normal');
doc.text(`${formattedDate1} ${formattedTime1}`?.toString() || '',  29, 84); // Display only time
// doc.text(expectedOutTime?.toString() || '',  28.5, 84); // Display only date

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
alert("No user data to generate the Pinkpass.");
}
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner border-t-4 border-gray-800 rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );

  }
 
  
  return (
    <div className="p-5">
      <h1 className="text-center text-2xl font-bold">PinkPass Generation</h1>
      {/* <p className="text-center">Welcome to the Gate Pass Generation system.</p> */}
      
      <div className="button-container text-center mb-5">
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200" onClick={handleVerifyFingerprint}>
          Generate using Fingerprint
        </button>
        <button className="bg-gray-800 text-white font-bold py-2 px-4 rounded shadow-md hover:bg-gray-600 transition duration-200 ml-2" onClick={handleVerifyPinkPass}>
          Generate using Roll Number
        </button>
      </div>

      <input 
        type="text" 
        value={rollNo} 
        onChange={(e) => setRollNo(e.target.value)} 
        placeholder="Enter Roll Number" 
        className="border rounded w-1/3 px-3 py-2 mx-auto mb-4 block"
      />
      <input
          type="datetime-local"
          value={expectedOutTime}
          onChange={(e) => setExpectedOutTime(e.target.value)}
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
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  
          <br />
          {/* <div style={{ margin: '20px 0' }}>
            <strong className='text-white'>Outing Count for Current Month: {fingerprintData.gatepassCount}</strong>
            {fingerprintData.gatepassCount > 4 && (
                <button className="border border-white text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-900 transition duration-200">
                    Get Permission
                </button>
            )}
        </div> */}
           <button className="bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 " onClick={generatePinkPassPDF1}>
            Print Pink Pass
          </button> 
          {/* <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200 ml-2" onClick={generateOutpassPDF1}>
            Print Outpass
          </button> */}
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
                            
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                  

        <br />
        
        {/* Display Gatepass Count */}
        {/* <div style={{ margin: '20px 0' }}>
            <strong className='text-white'>Outing Count for Current Month: {userData.gatepassCount}</strong>
            {userData.gatepassCount > 4 && (
                <button className=" border border-white text-white font-semibold py-2 ml-4 px-4 rounded hover:bg-gray-900 transition duration-200">
                    Get Permission
                </button>
            )}
        </div> */}

        {/* Print Buttons */}
        <button className=" bg-gray-900 text-white font-semibold py-2 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generatePinkPassPDF}>
            Print Pink Pass
        </button> 
        {/* <button className=" bg-gray-800 text-white font-semibold py-2 ml-3 px-4 rounded hover:bg-gray-700 transition duration-200" onClick={generateOutpassPDF}>
            Print Outpass
        </button> */}
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

export default AdminPass;
