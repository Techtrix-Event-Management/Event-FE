import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./TeamEvent.css";
import qrImage from "./payment-qr.png";
import imageCompression from "browser-image-compression";

const TeamEvent = () => {
  const location = useLocation();
  const event = location.state?.event;
  const eventId = event?.id;
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");
  const [eventDetails, setEventDetails] = useState(null);
  const [rulebookLink, setRulebookLink] = useState(null);

  const [qrData, setQrData] = useState({ upiId: "", qrImage: "" });
  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    leaderCollege: "",
    leaderNumber: "",
    leaderEmail: "",
    paymentMethod: "paytm",
    utrNumber: "",
    receiptNumber: "",
    paymentImage: null,
    teamMembers: [],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`)
        .then((res) => res.json())
        .then((data) => {
          setEventDetails(data);
          setRulebookLink(data.rulebook);
          
          // Ensure maxAllowedParticipants determines the team size
          if (data.maxAllowedParticipants > 1) {
            setFormData((prev) => ({
              ...prev,
              teamMembers: Array.from({ length: data.maxAllowedParticipants - 1 }, () => ({
                name: "",
                college: "",
                number: "",
                email: "",
              })),
            }));
          }
        })
        .catch((error) => console.error("Error fetching event details:", error));
    }
  
    // Fetch QR Data
    fetch(`${process.env.REACT_APP_API_URL}/api/qr/getall`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setQrData({
            upiId: data[0].upiId,
            qrImage: `data:image/png;base64,${data[0].qrImage}`,
          });
        }
      })
      .catch((error) => console.error("Error fetching QR data:", error));
  }, [eventId]);
  

  

const handleFileChange = async (event) => {
  const file = event.target.files[0];

  if (file) {
    const options = {
      maxSizeMB: 0.1, // 100 KB
      maxWidthOrHeight: 800, // Adjust based on your requirement
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setFormData({ ...formData, paymentImage: compressedFile });

      // Convert to Base64 for preview
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to compress the image. Please try again.");
    }
  }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index][field] = value;
    setFormData({ ...formData, teamMembers: updatedMembers });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!eventId) {
      alert("Event ID is missing!");
      return;
    }
  
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "teamMembers" && formData[key]) {
        data.append(key, formData[key]);
      }
    });

    if (formData.paymentMethod === "other" && formData.customPaymentMethod) {
      // Send only the custom payment method value (not 'other')
      data.append("paymentMethod", formData.customPaymentMethod);
    } else {
      data.append("paymentMethod", formData.paymentMethod);
    }
    data.append("eventId", eventId);
    data.append("teamMembers", JSON.stringify(formData.teamMembers));
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/registered-students/register-team`, {
        method: "POST",
        body: data,
        credentials: "include", // Ensures HTTP-only cookies are sent
      });
  
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed.");
    }
  };
  

  return (
    
    <div className="event-container">
      {eventDetails && (
        <div className="form-container">
          {!isSubmitted && <h2>Register Your Team for {eventDetails.eventName}</h2>}
          {isSubmitted ? (
            <p className="success-message">Thank You for your participation in Techtrix 2k25. Our Team will Verify your registration. Stay tuned to the upcoming updates on email.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="teamName" placeholder="Team Name" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="text" name="leaderName" placeholder="Leader Name" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="text" name="leaderCollege" placeholder="Leader College" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="tel" name="leaderNumber" placeholder="Leader Contact" required pattern="[0-9]{10}" onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="email" name="leaderEmail" placeholder="Leader Email" required onChange={handleChange} />
              </div>
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="team-member">
                  <input type="text" placeholder="Member Name"  value={member.name} onChange={(e) => handleMemberChange(index, "name", e.target.value)} />
                  <input type="text" placeholder="College"  value={member.college} onChange={(e) => handleMemberChange(index, "college", e.target.value)} />
                  <input type="tel" placeholder="Contact"  pattern="[0-9]{10}" value={member.number} onChange={(e) => handleMemberChange(index, "number", e.target.value)} />
                  <input type="email" placeholder="Email"  value={member.email} onChange={(e) => handleMemberChange(index, "email", e.target.value)} />
                </div>
              ))}
              <div>
                <p className="mb-2">Payment Method:</p>
                <div className="checkbox-container">
                  {["paytm", "phonepay", "gpay", "bank", "cash", "other"].map((method) => (
                    <label key={method}>
                      <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={handleChange} />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Show custom input field for "Other" payment method */}
              {formData.paymentMethod === "other" && (
                <div className="input-group">
                  <input type="text" name="customPaymentMethod" required placeholder="Enter Custom Payment Method" value={formData.customPaymentMethod} onChange={handleChange} />
                </div>
              )}
  
              {formData.paymentMethod !== "cash" ? (
                              <>
                                <div className="qr-section">
                                  <p>Scan the QR Code to Pay:</p>
                                  {qrData.qrImage ? (
                                    <img src={qrData.qrImage} alt="QR Code for Payment" className="qr-code" />
                                  ) : (
                                    <p>Loading QR Code...</p>
                                  )}
                                  <p className="upi-text">UPI ID: {qrData.upiId || "Loading..."}</p>
                                </div>
                                <div className="input-group">
                                  <input type="text" name="utrNumber" placeholder="UTR Number" required pattern="[0-9]{12}" onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                  <label className="block mb-2">Payment Screenshot</label>
                                  <input type="file" accept="image/*" required onChange={handleFileChange} />
                                  {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
                                </div>
                              </>
              ) : (
                <>
                  <div className="input-group">
                    <input type="text" name="receiptNumber" placeholder="Receipt Number" required onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Receipt Screenshot</label>
                    <input type="file" accept="image/*" required onChange={handleFileChange} />
                    {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
                  </div>
                </>
              )}
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          )}
  
          {rulebookLink && (
            <div className="rulebook-section">
              <a href={`data:application/pdf;base64,${rulebookLink}`} download="Team_Event_Rulebook.pdf" className="download-btn">
                Download Rule Book
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
};

export default TeamEvent;
