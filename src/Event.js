import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Event.css";
import imageCompression from "browser-image-compression";

const Event = () => {
  const location = useLocation();
  const event = location.state?.event; // Get the event object
  const eventId = event?.id;
  const [customPaymentMethod, setCustomPaymentMethod] = useState("");

  useEffect(() => {
    document.body.style.background = "transparent";
    document.body.style.backdropFilter = "blur(10px)";

    return () => {
      document.body.style.background = "";
      document.body.style.backdropFilter = "";
    };
  }, []);
  const [eventDetails, setEventDetails] = useState(null);
  const [qrData, setQrData] = useState({ upiId: "", qrImage: "" });
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    email: "",
    number: "",
    branch: "",
    paymentMethod: "paytm",
    utrNumber: "",
    receiptNumber: "",
    paymentImage: null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`)
              .then((res) => res.json())
        .then((data) => setEventDetails(data))
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

  if (!file) return;

  try {
    const options = {
      maxSizeMB: 0.1, // Maximum file size (200KB)
      maxWidthOrHeight: 800, // Maximum width/height
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    setFormData({ ...formData, paymentImage: compressedFile });

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(compressedFile);

  } catch (error) {
    console.error("Error compressing image:", error);
  }
};


  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

    if (name === "paymentMethod" && value !== "other") {
      setCustomPaymentMethod(""); // Reset custom input if not "Other"
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!eventId) {
      alert("Event ID is missing!");
      return;
    }
  
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
  
    // Replace "other" with the actual custom payment method entered by the user
    if (formData.paymentMethod === "other" && customPaymentMethod.trim() !== "") {
      data.set("paymentMethod", customPaymentMethod);
    }
  
    data.append("eventId", eventId);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/registered-students/register`, { 
        method: "POST",
        body: data,
        credentials: "include",
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
          {!isSubmitted && <h2>Register for {eventDetails.eventName}</h2>}
          {isSubmitted ? (
            <p className="success-message">Thank You for your participation in Techtrix 2k25. Our Team will Verify your registration. Stay tuned to the upcoming updates on email.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="text" name="college" placeholder="College Name" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <input type="tel" name="number" placeholder="Contact Number" required pattern="[0-9]{10}" onChange={handleChange} />
              </div>
              

              <div>
                <p className="mb-2">Payment Method:</p>
                <div className="checkbox-container">
                  {["paytm", "phonepay", "gpay", "other", "cash"].map((method) => (
                    <label key={method}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={handleChange}
                      />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {formData.paymentMethod === "other" && (
                <div className="input-group">
                  <input
                    type="text"
                    name="customPaymentMethod"
                    placeholder="Enter payment method"
                    required
                    value={customPaymentMethod}
                    onChange={(e) => setCustomPaymentMethod(e.target.value)}
                  />
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
                    <label className="block mb-2">Receipt Screenshot</label>
                    <input type="file" accept="image/*" required onChange={handleFileChange} />
                    {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
                  </div>
                </>
              )}

              <button type="submit" className="submit-btn">Submit</button>
            </form>
          )}
        </div>
      )}

      {eventDetails && eventDetails.rulebook && (
        <div className="rulebook-section">
          <a href={`data:application/pdf;base64,${eventDetails.rulebook}`} download="Event_Rulebook.pdf" className="download-btn">
            Download Event RuleBook
          </a>
        </div>
      )}
    </div>
);

};

export default Event;
