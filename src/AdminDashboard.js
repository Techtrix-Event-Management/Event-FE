import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    
    const [newEvent, setNewEvent] = useState({ eventName: '', description: '', registrationOpen: true, isTeamParticipation: false, maxTeamSize: '', image: null, rulebook: null});
    const [editingEvent, setEditingEvent] = useState(null);
    const [showForm, setShowForm] = useState(false); // State to show/hide form
    const [showStudents, setShowStudents] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [soloStudents, setSoloStudents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [teamSearchQuery, setTeamSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [pdfFileName, setPdfFileName] = useState(null);
    const [students, setStudents] = useState([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [editSponsorId, setEditSponsorId] = useState(null);
    const [sponsors, setSponsors] = useState([]);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: "",
    websiteUrl: "",
    logo: null,
    images: [],
    imageCount: 1,
  });
  const [showSponsors, setShowSponsors] = useState(false); 
  const [uniqueUpiId, setUniqueUpiId] = useState("");
    const [selectedQrImage, setSelectedQrImage] = useState(null);
    const [previewQrImage, setPreviewQrImage] = useState(null);
    const [retrievedQrImage, setRetrievedQrImage] = useState(null);
    const [inputQrId, setInputQrId] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const toggleForm = () => {
        setIsVisible(!isVisible);
    };
    const [downloadFormat, setDownloadFormat] = useState("pdf");

   
    useEffect(() => {
        if (showEvents) {
            fetch(`${process.env.REACT_APP_API_URL}/api/events`)                .then(response => response.json())
                .then(data => setEvents(data))
                .catch(error => console.error("Error fetching events:", error));
        }
    }, [showEvents]);

    const fetchStudents = (event) => {
        setStudents(null);
        setSelectedEvent(event);
        setSoloStudents([]); // Clear previous data
        setTeams([]);
    
        const url = event.isTeamParticipation 
        ? `${process.env.REACT_APP_API_URL}/api/auth/${event.id}/teams`
        : `${process.env.REACT_APP_API_URL}/api/auth/${event.id}/registered-students`;
    
        fetch(url, {
            method: "GET",
            credentials: "include", // Ensures HTTP-only cookies are sent
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }
            return response.json();
        })
        .then(data => {
            setStudents(data);
            if (event.isTeamParticipation) {
                setTeams(data); // Set teams if event has team participation
            } else {
                setSoloStudents(data); // Set solo students if event is individual
            }
        })
        .catch(error => console.error("Error fetching students:", error));
    };
    
    const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/sponsors`;
    useEffect(() => {
        fetchSponsors();
      }, []);
    
      const fetchSponsors = async () => {
        const response = await fetch(`${API_BASE_URL}/all`);
        const data = await response.json();
        setSponsors(data);
      };
    
      const handleSponsorChange = (e) => {
        setSponsorFormData({ ...sponsorFormData, [e.target.name]: e.target.value });
      };
    
      const handleLogoChange = (e) => {
        setSponsorFormData({ ...sponsorFormData, logo: e.target.files[0] });
      };
    
      const handleImageChange = (index, file) => {
        const updatedImages = [...sponsorFormData.images];
        updatedImages[index] = file;
        setSponsorFormData({ ...sponsorFormData, images: updatedImages });
      };
    
      const handleImageCountChange = (e) => {
        const count = parseInt(e.target.value);
        setSponsorFormData({
          ...sponsorFormData,
          imageCount: count,
          images: new Array(count).fill(null), // Initialize empty slots for images
        });
      };
    
      const handleSponsorSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", sponsorFormData.name);
        formData.append("websiteUrl", sponsorFormData.websiteUrl);
        if (sponsorFormData.logo) formData.append("logo", sponsorFormData.logo);
    
        sponsorFormData.images.forEach((image, index) => {
          if (image) formData.append(`images`, image);
        });
    
        const response = await fetch(`${API_BASE_URL}/add`, {
          method: "POST",
          body: formData,
          credentials: "include",
          
        });
    
        if (response.ok) {
          alert("Sponsor Added");
          setSponsorFormData({ name: "", websiteUrl: "", logo: null, images: [], imageCount: 1 });
          setShowSponsorForm(false);
          fetchSponsors();
        } else {
          alert("Error saving sponsor");
        }
    };

    
        
        // Delete sponsor
        const handleDeleteSponsor = async (sponsorId) => {
            if (!window.confirm("Are you sure you want to delete this sponsor?")) {
              return;
            }
        
            try {
              const response = await fetch(`${API_BASE_URL}/delete/${sponsorId}`, {
                method: "DELETE",
                credentials: "include",
              });
        
              if (response.ok) {
                alert("Sponsor deleted successfully");
                setSponsors(sponsors.filter((sponsor) => sponsor.id !== sponsorId));
              } else {
                alert("Failed to delete sponsor.");
              }
            } catch (error) {
              console.error("Error deleting sponsor:", error);
              alert("An error occurred while deleting the sponsor.");
            }
          };
          
          const toggleQrForm = () => {
            setIsFormVisible(!isFormVisible);
        };
    
          const handleQrImageChange = (e) => {
            setSelectedQrImage(e.target.files[0]);
            setPreviewQrImage(URL.createObjectURL(e.target.files[0]));
        };
    
       
        const handleQrUpload = async () => {
            const formData = new FormData();
            formData.append("upiId", uniqueUpiId);
            formData.append("qrImage", selectedQrImage);
        
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/qr/postqr`, {                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to upload QR Code");
                }
        
                const data = await response.json();
                alert("QR Code Uploaded Successfully!");
                console.log(data);
            } catch (error) {
                console.error("Error uploading QR Code", error);
            }
        };
        
        
    const openRulebook = (base64String) => {
        const byteCharacters = atob(base64String.split(",")[1]); // Decode Base64
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    };

    const openImage = (base64String) => {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    };
    
    
    const handleSearch = async () => {
        try {
            const response = await fetch(`/api/auth/search?name=${studentSearchQuery}`, {
                method: "GET",
                credentials: "include",
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch students");
            }
    
            const data = await response.json();
            setSoloStudents(data);
        } catch (error) {
            console.error("Error searching students:", error);
        }
    };
    
    const handleTeamSearch = async () => {
        try {
            const response = await fetch(`/api/auth/teams/search?keyword=${teamSearchQuery}`, {
                method: "GET",
                credentials: "include",
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch teams");
            }
    
            const data = await response.json();
            setTeams(data);
        } catch (error) {
            console.error("Error searching teams:", error);
        }
    };
    
    

    const collegeHeaderImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA24AAAC7CAYAAAAdSs1mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAP+lSURBVHhe7F0FgFXV1v7uuTl3uoGhu7tBygTFLgTkIYrBs5Wn4rOeHShIiRggSCMdgnR3NzMMk0zH7Tj7X+vcO8wMDDAgo+B/vmFz7z2xY+046ztr77U1a9euFb/++itUqFChQoUKFSpUqPj/isTERCQlJaFr167+IypUXB/QaDR44403oOnfv7+YNm0aHn30Uf8pFSpUqFChQoUKFSr+f+H06dNIS0tDp06d/EdUqLg+MGPGDIwePdpH3EwmEyZNmuQ/pULFtcHBgwdhNptRu3Zt/xEVKlSoUKFChYrrE5MnT8aaNWvw888/+4+oUHF9oEWLFhgyZAgk/28VKq45+GXAwoUL/b9UqFChQoUKFSquX7jdbuh0Ov8vFSquP6jETUWFgQdAvV7v/6VChQoVKlSoUHH9wuPxqHqLiusaKnFTUWFQB0AVKlSoUKFCxY0C9YWziusdKnFTUWFQpxyoUKFChQoVKm4UqHqLiusdKnFTUWFQLW4qVKhQoUKFihsFqt6i4nqHStxUVBjUKQcqVKhQoUKFihsFqsVNxfUOlbipqDCoA6AKFSpUqFCh4kaB+sJZxfUOlbipqDCoUw5UqFChQoUKFTcKVL1FxfUOlbipqDCoFjcVKlSoUKFCxY0CVW9Rcb1DJW4qKgzqmysVKlSoUKFCxY0CVW9Rcb1DJW4qKgzqXHEVKlSoUKFCxY0C1eKm4nqHStxUVBjUAVCFChUqVKhQcaNAfeGs4nqHStxUVBjUKQcqVKhQoUKFihsFqt6i4nqHStxUVBhUi5sKFSpUqFCh4kaBqreouN6hEjcVFQb1zZUKFSpUqFCh4kaBqreouN6hEjcVFQZ1rrgKFSpUqFCh4kaBqreouN6h6d+/vzCZTJg0aZL/kAoV1wb169fH4sWLlU8VNwpk5CYcwpkC2f/bD40JMXUboLLZ/7u8cGbg5LE0WAVFoQ1D9cY1EPZPf13kycapw8mwUJkvBU1AJeobsTDZjmPFzPWwt3kAdzfV4MyhM8iXWWBGRNdpiCqB/hsuCicyTh5Dmk/ICKveGDXKLWQZeYmHcSbPi1LZLXfal4cz4ySOpVkpfg20YdXRuEbYlb8xlPNw+orlUsGQc3Hkj6VYd6wAAVVboPutnVHdehzxurqoG+GhOjnqrxMJodWboOZF6sR2fAVmrrejzQN3o7k568/1Fxf1t6P++6VQVG9S86/vb5eUy1+dGR9c1AaP+tugFFodTWpeRRtUQOPjvgWYu8uILg/1QaNg/2EV/xjcf//9GDBggPKpQsX1hBYtWmDIkCGqxU1FxUGdcnBjwhBoRP7S19CzdUu0bNkK3V6cjxxDMAKuZtq/ViBt2hNo14ri6vw6Vjj8x//BkFN/wZD2PTDo05lYuWkLFr5/L9q2pPK36YO35mzBlnW/4esnb0a7fuNxnPrIoZEDcPeQp/DgXW/iD7cWnr2foW8bvr4vvtjt8sd6KWgh0qbhiXatqL464/UrErIEQ1AQ5MOj8XBbru+WaPvgNzgomxFwjbquVqRh2hPt0Iri7vz6ClxVE5CuRi4ViLxN+Oi2Dhg0z4vmvbqjoXYnvni4F27p+yKmJvBLD3q0np2Bp9pznXTEK0suUmrPIYwccDeGPPUg7nrzDzj/bH9Rkn0K7fn+jq/gYslWGC4rl78Ocs4RHE71Kt8lnMWMp9orbbDjK0uurg0ysmdgaK8H8dSQvrip/w/+gyr+SVD1FhXXO1TipqLCoC7yvREhITCmPjr37oTqWv6tRVyHO9ClYRWEGZQLrgy6WLRpWx9/t3Hkr4WE2AfHYvm0j/Hac0/i3haR0PBhTQia3PkEnnnhPfy8YhIGVuPhV4e4zrejc52aaNW7JxroglGrSyvUuKKRWYfYNm1R/yqFbI6siZb39EITPedSA32zm3Ffy+oIv5r6LgO62DZoe7WZO4erkUtFwYUtHz+F97c2wfOfP47OjRujQ98XMHbGh+goMmBzMUHRIaZNOzQIUmr+4tDFofPtnVGnZiv07tmAxss/2V90MWjTrgEul2zFoDxy+YsgZ2Dxf57FuMMe5acupg3aNQjy9cM/A10IwkO0FI+M3C3r/AdV/JOg6i0qrneoxE1FhUGdK34DQ6M5NzhI0p9Udyiu/1cIaITHn70flS41ukb0wTND2iKURBPW639YcyIBO757xEeWSV5XLrGruack6H5/fv9sTGXhmjSBq5JLBcCbgLXrT8Lt2IH5c08RXfEjuDNee/U2BPq4AoHye9kMh6HX/9bgRMIOfPdIdSjvSv6ssP4uOZVbLhUNGw6MG4ynJ8fDZ2/zQXMtGmHoXRi/5wSO7PgUPatX9R9U8U+CanFTcb1DJW4qKgzqAPj/BHI2tv8wHAP7DcHzzzyBp9+fif15F3+77j29EqPefgUvv/wKRny1CMfyT2LRl2/i5ZdewkuvTcC6gwvxv0G90a1bbzzx5Vqc9ZzFxnHP4/5eN6HXg8Mx85jTHxPDhlPLxuB/776DFx6+BT37PonPVybBpyNacGjOp/jPyxTvy8Px45ZjWPjB47i9ey88+J9ZUKKRM7Bh/Fu+tF96Ga9/PB37cmU4Ty3H6P++glffm4I9eRzXpdIpDSn6VtzZxeT/dTEY0LZvH1RNWYOx75IsKP1XPl6A0yU1zVIof/oKvKexctTbeOXll/HKiK+w6NjVz5mznVqGMf97F++88DBu6dkXT36+Ekn+hC2H5uDT/7ysyG74j1twbOEHePz27lRP/8GsUvVUEl6cXjkKb7/yMl5+ZQS+WnTMP3XtSsooI2PDeLzFdUuye/n1jzF9Xy5k5yksH/1fvPLqe5jiq7hrn39NCMLD9NB4U/Db0C7oPnQs1qf4aErEXS/i6eZlvK23Hcb0tx7FLd164ZG35yNeSd+LM2vG4l2Sw0svvYKPF5wuRTSKcEF/YWG54rHg3cfxyBMv4tURX2D0u1TH+b7rS8J2eDreevQWdOv1CN6eH19Cln+y35SFcsvlWqTtQvyCd/H4I0/gxVdH4IvR71I7IgFQf1730X3o/coypHvzsfW712lMmYitNv9tCmw4PP0tPHpLN/R65G3M91WGH5dvg9qwqjDs2IfIIf/yHShnXai4MaC+cFZx3YOdkwwZMkSoUHGtERISIvLy8vy/VNxIcO99R7TSs78KnWjyxjbh9B+/EBax6Z12IkRXVQxZVCC8eYvEE1V1IqTdf8XGQt8V1tn9RJgGQhP8kJhh5SNOseHl+iK84ztiY65yibDOGyCiJEpPGy2aP/ymmPDdi6JDsIZ+x4g2tz8i/j3qZ/HBnZWFFhoRcuf3ItXLd3nE0XG9RYypq/jilEd4078Td5g1QhPYWXx60K3EK/J+EfcFUTwanYjrMFi8P/ETcV81Lf0OEreMSRQcjSfhe9E3SlLK2uC1Tf6yOsSaF7uJIfNz+IrLp3NRuMX+99oIUgMEdA3F61vOl6Rb7H2npXJe1+A1sYlOe+K/FDex7HV1xUvr+fpypG+dLfqFcTmDxUM+IQvnhpdF/fCO4p0iIV8K1mni/kC6n+Rrvm+q8MVAKR8dJ3rHmETXL04JjzddfHeHWWg0gaLzpwcp54w88ct9QUJD9+niOojB708Un9xXTamnoFvGiESlnqxidr8w5Zrgh2b44nZuEC/XDxcd39kofLm7fBkvkIsnQXzfN0pIJWTHcKx5UXQbMl8oNXdN8n8+vCJr8VBRT8/y4j6iEVJwfdF3xBxx1OK/hGH/TQyMpHal0YroNoPE/777RNxfg9teqOgzMUVpe9TRxDst9aXa3uX7C8nqy+4iyNhLfJviFZ60hWJo89vEN/7M2n8bKCKpL2moL7UZ9D/x3Sf3ixpa+h3aR0yk68sj6/L0mwtRHrlcm7Q9R78U3YOMote3JEdPmlg4tLm47Rs6504WO+a8LNpxO5FixN2fLRRLl+8QyW67+G1gJLUVjdBGtxGD/ved+OT+Gko9h/aZKBSxlCdv1F4OLhgjvvhpi8gquucSdaHixkPnzp3Fxo0b/b9UqLh+0Lx5czFq1Ch+5qlQUTFQLW7/fHhP/4R3Ru5EgdQArdoEQgpug9YNJBTs/BrvTzmDsuxunpNTMHJdU3wx9R10CfMd0wYHIYBnMmmb4okvP8TTTwzAzTV0lEAO7C1fxlcvDMTTdzVjNxywHT2A4/wKXM7Ayjl/IMOxDbNnnIAIjUVMIGm8tgPYddA/UcsYhCCjEjHq9XsXbz/1NO5sRvEKO04cPgE3n6k5EG8Obgi9xoNT82dgM7+d96Zgn7MHhvYOL186Vw0NQkIu45ruatL3nMSUkevQ9IupeKdIyFcMGRkr5+CPDAe2zZ6BEyIUsTGBpOracGDXQf9UOCOCgozK1DxtvX549+2n8PSdzaCjerKfOIwTLOAL4MHJKSOxrukXmPpOFyi5u5oyamti4JuD0VCvgefUfMzwVRxS9jnRY2hvhFdY/iVE3jkaC396Cm0ieL2TgFx4HIs+ehgdu7+MJWnnt3o9Ogz7Bm8PHYa+bHUSFhzcc1hpe2ylulz1X9hfnNi1aQesrvX4aMC7+N19Gz788EHEssfNktB3wLBv3sbQYX3hS/Yg9hymVK9Rv7kQ5ZDLNUrbuWsTdlhdWP/RALz7uxu3ffghHoyVicHHoW23BlCcV2qMqNL6NvS+vS3i6PYi6DsMwzdvD8Wwvs2VerYc3AMWS/naYCia3D0Mr/2rI4gcE8pZFypuGKh6i4rrHSpxU1FhUBf5/vNh2bAa26wCGm0IQkNoOJGCEMgMTFixfe0W2P3X+UDK8MHv8Gifb1D1iykYUkdZ0VMaGgNMJh6W9NApz04NjEYTDVQSDHqdomALhw121oukWDz8/td4/YV38NZ9RqyfNAe72Ae/cMF1ga6vRXhUNMWig1ZJVsDldND/DCPaPzMUXc1EAOJ/xbfzzsJ1dB7i6zyCNuyg44rSqQBcYfrCfhDfPdoH31T9AlOG1KGSXy0kxD78Pr5+/QW889Z9MK6fhDm7LCQzkl0ZCWvDoxBNVafzCZiy54TDJ+BikPJ98LtH0eebqvhiyhCcawJXKWNj+2cwtKsZGk88fv12Hs66jmJefB084qu4a5//czCiYf/vsPnAGox5tgeqKW8dZOTt+hZPj1iM0jPlJOgNnB8txc3rzwQcNhv9fzlcrL8Y0LxtM5iIAKev+Qj3tLsNX0l34KGa59W0pIcvWWrzvL5LOGCzUarXrN+UhcvI5RqlbWjeFs1MpGSnr8FH97TDbV9JuOOhmuVq65LeQBJksRC5VMRiA4vl6tpgOetCxQ0DVW9Rcb1DJW4qKgzqm6t/MHJ+w7gpp2ApLISLlR560ClOCUlJ458Mh91Wam0IHDsw5pl3MP/kYfzw2gdY9yfWgfjSkBDTdRCe6GrBd/ffjfFyUzS+And6oiijBG3tgXimLymJcg6WjpuIGdNPo+GDDf2K4J9L58/jStJ3YMeYZ/DO/JM4/MNr+OASQvakbMHcmWsQf97yN12JPivFdMWgJ7rC8t39uHu8jKaNr8AzX0kB++HYMQbPvDMfJw//gNc+WFeC4FyljLW1MfCZvkS4ZOQsHYeJM6bjdMMH0dCvN1/r/CvwHMHPk/4A2/cMVW7Cc+PW4PDOaXi2De8N5sXZjWtx4BJkkyEuFndJXLS/6ND0lR8xpl99mDUC7rPr8fnD9+GDbRdbfFYEoqxKsteu35RCueRybdLWNX0FP47ph/pmosHus1j/+cO474NtuJwEygRF6ov2avJ2tXWh4nqFqreouN6hEjcVFQKv1wtJknBNPHmpuM4gI2XedGyXYhBVrw5iWUn2euBm7Ue2w66YKSTE1aqFUi46TO3x6rwJGFhDC/vekRg0bBZS/pSHcCf2fdUXXR/9CvF3jMVPQxuR8uQ/dcWIwN3P9UddnYBj22d4K7497q9eNDxey3SuBleSvgntX52HCQNrQGvfi5GDhmFWWUL2JmDswFvwUL/b8fCn+4lgk/KqXCYhLCLinOXCue8r9O36KL6KvwNjfxqKRn+y4Kb2r2LehIGoobVj78hBGDYrhVoT4+plHHH3c+hfVwfh2IbP3opH+/urn3uwXev8++BC4rypWJbj/0kIatwP3/76BjoYNNAEhyD0WjxZL9pfZGSkmfHwlC1YM/pRNFSm8+3HbwsPKLddHhXVnssjl2uTtpyRBvPDU7BlzWg82tA3/XX/bwtxgN8USWzVvBpcTd7+bF2ouN5wozsn4acvj+du+t8tnPDILnjdMrwuAdlN50k3k+V8OJCFDNjhcrggch1wOmScFYKCE05PHoSzgD5dsMmC7qWWzm9kbF4ITz68IgcOrxN2J6VFz3vhKSDBOZj1UrDT86XQ9+n2UlAyRAnz4KV8oaDiz0AlbioqBOp0gxscHu85D3duZ2nzgefMXLz52W6YKxtg7DYYA5sa6aJ0pKTQHXI60jMFNMam6DegM+gMHfNb4egTMffgq3FPop7Oi8QZL+H5XxJ96XhlnwJPg7vM1/Ed/vFd9jEK/3G+hB5AfM61DT9N2IBsoUW1+vWhT0lAkjKHkq6lh5MPFJ9yiIkJf+GHFv8ujq8Ips5P48kOAaT0BaPXg/cgtmh0LFc6F4dXLs5LWZefy4egvPEn/VY+qdwklissJ98bg3u+Gocn6+ngTZyBl57/BYnnp6sxIdBM/VMTiboNYyE5bHBwBFIYOnRv7as3UsS3/TQBG7IFtNXqo74+BQlJdn9dFrcP2ZcwBOWXv3mLBewrh/LVdw2firnnK4x7sh503kTMeOl5/MKZK08Zz5dLEUyd8fSTHZQ1ksG9HsQ9xRV3zfJ/PuT0WXjztbk4U8KkrDGaYNKGouuAR9BYGfqK6qSo7RXnu7jt0TX+r6L4pD+P9LvM/uLB8Ulv4+u9RNL/PQ2rRt2JMEmP2LhY5fZz95MS5kvW366K0rrG/aYkLisX+dqk7Tk+CW9/vZe47b8xbdUo3BkmQR8b5+uzxgBKjxoDKaB2mwfpW7fgGOXn/HqWS8hb+XZV/fwydaHihsONr7tQm6Vnica3GpR+OSAkO2TJA1lDfUnjb++C+gyNEVoKvC+hRJ9G4YFO+c6v7jTKMUnjhtBSB2KRcJAofopHQ5+S/xh7y5C1FC8dFxrqt9z96LyQ6DcFSJwiB19/UvHnoBI3FRUCdbrBjQoPzmydh0nfLcUpRfnyIn7WCDz90mt47bVX8PwT96JD+/6YmhiBuCo0Yhs7YMTkr/FQrWP4+YNvMeWbTzDjTF30GzMVb7c3AIUHMWfhHlj5WeLcj8WzDkJqcy9urk0PBm8aFrzSH8NnrcCC37Yji8d172H8PmsXjmyYh3UK2yCFde0srNm/BZMXHvC9r8vegYXLTsKprY4mDUJpEHNhzfsP49U/YtGtbbDywFo3+m0sTivAoXkLsauQE3dj/9I52LVzNpYor+UFcnctxJJj/BrRD209DHqmN6Jr3odBd4T6DxIum47yGLwQ3iRsm/cDJiw5qeQb3jNY8f0EzNmU4Hd/T4cSV+OnZceolPQ9eQNmLfoDSycvx3E+IKdh8+wlOOq4XPr5ODhnIfb4hIz9i2fhoNQG995cG1qKOW3BK+g//DccLzl7S6qMx7/8FoOaVaJsrcLUr6Zjh6YyurwwCV8+FOG/SIvqTRoo1iPXmvfx8Kt/ILZbWwTTQ9m9bjTeXpwGy6F5WLirkKQp4N6/FHN27cTsJf56yt2FhUuO4ezBOVi4x6pc49y/GLMOSmhz783wNYEFeKX/cPx2KvbSZUxOwJrz5WJVMknQot6gZ9A7uibuG3QHimvu2uS/RAs5BymmLTrq5+L5R57FB+OnYfbUr/DsvyZD/8p0TH2xEaVswaG5C7CzqO0tmU1tbzoW7iUliP4Kdi/BoqOFSFz9E5Yd87Xz5A2zsHTX9sv3l99OwqBLwbRXhuCtcb9iwZYUBHZ6De/0rwYqEOYu2AlfsvuxZPYu7Jy+EHvZHC4KsHvJIhx1XuN+UwKXlcs16rNSkA4p017BkLfG4dcFW5AS2AmvvdMfyp725l545P6apIRmYsZT7fHUaoHQY3OxYGdRPS/BbKrn6Qv3KrMERMFuLFl0FLar6ucSgi5WFypuSNzougsNbyBuRsFH3oTGDq9kI+JWRN5oCNXwKk89ETff9fyfltq9kYKJ+ogkUfklI/VXDXRE3KBx0W9B99MwpBA/ipuOa4iQyRKlotHQcT4vKC2Jvuso8CcdU8giETj6U3FtoOHtAEwmEyZNmuQ/pELFn0dubi7q1KmDnJwS82ZU/HPhycHxnXuRaAtCndZtUDusaLJdBcORir3bTkLboCOaVWKiGI+tO1IQ2qITGkXy68Arg3xmLF74oR1Gvt9ecWBwDtc4nStGRaXvzUfC7t04XmBEtSat0bjS+fvPOZC6dxtOahugI5E8AwoRv3UHUkJboFOjSOUF7DXDnymjfAZjX/gB7Ua+D35fUIyKyL8FKUkuVK4WAcmVieN7DiLRakaNlq1QP6JU4hUGa2oKnLHhcBzYjiP2qmjdvi7Cr6TLVUh7KqdcrkXa1lSkOGMR7jiA7UfsqNq6PeqWEkAhErbtQnJgI3RoGlu6L18KV5G3P10XKq4rxMXFYfv27crnDQniRz4LsZuIkw1CchJxYnoWAI1gD7p6v9XZQ/RLRoDHAI2TSJjBDY/OBQ+RLkkOJp6mIWLmIJZgofv4jUgY3cO2uTw6ZqVvgZRWKF2vpWAlgieI/Gkpbia97P+Z05QhcaD0Jd6Mg34R46PjKq4GLVq0wJAhQ1TipqJikJGRgaZNmyqfKlRcz7DuGIsXv4rHrR9/gvarPsLS7u9gWANV87ruYd2BsS9+hfhbP8Yn7Vfho6Xd8c6wBqQyqFChQsXVITY2FgcOHEBMTIz/yA0GxVhNtEkjwyvZibw5AUkLr6wl8sTEjQmUTMELu7BDLwKg93iJcGUS37ID+hC4vZEK2dJ4M1GQfQJB5ggYzNWJdOkpnmxo5ELARTTNEA233gyHxg6T5IGW0pBFIN1vgKTj+R4uaCUibjKlKevpu8RZUXGVKCJuTKNVqLjmUKdKqrgx4MGJRd9jyqwxGDV2LMantMLD9dQny40Az4lF+H7KLIwZNRZjx6eg1cP1VNKmQoWKP4Ub3TkJg53CCbaYgciSxgRBhEoLHf0RifJaoHER+SJSZtAUQOagz0fO2X3IjN8AjTUBGk8WZFca4DiJ3DPrkZe8FcJykshaGrTudPq9B5knN8GdfRQ6+q1HHsWbCVv2SQh7FgzCQSTRCR2RRiFsRBydRASJSHrU6ZLXAipxU1EhUJ2TqLgxoEPz50bhyxcGoKkxAo+8cq+yl5eK6x+65s9h1JcvYEBTIyIeeQX3qhWnQoWKP4l/hHMSZZGbm0iTh4IX7IBHeBzwOLMBbwZSEzYQydoLrSeZSFoK4DkNe9Z2uNM3wZ64FnrHKeidJ+FIXYtA5z64c7bBlb8HkucU7Dl74MjcAalwP0TBPkjuE0TSEuHO24dcInj2nKOQ5Cx6svIymSzKTSY8lKYs8qHV+daqqvhzUKdKqqgQnDp1CrfffjtOnjzpP6JChQoVKlSoUHH9IiAgQFmjz3rx9YYiBx/KhhfKVyZp51Mh+uV1QCN54Gay5vVAbzBCQ5+yOw8eRxKO7v0dAUYP4mrURUBYNciOHJw9sAAhMpEsOQwBcd2JvAoUJq9CkCED+e4gSEGNEBJbB3nZpwBLKgKhh2SMhbF6I+QRz3VlnCZy54aJrouo2gIwmSH0bmRbiLx59QgPqgmDLgaSNoTyWPY6t6LS+VD6VymIEkfLjuofCXWqpIoKxT9huoEKFSpUqFCh4v8PrmeLmyy88MpuyLJX2T6Eg1d2wS074OLgpXN8jH2TOO3wFiQj7/QO2DL20bUpgJQNW2EignX50FtPo+DkZnhTtsCZugMGVx60MpE8kQ9n+ia4zm6GzpVBJNALk9YNrSsR1tSt0BHx08NCtKoAHncK3NkH4KQ0hOUMXVcA4UqGcMQD9hMoTN2GguTdsOYkwCssoJwqe/wK4YJHFNCxXAiZgofuczvh9XjhpPNOZbsWdp1SHBTLoRJkfyBix+H/IVTipqJCoE6VVKFChQoVKlTcKBBEBHivwOtVd2FPkDI7GxFuaIRH+eSttl2wwqshMkVkyO3IhUe203cbZFsarCk7kHp4GQrObqPLE6D1pMLoTEOYnAmTMwmOlO1wpR+AUSKCpDEoG3YbxFl4rMkwmgLh8piJDFLiROwMcg6EPQ8BRrpOIyDpPbBkJiCM0g2ifGkpH5InC978E7Cn7ARyjiHYnQ6dPRUabzbxrSwiHZmwEmnMtyQS2cyH0LioLLJiERSUtuB1cRIRUCqZz8LI23D4AtUOlZm/M2njz/+fUImbigqB6pxEhQoVKlSoUHGjgPWW6/mFs0SEReLNtXn9Gu/JJslw83c44XHnwJJ7HDqRDK32LIQ2g8hNChGydBg98cg6sRK5R1fAm7EbZm8yApBFOloBvN4saKVCSFon3B47dKS3udmZiSEEhRYBjTaAyJwMLR13ebzQGQwotNmhp0+7w4mAoEC6zwV4eR84NwK0brgt6UQaM2Dw5CAIRPS8RBZdiUTgDsKa+Tuy09ajMDeeCBtRM6+JyLIR0EiQJDskTS6V0UJl5TmQTFEoKNsR8O+ieZFE3Ig4/n+aJlkSKnFTUSFQLW4qVKhQoUKFihsF173eQlxFkolM8RRBDVvfKMCjEDm3LQvJx7cg9egfsGfvosKcAuzHYXAlINiThGgicZqcw9AUJiCACBJvuK0lomVgS5vXgYL8LFht+bDZLcjIykSBxQKt0YTMXLbgybDanUTcZDhcXjidvH5OwCsT2aX8uJnQaXQQ9CnxZt1EvAJMROL0Thg1BTCKbFjO7kZh2mY4sjZDch6BzptCBCQPXpFHhbJAaAqJh1mhFZw3nhJJh3ktm0LaOLDPYKKu7DGTSds5S9z/P6jETUWFQLW4qVChQoUKFSpuFFzveotG6CjoIROBEl438RYHJK8LBtkJMxEegzMThcm7kbZ/KfKOrYTIOoJATxZCUEifFhg9DuiIDDk9euQ7KOS4cDY1Hy67Bg6bBwadCRarDQFmIzwUX1ZuKrEELywWK2xWB+w2NwoKKE0pAJkZ+UTgZOTlW4js0XE7XecScGkl2DxOuAWRO8qj2+WEQcuOUTKh8WYgSCpAsLYAepFGZYmnUh2HLI6hIO8grHmpEA4ifzKX0w0hUxmV9Wz0j7lakYmN+RwH36//d7hqr5JEsq8/cOVSHcv8RkKhpLwJoVDmLfv2tfAq85dlr4Bep1fervBCSYvFgpycHKSlpSE5ORlJSUlITU1FcmoKWrZsiddff13pzPwmhuMqgtPpxNgxo7Fp0wZls8batWujcuXKyo77/BkdHY2goCAYDNQJvL5505y+JElKPC6XC0ajUckb50PSGgFq9OeDTheDkv+72LZUMh+Xwbp16/Duu+9i7dq1/iMqVKhQoUKFChXXJ7Kzs9GgQQNkZWX5j1xnIN1V9riUDbCd7hzSB4mI6UjndeXBU3AG6UfXI0BOJ66VD5POBb3XAaPGS9ez0w8BBxGibIsbGpMZNpsdoaT7Gww6ImsWBAUHki5cCJ1RC4fbAT0d5w2z2crGVi+DMRAF+XRPaBQyMrIREhoKu5Ov05LuSlqpxgBzWBisRCR1eglVKkUhLyMFkWEhcHk9cJIubjQGEMGU6LsBTn0gzNFVKA4mdxIclgCEh7egfDSAZAiDV8s6u0T6r554GpNprV8Z5gV3pAhTfBo6xuH/C4q8Sv6jiBuTIY+L5/9qqCFxBdNvjxtahQz5CBwTp1wiaYcPH8bx48cRH3+KPk8gPT1dcQFrt/OiTqEQKY2kw6uvvopnn32W4qDGSY34HMlSyJeM0aNHYdQ3I5VjTMz4OLuTDQkJQUREhDIINGnaFA0bNka9evWUY5wHvp7JIMfHBE5HRFKn53m+l2dHV8CfrimuhLitWrUKn376qfKpQoUKFSpUqFBxPYP1QH5Zz5/XI1jvlt12aHkvtvhtKMxJQnREKAIDeHvtfOQmbIPkTIZRtkAreNqiDsSZSB/W4XRiCvTmQLiJNDkonqjYyvDYrHBQiI6OItJWAJPJSHopkSEmTaSnanVM3DwwmoMg3KQAykZo9SZ43D63IXaXnYifFqlpyZBJX5ZJ/y302hBFpE1HlwuHA1UrV4bD64RkYnInEKgzEfUi4kaarGQikuiyQK81wCtHISyqM7SmxsQTQ8BcTVBeIQykV5voagOlyVMlOWWf6xLeVlwlbleA65W4yR4mXBrF5M1ky2dl8yIvLw/HTxzF1q1bsW3LNiQkxCuWNiZqCkkjwlRkDePvHoqH5+9OnPg9evfuXcpaVvQpUTpLlizGc88+XYLM+QTDcTD4GJOykNAw1KlTB23atEHnzp3RuHFjxRrHeSy+VqeQxfNRDi73l+BKiNvy5csxatQoLFu2zH9EhQoVKlSoUKHi+gTPuOrUqZMy6+p6BFuu3O5cBEjpOHtsFc7G7yMipIFREggJ1MBliYdRkwsjkRqnA/BKAcjItsDt8iIiPAweIloaSYaedH4XKbjm4BBFn9VoJKI/bGFj65YWXrcMoyGA7R1E4thaZ4NBZ6bfvLcdXSMZiAOwoxItXEzeiIB5KW9WlxUWrxUF9gLk5+YjKiQCoUGhcHrsMIUZYAw2Urys45pJv9ZRnKRvC5tiNXTKQQiIbgdNYBPImnAid8z8iLRpQ+ibmfLIs9P0vjVu54gb6eH/D4nb3zXr7irAhOjygUmQ4KmS9Mdm331792LK5Ml47dVX8Nwzz2LMt2OIvG3B2Yw0ZRGmoOYhcb0rO81zY/Aqn/ymITQ0FHXr1lXIGIciUlcUmKOxFc1HEH3WPL6GUUTg+Jjb7UJWZgY2b96ICePH4eWXXsSzRPZ+mPQ9Dh86qLzpKMo/E82Sgd8sFJ0rDtc/VOckKlSoUKFChYobBX+X3sIkROY/1vnY9z7pjazHer1Ccf7BeqTMViuNDZLORuctCCQOFWhwQudNh8Z9Gi5rPLQaK5EqAatbIM/uxcnkDHh1JoRGV4KbiJrRpEdUqBkBcCKaSBQ7OWFCxp4dC/I1SE91wFqgxfq1h7Bx3WGsXHEAhw4kQc+kyavHqSNnsWvrCXjtZiz5bSPij2XBIIUjO90GrWxASEAoooIiUKtKDdStUQvBAYFITUxCelIanBYXLNl5sDkL4dW4FfIheSTKPxFBD9vTqNzebDgKjiEnczfOpu1BTnY85c1G+jbrxj45QXgo36Rr+w78v8QNQ9yKKk2mCisK3MmYIPHO8ByY8bN5t7CgANu3bcGnH3+EF198AZ999gnWrFmNvLxceIhEaYiYsbWMpzoS/zoXdDqtEvg7x8MWsaioqHMduYiUFRE4zlE0nefpjww+5nt7oTmPwHGQodNKlEc3MjLSsY3I41dffYFnnnkan336ifLbUlgAr8dXBrfLRR2Vvf1QY6Y4zh2jzxsBXDeqcxIVKlSoUKFCxY2Av8s5Cc9gcxBp4820iRVRRlz0T4bdLcPm8ZJ+a4El9yhs2Xugc6dCuBwIMEXAoCf2psmjzzRokEwRuUmPDEBish0FNg9ioiNhNpBO6ilARKgJJr1BsV6ZAyrDmqeDLV2Pw1vzsGreSWxakYz4I6xHV8K27WdQp2FrtOl8EzZuOQBrIXugNFMIIeKWivWrErBvewF2bkzDsf0WrFh8AOvWnsSunWlIOGaB2xKEYEMswiMqo2HT5ggJj0Zelg2ZqRakJefAbnUiPz8fTo0XTlKVXRpJ2Y3OmZsAOXsftLY90DoPw6QhYsikjQieEFrF2QlvQK4hWfm8a/oF+P8MNw5x4z8iWvyNORMvmmRLVqGlQCE1TNpsNhu2bduK9979L57/9zD89NOPiD91Ei6nUyFqTKh4vZtCuqjCJfZg4udVbKHjT37LoZyj69i5CK9XO9+K5iNtyjelkzO542NFBK/oPH8W3Vt0jH8rxI++Ox0OJJ5OwLSpU/HvYcMwfPhwJf9Op4POc1q+sioETvYS8dNSubkcHF9xuB5xvXtnUqFChQoVKlSoKMLf9cKZNUIJOvqfdUjSGTUeaPSkBxqsELo0eDUnkJW/mYjRVBzdOxdpCSthLzgAnUTERusmQqWDXhOAvNx8pKUmITjIjIjwcGiJGAUYBEKCjKRISjDqI5CdacDvy5Ixe9oRJCU6IAkzcjKsMOkCkZWeBeGUEWw2wV5oI4JIepxWB+KQ8FDOqtapBjsRyRVr1qPvg72RlpWONZu2oGnLVjh+8iyMhgikJBXiuzG/YfmSHcg86yCdOwg1a9ZF/fr1EWgOhD3fjdSEs7AU2ElnZ0OKBkRNISQXZE0BKfd5MJKua9ZEwigHU6X4VrKxJs1bDkg8XVLmtW9GOvr/Z5pkSfhYxXUPH4GR6D/+ZBLjcvvImMGgh4dY+OFDh/D+++8phG3B/N+Qk50Fs8mEAKNRKaQvKEsb6RuzneKjZQVuJuwdktf/MZhsFRG3kuBOzh4k+RwHboRlXVeUdlFgYqbXaSlwZ4WS32VLeb3cM/j4ow+xd+8eInZ2aqC+6ZIyEVP+VKyKFH3JcD1CnSqpQoUKFSpUqLhR8HfqLawJ8ootYmykMPI6MtJ3ZSJlwkUEzYvw0BAYYYE3/wCyk9YgK3ktZEeisp5NOI1ITSyA0+5CXNUwBAYbYCKdNdQchCBTKMVjJELnwO5daUhOAgxSVThsJjRt0hKVYuOIRFnRtXMn1KxajYhXIurWjMO6VYuxbcNK9OjeHqYgA5FIplf5aNo6Aj1uq4da9UNg99oQFm2GyayFLByoU7se6jdoQbqrCQ3rtUV6sgOLF+xBfq4LXo+WCBydr1kfwiEjPzMPttw80mlJn3fZKH5ih3o3PBorZI8NetJ9TVon4E2j36epbhKJ4GVSKIRH2IiHkm58nRouKhrMUm4IMFkrmgrJRE4JVGkZGRkYO3YMnn3uGcybOxfZRICYODGpY4+SfJ9y7Tmmwz/pRkFM/RJBo9GiSpU4JS6enljkwKQsMMHjdW58zUVxLn1fKMoXZZN++r6ztS8/Lw+//DIFL7/0Er6bMJ46WRI1eLfSPrnsRQTyvOiuO6gWNxUqVKhQoULFjYK/T2+RwZthK2u5JB2pqEYiWwHQuokUecIBSygCNXUQrotFCBG5QG8uDN4cmDRuYptAVqoNHqcegQFm0outMOtIt5S10IkQIkha5KQZ4bFFYMfm06hWpTZatW2BoDA9UlJPISIqAC3bNMSuPRsQFu5GvTqBuPfuVnhmaF/cd3cn1K4WiCCjDL1UCIMuE336NMYdvesiKDgbTw/tjj53NCWZWdC+fV2YAl3Yt3cXWrVqTCSuMV0fjUP7ExGgr0zkUIdTx5JhNunRsH4thAeZkZKYhKTTZ5CVmQvelg4aHUmCjR8F0GoSqD52o7CQlzn9gbNnf0dBwV66KAOSzkok0kLXskHj/x+uS+JWkowUf/dZsrxEeHjqYGFhAf5Y9TtGvPUGJn0/UZly6HLameFBeH3BZ6ErIlsXZzfFZ3zX8m+eRhkTE0XfeM0aLxLlVsWkkeImolUUtDodKlWqrOzVxvvHMYry7oPPEnc+tBQ//zFZ07E3SSVttqzx/F2hlGf8uHF4753/4o+VKxWXrUXkjeEjb5yXovjLCn8fVIubChUqVKhQoeJGwd+pt8huJ2SPW/H2yMHjcRB5y4dkS4XWSWTFnonYkCDoSc1l9yJ6D+mcDg0yUnPhcgEhwREwm4MRGBRMuqKW9EgTNq05hHW/n8TS344hNcGJ6lVrY9PW1TCaU9ChawRszjP0vRCdu1TDzbc2Qt0GwTAE5KLAcgJ5BSeQkXUI+fkJyEw9TOEQcrIonjO7kHP2AKx5x2HSZROpy0edmiY0bxUNjeEsatYzok27mqQzF2LZ8lWoXKkSfpv7Bxb+tgNbN5+g43boDUCNmtVQu1YdpKfmID/XgfwcKr8rAILIqkYwIcuAy3ESHtdRInUnSWfORIBBViyTbFhRtgcgNbdYB/7/A23z5s3f44Z69913+w+VD3+FmIo4l1I5RHA81KnYmJyXm4cfvp+EH3/4CQf37Yfb6VIYqN6/fo1NzHxzMWnjz+Kg5J0vYas0fXKlMzkrOsaEiDcfvOP22xAREYbExNMKkTpx4hji40/iTGIi0tJSkZeXAxflKSszB+vXbaCO5tvgm12rcry+9H2SUkzgJfKgJESffK3vsyhf1AiZLEqS4nAlMSkJ+w8eRH6hBQ0bNUKA2ayko0wVpfKyFyJORllLVyJ6H859uSZQilNObNu2TdnE8q677vIfUaFChQoVKlSouD5x+vRprFmzBk888YT/yF8F0kG9XghJDy/pWV6NlUhLIg7unANL+lo4crfA49gPONIgW+3QCg2RPN53LgtOh4yY2MoIi46ApNcS0dHAYzdj07oE5GVrcPtt96BenUbYtWM3EbSGpEueQI1aGkTFeBAVG0j6ZAHpkg7kFpwhIpcOt5wD6KzQ6DyKm38dkSWTSUOfGgQFBcBkNiIgwET6oBd2pxU2KxGv/HQ4QSTT4ERkVAjCwsxweWykx3pw+x03w2DU48jRQ+h7980ICeNZY1rIXhMM+mCEh0UhJS0NvOdcQAATx2BoSRY8PVTRayW+NoCujUGguSa0UgwJKIhExtsDsP7MuqlPOS3W+f+ZmDBhAlq3bn197uNWRJ65DhTSRv/5vEECBw4cwPfff4/FixZQg/MQCwdVqF55U2LQ68qVL2WmJH/6E+LGUeQNkgN/53PsLZI3x+a4GUXX8Dmn0wkzkSh+s2E2Byn7xPG17G6V86XwKOVaX1wSJ3oeSjcyAS9fy9sSKNnyNUiljFoDDAYDbrvtNjz51FNo1qyFci2b9Dlv7ECldFwEJY4L0/wzYD5cXnz77bdEdE9g9OjR/iMqVKhQoUKFChXXJ5i0/e9//8Pq1av9R/4i8HIZpwNenQ4uUh69ogB6dyLSjiyHNWkdArQ5MOqdcDuI0MgmIi5aZGVmk07qQVh4CBG3SrDm26HThuDo4UQUZMlo1qgNFsxfiVZtWsFakA0hF+Km7k2JTGXBK2cTyXLDZneS3ipIxzTCQ3F54YLQuqA3SAqJ0sCoLAOStLwvnBfmwDDSfUlHJZLF+qVXmXlGOqpBC4fXgbz8PDquJ4IXjdDgaNLHA4h06bFx40FEE7Fs1Kg+jAEyduw4iNMJmahVtw5atKyLQkcm4hMPITI6DBGREQgLDSEN2AO3cMLD0yelSBiDGsBobgyNvjJkBACUZ2jCKPj8UJTUgS/Qh/8huOH2ceMpiUePHsUHH3yA+fPnKxVjNPoaFRMjduNfRMQuB76Mry0rFIHjz87ORk5OjkLSODBJcjgcCpliIuVwOBWPkrVq1UJwcLCy6zyfuwAXSe8CUJqcbsnApIwjYFLIm1l/8vEnOEJy4HJzWkzeyozrb8bfOeVAhQoVKlSoUKHiSvB36S2kESrOPWResMZGJiIrWpgQFVIJBpcZGosRmoIAGASd1FmQb8uExWFDIJG2gDAj7O58drmIQ4fO4Gwy6ca6asjMdqJrt3ZISNiDoLBctO8SC402HV5PPjwuDwpzrPC4rZDYmyOc0Ok1CIsIRVR0NPRGM4yBobC5iZjpTSigTxulLfTByLNrYAiKhWwIhTAEQhcSTp9GGE2BqFQpTiFoHm8e0jOPwuqIJ/qVhq7dq6FRE7YIOpAQn4v1a+NRt3ZbpKcUYtXKbQgkklitSmW4HPmw5KeR3p1K3FCmwPssu6CVbBCeTFgLj6GgYB8KLLuo/PuIOOaT/iuz9Eh+vk9ecqQo3Rz8H/803DDEjUlMZGQkevbsiWrVqp0jbHRGcQpyJdylyKJWRI589xdHUHTcYDAhMDCICGIAkTJfCA4OIbLEpuJAaqAxeGroUDRs2BCPPvooEbjaSr6uFpTkubSLApNDBlsFufydO3dGTGyMQtj4GK/Fu6RTlL8JRaRShQoVKlSoUKHiekfF6C1FZOIiUFRPJkUm0kM1kHjTbbsTwquHMagSAsKrwiNI39N4iczJyp5qWVn5CDKHIjIkFmZtJDSOIDhyArBh+QkY5Vg4LaQXku7odqah950N0bxZCMzGfPqdRcnRca8NHg196t3QhugpjWBozCEocOiJaEUgMckCu0uLjIxsFBYWooBIXs7ZPFjz7Eg9nQaXxY2EEykUXwBsdpNyj6QPgdBoYTAaEE6EMio6BBZLJgrykyHkfAQYiIBpKF57NqKjQlEltiaqVW6CU8dzle0IwsIjKUQhJzsfuXmZyMpNJcJmgNZjhJYItew4Q4RzH9yu/bAUniQi56Cy2OCFhdJ3wKtxUaAyCSsROp9HduEmKucqkvE/B9fNVEl27MFEhSVckoQxoWKipXiJdLuo0u3YtGkTvh39DY4fPw4vT6Gk6/hWdtyhkS4kTkxsit6icMcUdLFOr1OmOubm5vo7KhM1A0JCghETE0Of1LCqxCnTJcPDw5U4mDgx2BIXEhICq9WK9u06YPbsOee2BJg9Z6aysaDFUkhX+rxbMoSneJolE66i74yicvP0R2r3/JXOFZ1ny6IJdevWw7Bhw3BTt24wE5nkNXAMJopFcXEoms4pkRyUfequIa5kquRHH32k7KvHn38L5BzsWzwf649nwEKdtwg8J1rSByA0uhoatOmCzk1iYOAT3iRsmrUUO87kwl6ycSuy1EFvCkRoVBzqtuiAjk1iYfSfZsip2zBv2TbEZ/KA4T9I9aY1R6Jqy3aon74OqxNogClxTjJHoVH3+3BXy0jf2xPK7555v2LVSXZ1S1foK6FL/0G4qXLpOrSs+x5zwwZjUIuy3gracOyPeVizLxl5Tn6H5weXQWeEOSQKcXWbo2PHFqhi9p+7LCxY9/1chA0ehDKTpGEzadMsLN1xBrl2fuNVBI3SRnX0MAoM5XRboEPHJogtKbhzKMSR+RMwfvZWpIpAeiBFoWmfwRhyT3Vsn7sBrR68C1EZ2/Hbkq2KjFk+Pvhl3OoW3F0lAfNX7UNKnqPE2ER9OqQS6nXpjbbODVi2LR6ZVhrM/We5s5kjq6J1t5YoXLMM+/Nc1IeUE9DGdMbjg7uh0jnx23B0xQz8vj8DVsqARjIhqv096GPeffF4b30EN9W8+IscOXc/li/ZgmMpuXCUaHMafTBi63bCnXe3QcxluzDJf/McrNiRiCxb6TwERlVFoy59cWujYP/BawNrwhrMmDIfmw8nINURjKpVo1Gpfifcfved6Fw9GZN/SMQjQ29H6SZmQ8Lq6fhl3mrsis+HFGCAxwlENmiHnvcOwKM3VSvVp7xJmzFnxQ4kZpXuN9rAKFRt1AV9b22EC0pFfXjznBXYkZgFW/FNJIpARFVthC59b8WFopCRunUulm5LKC2/MiEhtuu/8K+bYst44+lF5r7FmDPvd2w6kAILtY8AHbW/6Ebods8jeLBXPRTMHYMNbYbhsdqaa5RmGbAlYPX0XzBv9S7E50ukLHlITYtEg3Y9ce+AR3FTtRJSljOwa+FibD5BY2RxpyobGhMa3/c87mlQehCQU7di7tJtSChVT2VDiu2Kf/3rJsS6jmHpz4uvor/dhyd71vSf98ObSeP8HMz7fRMOpFggmQKg0xgQ3agb7nnkQfSqV4C5YzagzbDHUFuTim3zlmFbfCaspdqHGZFVW2Ngm0L8vHg/8lz+sZP6UEznxzG4W6Vi2duOYsWM37GfFE0PK9mmKLS/53YE7FqBbQml212ZkGLR9V//AlXnVbUBkbQJs5buwJlceykdTHmu6fQwBYYiKq4uWnToiCYlB1v50mV/6v6Yv6dOrv49d4VgwYIF+PHHH5XPa4ci0naRHkzyZkuR22Ml/c0OS0EGvM6zROCyoHMRSUo/BPvZ4wjSOmB3FCDLQkTFpUHtmg2IyBmJ5AEFeW4U5mlgL9Rj+eLN9KxtCKvtJHre3AAB5kJIWrtiZeNpjHaXC063HaGRNBiSXpNvsVH7oZionpKT01C3Xm2kJCcjmvRd9n6uoXalMZjgdrhhoPZiKbCRThyJ4ydPIKpSDNKyMhAWHY7IMNKJC/MRUzmSxnYb6dlENEl3shMJzcu2IDwsGkHB4XB6dPh9xRFoPGGIP5WODp3boHbdaGQVxKN6zXC6vgCnU48jKjac8lAVITw905UPXYAXHoMWTpn0cG09BIW2gWSMg5BCqbkaSIZaRY7sZpMlLRHZ1XgN0MikIxvoiKJn39gomioJJm70hXT+K4NXvjbBQ/+5PV76Livffb99x4rOOV0e4XS6hNvtFkTcBBECsW/vbvHSi8+L5k0aihpxlUTVStGiZlysqFY5psxQvUqsqBITqXyvQtd26thW9L3rDlGjehVRKTZS3HXn7WLsmG/Ejz98J5YuWSBefeVF8fXIL8XM6dPFr1Onildffll8/dVX4v133xXPDxsmfv7xRzHs2WfFyhW/i5deeFGs+WO1mPbLVLF40QLxyccfitdefUnc3be3aNK4PqUXJWpWrSwqRYWfy0dcbFSpvNWgvNeoVklUqhQmSBESVSpHicqVIkX9erXEC88PE/v37RFWSwHJwS4cTqdwul3C5XErwe31CIfLqXznT5vDrsiO/l3TcCV4l+TE4e9GwYZXRVO98lwU0LcRr/62Svw2/mXRs4qe+LtRxHV7Scw+5fRf7REpk+8X0ZLveo35ZvHRui1i4+qF4ucPB4iWYRI9rQyiUufnxaxTbv89fnjPivmDayqbSfC9UuxDYlqa13fOnSoWPtNIGIhfK/mQosRjcwp950rBInaMaC2McfeK8QfKOO9NFhP7hItqQxaJAv+hsuA4NlL0CmJvO5SWxixu/nC1WLt8rpj0Xn/RKlwrdKH1Re/XfhUHy8rCefAmTxR9wquJIYsulSJJLmWyuD+a5FOU5kfrxJaNq8XCnz8UA1qGCQkaYajUWTw/65QoJTlvulj8YksRFtdXjNqRI1hinpz9YubwXqJe1TgR3eNLccrju1R4s8TiJ2sLUh19Mo6+X0xOKTpJcJ4Uo28NIXXKd17f5FWxsUQZvWfni8E1tb480rAe+9A0UVRFwn5C/DKgbqk6unXUQeHwny5C3o73ROew5uKVtdlKXhmXjPeycIv48X0Er9dW7tc1EC+syfOfKz88aTPEY3FFedCKuIFzREa581A+eLO3ijGD2ogovSRCmvYTny89IQqVNBwidfMPYljXWiKuaqQI6ftTqfbpzVgnPu5bS5g1WhHb6x2xNN6qHHecXiU+vCNO6KRAUffez8SGrPMy7EkTMx6LO9entHEDxZzLFsoj0mY8JuL4Gc73aePEwDkZ5+rqYvBmLBRDauv88tOLJs/NEpu2bBGbN6wRS2eNE2890ESESnrR/O3dpdsvwZuzVYzu31xE6HQitsdwMWNflv8au0jZ8osYfltNERZTRYSb24j39hff/WfSvBBekbHuY9G3lllotLGi1ztLhU/MDnF61YfijjidkALrins/2yDOF3POqmGC+JgvH7o6YvDkjWLLls1iw9qVYv7Pn4lne1YTRilM9Jvtq7cL4M0QC4cU90t9k+fErE1bxJbNG8SapbPEuLceEE1CSY1q/rbYXVSQP9HffPCKnK2jRf/mEUKnixU9hs8Q+7L8kdtTxJZfhovbaoaJmCrhwtzmPVEsdq84O3+wqFnUPqRY8dC0tHNx20/8IgbUNZwbQ6SoW8WogxfkSux4r7MIa/6KWJtddCfJf+EQUbtIjvom4rlZm3xyXLNUzBr3lnigSaiQ9M3F2+eEwKK7ijbgSRGT74/mSXN0j0aYb/5IrNuyUaxe+LP4cACNpTSWaAyVROfnZ4nSj6lLl/3vq5PrB3PmzBEPPPCA/9e1AitPl1KgZCHLpOO6s0m3PSL27hgr1i4aLLYvuFMcmn+TODW7nUib2UnkzOwuDo1rIDZ/EyNO/tpIFPx+s0iffYs4PPZmMeaeKPFFr0iRNOFfYs9Ht4o5T0aL7BldhXNxR2Ff0Ejk/FpVFMyqJ5ImVRO5M5sKy4JWInNWY5E2p71IndtWHPqhqshf3pLaR32Rt6ylsP7eTdhX9BEFi/uK7GUPiKTl94u0lQ+ItKX3ioLVD4v8VfcI+/p7hX0jXbO+h8hc1UHsn9pEbJ3YQGSvv0Ok/d5FOHb2FpZtt4iCrbeKgi13iCMzW4j0lT2FZffdInVNH/HH6DZi5OCqYt+vw8QXA5uI13qHiG1T7hWFu58X++ffKrbO6CxO/N5XuOKfF4WHHhSOeEov+RGRk/hvYc+aJLyWrcJjPyI8rmTh9eQTP3AIh5v0Y7lQOEWOcMmZwi1nkS7MT6PSLfVGRfPmzcWoUaO4718fYIub2+1RPtlq5HK5QWSNztD4Ifne3vM6s6IpknXq1MGIESPw4osvoUqVKooVi8HnSgZG0VRCXhPH1qigoEDF2tasWTPlXr6OrUNsWVuxYoXiDfHMmTNo1rQFAgLMiImJhV5voGvsSv66d++B5OQUZGRkIiEhQYlr3759OHnyJLZv36445ahRowaGDh2KN974Dx599BFlOiWvV+N8chmK8lsSRfOrlSmQFHh/uOHDh1Mcb6BevXqKZVB5s8byoHIUlZHlxYHX3/FvnZaeHv6y/11gy+b1MFUyuFUL1GEPNgxNEKq27ol7nxmJuWP6obLkRMr6UXj8wf9hmzIjVYuYFk1BSp8PUhhqte2ILj37YtCIyVgy8i5EaFxI3zwGg/t9in0llzNKUWjZrDrF4IO2alM0j/LXsa4y+n7yFf5Vy7fZOuRcbPljK6zKyZKQkZou4YEvx2Fo0yD/sWJ49k/E+JV5SJ4zDtOTLj71wlijBRoVpQ0JYbU7oPvt92PIu1OxZtFwtHCfwLIvB6Drbf/FutxLTOGAB/snjsfKvGTMGTcdl0gS2pgWaFosOITVaouOXXqi76ARmLxkJO6K0MCVvhljBvfDpyUEZ1nxXzw35iCiHnwdz7QNV96UacOb4eHPFmDqk9Xg5sXTvksp2nC0bF7j3HtLbRzJOKYoTYKhGlo0jvHXgQbaOs3RooQYpaiWaFb9XA2hatPmOCcmU130++8QtC4yKMhZWPVmf4xYk+s/4ENo897o3qYjbu4QcS4fl4z3stAhrkVjxJ4rVG00axHq/1F+aKNbomnVczlCDRq7Isqdh8tDzl6F/9x2G16YvBv5tZ/Cr39Mxeu8l4+ShhGVOz2BMUt/xZC4EvVF4Ptev+1OjFiUAGe1gZgw4130ruWzxRlr3IwR07/DoGoOnJz/Bvrc/iZKiVsbjZZNqxbLuUZTtLhsobSIbtkUxaKogaYtiuvqYpAiqf1WL74qoHITdOjYEZ269kDvh57FR3PWY/qTtai2SkNOW4yXet6Kl6YdgK3pq5iz8DM80jzSf50JVToOwGdL12JinyBYfT6uzuFq07wQMrJXvY7b7hyBRQlOVBs4ATPe7Q2fmI2ocfMITP9uEKo5TmL+G31w+5trUFLM4TRG1jrXjUyIbdgOHTt2Qtfut+CeQcMxbuU6jLkr2jd2lQUpEi2aVi+WcUBlNOnQER07dUWP3g/h2Y/mYP30J0HDXzH+RH/j8qYtfgk9b30J0w7Y0PTVOVj42SNoHumPzFQFHQd8hqVrJ6JPkJVXDZWAhKiWzVDcXauiafOoc3Gb6vbDf4e0PidzOWsV3uw/onS7RCia9+6ONh1vRodz7VFCJD07iqszAJWbdPDJsUdvPPTsR5izfjqeLCWEq2wD2hiSd9y5Z40UVgttO3ZBz76DMGLyEoy8KwIaVzo2jxmMfp/uo1G8CJcu+99XJ9cPWAe79noL95yi3sN6GT9ISwa2uMrwUL1o9QJxlYIQLOUjCFkwy5kI0Fih18mw2O2w2ty+KZKREaRjOUkndWHH5iNo1fQmOKxGLFq8HDn5R9HrjloICC6Ey5MDt8cOvdEAi9WG0LBQ6Iw62N0OOGUXMrMSER5G43d0NLReE4J0VaD3VEfaiQCsXZKOuZNP4udv92Ly6J2YQmH693sw9bvtWPbbcRzcWQhbdgS0zqowS7VRpxrpWrWaICMlFynJmfBSw3O7vZQ2L+sRqFYzDvkFWcjJTkVQiEC7TrXwwKM9MHfWEtgtXtx/z0Ds3nYCWWfzUaNaTchuGYX5hXAWWkhnNpIer4XHLcGk00OvdZBEMylkQNJkkT5sp08ZGt6DWRgg06eXZOrVuCFLbpLv36sPX2sU97u/GUw0mIxoSclmAsImWoNBR5XlO87TIHlKJ3csBhMcnq748MMP44svviAy1U05fj6Y0DBR4k92INK7d288PfRpxUMjEzeOgwldcnKyQrruuOMOhcwx2WPPQuwels3mnHZBQQHi4+MxZswYZVolT4/k81u3blXOc5x8TY8ePZT0mHwtXbqMrquCBx98EK+//jq6deuG0NDQc+UoCZlkwOky6enatSu++uorPPLII4j1r2ljFJHYIhQRNK+HzdK+EZnTvvhT9q9BEQn926EQXf/3Egjv0Q0tdSwkAfuBmZix3a9u0sVFz7XSkFCp9+1opRRJwLpnNuaUYm58a4k7Od2SdRB2O0a81RvhSl68SJz+JX45XXptovfkT/g591/44KHKZXTMfCz79kfsd9MQVPAHvvvhQIkH8vkou8yM0C5v4r1+/NCXkbf1UwwevqyUElcK+cvw7Y/74aY2VvDHd/jhwMVTVNIsW3CQKvXG7T7BQVj3YPacImXCie1LViKF2vzZfTsQXyr6ILR/7QMMqOKBq8SYW+qFBwn4/GKWPk958n/1oXQeuR+V6ib0O6znY7g7zkewhW0/Rj3+DKYmlqgniR4aJr3izbYYl4n3ciiVTy31Y//XKwK/DPJ/JZSSw5+FnIpZw/6Fr3cVKN697v7vB+hd1hzO4I5488uhaHBOFjlY8p+nMHqfhXqMHk0ffwF3RZ93H/WL5wc1p7MChbu/xtARK6ilF0NbulAX1HeZIAEWX0ffy3UTvwzzfy0FK+JPpVKPjcBtLz5RrNQyvPGY9NRgjN1XSHKJwj3/GY6uZc1K1dbAQ6PH4+l653eQq0izLOQswX+eGo19Fuoo+qZ4/IW7cKGYn8eg5vQMEYXY/fVQjFhRQsoXlasXafEJsGpr4bGn7ix+uVAG+BldFqzxp5BK3SfithfxxPkFoXSvpr954yfhqcFjsa+QnrFR9+A/w7teOG2WoK3xEEaPfxoXiJ3SLT7EU+FL512SwtDzsbsR538+2PaPwuPPTEXpbOlh0vNeUiVAMigdkx/WeJzyCQEvPlFMCn24ujZQ6llTElIl9L69lS8NYcWe2XPOe8F46bLz+b+lTq4T/FV6C2/jxEHQk5Cda3hkNz1n2cGGDqEhlREXWRt6VyD03kC6WAun144cZwa0Zg0qVWJDhU6ZspibZceJ4znYtf0AHrz/Vtx7X0d0uKkO6ad2Ijk20id5+Y0JeXkWBIUGQWvQwOYqRHpWOiJjIhBXLRouhwcBukpIOaXDkllnMPK91fhwxO+Y9tM+LF98CrvXn8XRtZnYv+osti1Lwer5iVgw9Qi++t8feGf4bPw4fhcO7SQ9qiAUwaYYVImphTo1G1K+EpT9lnk/OlnjpHw4Ua12HOn3XuTn5xGhEwgMlNGvfw881v8BzJs3j855kJqeTec8iK4UALs9BzlZvC4vEB5HADQyETiPFdbC48jN2YS83B3IztwHlz2Z+hERVGXs11PbZU+T7NiPP/9+A8K1RrkeaVcNVrguEaidUqPlwJYjthp5YLFYsGjRAvz004/IzcvlcYQaswwdDZKKu32/J0lWjHngMQUGonXbdvjs8y8x4PFBitLEc785CYXg0KgYFh6OHj174oP/fYjadetiz969iqMRM93b9aablDzYiSzm5OYiKSkZkydPQWZmBqbxWoF5s7F6zR+YOm0q5s6dg02bN+HUqZP4fuIELF+6CPPnz8XBw/sxZtxoTJ85DYcOHSQSmIRT8SeRkpqC+g3qIzIqEidPnUIQEce+d9+NTz//HLfdfjtCw9iVqQQvZZjoKemhrHzp0L//QHz22Wdo174DAsyBCpljMsZlYlLHGeZ97TjwQbYWTp48GdOmTVMIHI+4vKuA7PEJWCbyy5ZCpaAcCYE//F8rBNeLxe2iIOLN054VCJ47fnlpSIFmmIuesnSPzcFvy8oLCdUHvI1nmxmUB6Kctwqfffx7sZIqp2POx6vQ4q0nUaeMh5qcOB3fLc3zPSyFC/t+HodVFt+5K0Mwbrn/dsRyGsKD079+icnxJR7K5yATufwOS/N8yolw7cPP41bhqpKU2MJdpNQIOGzsPcv33e5w0v+ktK8bgTsf+gSrzvic8SgIvAkDBrZCsF/kfwW0Ve7DhCnPo2mAUmp4kufg+YGfYZfNd/7/I5xbRuL9eaxEUlWG9MQDd8Zc9MFh6vgYHmlJD1j67o2fgpHTE31rErWV0blH4zKsRzo0vKkDKint0Y1TU7++pDX5L4drN6ZM3gZuldoGj+O1frXOld2y4hN8uDxLacuaoK648/YI34myENwdL79wC8JKM/6ycYk0L4QX8VNGYnoiKYD0S1u5M3o0LkPx1DXETR0qKUq7cJ/C1K8vbUFXQGPSwsmLkE4Vb+r6DIZ2KHOB6iXgwu4pk32zGbQN8Phr/VDrvIJceX+zYMUnH2J5liJ1BHW9E5cW+8t44Zaw8160XA5aVLlvAqY83xS+bHmQPOd5DPxsF65mGHDtnoLJPiGgweOvod/5QigLV9QGSkJCIG9T5C+vcNhwRY8pwvVZJ38N/iq9pUjf5U/uw0Ljgex2QCOIdggzosLrw6SLg9sZDK0uGDmWAuQ5smEK1pKOJ6Mgx44AQwSCzMHo368vrNYc7Nm3FqHhAl53lkKWJA3pGsKIvCwroqIqK74dTiclIDK2EqrE1YHdaqB2Vg3Jp8yYNHYnPnx7I5bNT8PxIzoUWAJQ4NTBQUOJzU0k0O6Bx8lxszM8Paw2HemdEunLTqxbcxxffjYDn7w/Bds3noIkomHQRqFKpTqUVy3OnEmB0GmIorrgojJWrlSTSKeLiFc+AoMNqF4rDBk5R1CzdgTq1I+h8yEkGzeiIswwURvMy8um8haQvh5B6VOjId1LkrIonKb4zlCTyyEZUeMUNkWm3KyYvGk1ZvoMot9M4MrXe24UVHhpWIglAz9dir/7yIfHTcqbInAZmzdtwOhRX+OHSROx6vcVsFkL6QHigZtIG78J4Td7vk/KOgU2LslUjINHjuFkQiI1TrYl0HPKQA8ZSYsOnTqj/8DH8cBDD+P3VavoFi0cLjdOJ57BhAkTlT3YgoJDiBR6sG3bDsyYOQtr1q7D8ROn4HA6cOTYEWTn5pCCaYPdaYfTRZ1LI+ByOuFw2JGXn6Ns1p2dk4W58+bg6PGjmL9wPsWfiHXr1yHhdAIRwjwkp6YhIDAIGzZtRkGhBQ0aNcaw51+g/HVCCBE4Zb0w5Y1ndZ4+fQZHjh5XysZvTJjUMbEsskoyOZPok99Ge2mgWbnidyKSE2mgn4y1a9ZQ4yZyx5ZKitPtpMGB4lCEwmmUwHk/rykqZsrBtYPr0GGc8DstkWK649Y2l1dKnHv345h/Ybe2Ct3TQnFrUn4Y2+LFtx9EZYWYeZE49T18u9/3OjTv94/wU/ALeKnMfLiwa9IsBP33C9zrf5XuTZqF8bPTlGq9UhhatURDPzkU9q1YujzjwnhcuzBpVhD++8W9/rf3XiTNGo/ZaVeRonMv9h/zL8DXVkH3W1v4HMLQ/21JaQ/l+Gkwjp8/Arc3bYY7X/8Z2zOYJpjQ4b6+JaZx/RXQILzXJ5j2US9EKuWWkbfxffR/dQkyrkbYNzyc2DB19rm+om3YGq3LepVeBF0bvPnuI/S4lJG1cjm22f2jjLYm6tUtezzQVauBOF+zhrBsxu9rS9rc/l7Yti/AigT/iw0inw3qh/kfmjasnr0IKf5TurrN0eJSciGlvdbTH+HFxpdvzBdPswzIWVi5fBuKxVwPZYtZh2o14vzxCFg2/47LidlzbBpmbmbqQGNkWAM0PDcVupywbceCFQkK4efyV25QH2EXFOQK+5ttNWYvSvHHqUPd5i3KtOycg7YWnv7oRZRD7KWhCUevT6bho15FzqPysPH9/nh1SRlj5SVhw/YFK1BcnQ1Q/0IhXIAragOl4MTe/cf8jmKIgHa/FVf6mLpu6+QvwF9jcfPpcWxX4OeqV7iJtNngzk1CdsI+xB/YhjMn95Paa4ORnXGQ7ud2uhAaFIboyGgEBYYQqQvDkgXbcfxoMhEaCQ892hVtOlRV9mfT6nzO/PiFvc3qQHBwKCw2u6I/BoVEIifLBY0cA6etKhb/loyvP9+ILetIj9XGkE4bAptHDw/pz64AAXewBDuFghABayhgDyH9OYj0zkA9nBoZbqp0jUw6ORGls0kufDd6Hb4btRzpZ2SEmGsRAa2N7EwiaVkWypORiJiZ8gdly4GC/ELFEYnQ5iIgNA9tOlVCr5s7w2SIhNcWgiBjHOrUagyLNR8ZWWcgC54y6qG0vJQm8QFqlzqdnsoUAa3eSOV1U8ulc6T48jJOnvfC9jct/XGb/iehfGPB1aKIoV0qkIC5o3CHOXToEMaPH08sPknZP20ikZGDBw8qniTZ4sSBr+O3IkW/+fvixYvxySefYMuWrUR0qGIpvjAiQwMGDFDc59euXVuZJslx8rngoCBl+iPHPWvWLGV6I1vx2NrHHiP5O0+DbN6sBW65+XY8/NAjePLJoXjppVfw6quv4wX6/NeQIbj3wYdx8623oVGjRsr6OJ4uyVZBzv/OnTuxbt16rF+/AbNmz1I2Dk9JSVGmU/ImjzzVMjAwEL169cJjjz2m5Jc7Fk+B2LBhIz7//AssWrTIP21UVq7nsnLwWSiFIhdeW/fDDz8o6/J4GifvrM7eNl0uIsOCtz3wd2Le4PGczCsef9WUg6uBN2MTvhzxA454qGOHtcaw8Z/ivku8IeTBNe/QDLz80vc4QffoK/fAiJ8+wm0XLkO7DCRE3/c2XuwUqFSDsO/Etx/MQJp1K778Jh+D3uiFMlc35S3F+LXNMPRfj+PZR2rTgEWQ87Fi/A84XGp6YfkghVZCrNnfENjKcfT4BdMu85aOx9pmQ/Gvx5/FI7V99Sjnr8D4Hw5fYormhfDmHcKMl1/C9yc8ysaZPUb8hI/OCU5CbL//4b2bo/1vXwXkwhNY+uUT6NqkE56atAt5l9CShC0dh7dvVaYq+8IOHMtgF8F/FkY0e3EKJgyoBb1SUS4c+34Ihky6UE7/eHjjsX13GvUABnuaq1y8BvSS8CD+ZCKKHLpqJN5YtezHjSY8rNiqSgT+9Mkz/h9/H+yp+7By+kd4fMg4HPUVvjS8Cdh3MOecEi/FxqHqnxzuLptmWfDE42Qir+Fg8HgW4Ve2zwcp42G8oa4PwnEaJ8+U1ZodOHt4I5ZO/RD9H/gfNtn9h68E9lTsWzkdHz0+BOPKVZDy9zcvKbYHc85JHbFxVX3jYUXA2AwvTpmAAbV46hVn6xi+p+f+pOPlGQXsSN23EtM/ehxDxh3195/L46raQBG8eTg042W89P0JeDR6VO4xAj99dBuu+DGl4DqtkwpGhbxw5s557qFU1FP5k2RGJIOXBbFr+6QDG3Ca2kxuyjY4LIfoeAJdnk6krgCuQgdCpAiEGKNgK7Qh+Uw2wkIqoWuXbjh2/CBOnNqBatUNEJpCeD0uKoMEp8sCHX2aTAbk5mRT2WREhMchwFgVGWkm/PT9ZixbdJgIFOdDB6u9EB4dEUjJCdmkQ/ueffD+F9/hk5+n45PZ8/DpnHn4fOZsfDl1Bt795lsEhEdTekSPvBRonNA4QqFxh2Pv9jSM/WYx9mxPouJFoXXLbpSnAJw4nkL6qBZuTx6RLQNCaTzKykmDy5uFOg3CkJRyEp9+8h0mfbcIX328ADs3noVRiiayRyTSm4nM7KPQG4l0Mun1BELnIRJrqkG6cSwEe49kC6PE7dDJmSEZ26k1OpTfbBT6J6Fiidu5Fnvp4HQ6FNI0ZcoU7NixQ5kayOHYsWOYQEQuMzOTrisGkxYmV0xqmICxy3kmK9zpGI0bNyaC9apyDe9BwaSKCdmtt96KXbt2UcPxKGStiGTxehC+pmnTphg4cKCytmzq1KmY/NMvGD/uO3z66Wf4z/D/4LnnnsMzzz6L5198AW+M+C8++PhTjBw5SiF/c+bMUfIxaNAgNG/eHBER7ErV5zAkPS1dWUPHBHP37t04deoUOnXqpJzn7Qb4k1FESDnfXPZPP/1UIW88FZIbqy9QJ/E/fc+ePauQ2z179py7d+/evQqR4y0JeAoaX8uy9JnkGefLv2LA+bnuLG7eY5j+0mN4cPCH2BreFy99Mhnr92/G6HuK3kSfB+dOjBvQE42iQxDdrB/G73Gg9sAp2H/sD7zfK/rqOo+2EZ59Z6B/ob6MzIUfYNhT7+Bgn7fx8Hmu/33wImHqJJzpMxTdzWZ0HToIrQzKkxTO3T9i/LoLXZxcFpKBBjt/IyI4bNbSLYGU0qmTzqDP0O4wm7ti6KBW8CXpxO4fx+PySTqxc9wA9GwUjZDoZug3fg8ctQdiyv5j+OP9XqXX3xia4oW5v2PC4NaIUNaUMATcWTsw6eme6PnyEqRfZMwVltPYsXaN8iLEF9Zid7L92rRqqQoeHPMLhrfhqRYE71ksebU/3tt0VZNFb1x4c5GTVyxRSasrd7tnB1PnIGmhu8iNkk7He8eeg9td0r3J3wEZBfFbsWb1WuxJ8lmcLoC3EBZriZbGG9D6v14dypFmmeDpR/6vhIvXj6S8SCsWsxtlillYcXr7SixfsgybEs4bF8oJuSAeW9esxto9SaxClQ/l7G/eQgtKi/3PSf1ykKo8iDG/DEebIJ/kvGeX4NX+7+Gyw4BcgPita7B67R6Uvzqvrg04d47DgJ6NEB0SjWb9xmOPozYGTtmPY3+8j17nL3a8ElyndVKRqAi9hdRVZWaZLEhHE256orvglT0UqMa9PHNKD6PegLr1qhPJ8lBPzUaAIZ/GyzxotFbSjXkPtGCEmqPhsjqhJ3014bgFQcbKkF06xRpXtaaZ4s0nfc+pWLRcbiJhXicCzEHIzi1EXM2aROLMRHCCceaUCzMmb8Cx/WnQ+v0TOmQ3rNRb3ZIDHskFJ+mLTTt0Rcub70a9DjejUbfb0OCmW9Gg6y1o1KUX2t52N0Kjq8NoCqXy6SlIFDfRUbcebrsBqYk2/DRxOXZuTiDOH4CwwFgE6EORl2OBgYiky2VDcJiZykfpWjPhceejZ682uLNPZ9StWQ8GHS8RYqcmAQgJDILHYYPLWUAkM4NILvUNQS1SliBRmjLJRDg9ygwzZfYeyVcQYeP96vg7ZUwp4z8Jf6JXXy1KPgqYWAjFicOvv07F0iWL6DsdowGMp07ym4ONG9djzLejYLdZqHH4zKBGox45OVnKPR9++AGRlFx62DvpwSTh9ttvx+DBgxVrFjsZ2bJli2JpY3J25MgRxUL1xx9/KGvl2EkIe3t8/vnn8d133ynrxNhyd88999DxRoiIjFLIkKXAgvzcPOQS+cvOzMLZtAzqDPlEAL3K9Ec2XdeuVRcP3P8QPvrwE/z4w88YN3Y8/j3sBbRt056UZN7IOxD79+9XSBV7ovz3v/+tkCv2QMlr05icVo2LQ9++fZUHLJNKtqJxfphEFlkFFZlRKKAyT/r+O6xft4bX4sOgp3MsH5Ld4kUL6J4pCiH2eNysM/mJm1/2PAr7nkMVhuvS4qZtgH7f/IrfSClZOOsHfPXGQHQpua/R+TC2xXNTpuHdW8KVwZfXOiSsmI1NWSXb8JUj+OY3MPxW39QX4T6BRdsb4qWh9RWD/gVw7cDEmSYMGNxIOa9rPBhP3hLiqz5vImaMnYuzFyE2F4Vsg7VobhXFFB4dVSpt146JmGkagMGNlBTRePCTuCXE12C8iTMwdu5ZamWXghFtn5uCae/egnCf4OBJWIHZm3iRcRkIboknf9iGg2vGYljPGigyBkIuxN6xz+HtZbwn4oWQYjpi0PA38eabReF19Gvt80x5TRDcBe9N/RJ3+r0yCMsufP74cKw893b5/wG0YQjz171SjwX5KChX8bWIrRR1bpgRXjtsF7HeyA4HKQr+HxoNoitX8f/4u8D7Zj2Nj79fjlVf34GIokKUhDYc4aHFJ4SNFKxScrHgyPJJ+PD5x/FYv37op4THMODpERiz4lQZlttypFkWtLGoFFVcP167DWWLmV8isiLjg0YTjcpVyugpmkh0+Nf7GD19A/YvGoZGV6HD8n5tT3/8PZav+hp3lLsghHL0N214OIrFzlPBLKXHIssRLJ/0IZ5//DG/zCk8NgBPjxiDFafKYym7EMFd3sPUL4ucswhYdn2Ox4evxCWHAd6v7emP8f3yVfj6johyPm6vrg0Y2z6HKdPexS3h/KqWcuhJwIrZm/AnH1M+XKd1UlGoCL1F8ZRO+pcsXNTvSSdj4kby0kjs/Vuj+CNgEhcYUx1V6zeD3hTCE2Gg0xjpXj0KbA6Ygk0wR5hILy6Axu1Cs3oNsGfTMcyexvvN5aNevRjS81wkdw90Rg2sjlyERoTA7gCy8xzwErHS6UKRk6HHnGnbEX8kGx4b6dlOicosEcWhT1LEbW7OJ0j3jUCbzq3gMXuhCzVQ0yStkxRNj0EPr4l0JiKa7W+6CS7Kv1P2wqsjzVND9e7NI/Yk0zhEOnqaBzN+WoUDOxIRqAtD5agqOHXsNJykexgNRDQ9DsTEhpNenUm6rR4GIrC1a1ZD4ukExFUPRpPm1UgPtqIKySVQFwlLlpNkxcuDeC1bHnG3bDgtB2HN24PCnMMoyImH182u1pi08dssKghvUqI4JylnZ7pBUMbIXXFgEsRvNNitP4ciD4rbtm3F7Fm8cXUeVSB7AWPvktzQtAr5WL58GSb/MkUhX3wPb3zNVi4mW0x+mOQEBQUppIeJ2NGjR3H48GHF8talSxeF+CxcuFBx15+Xl6dMaWzbti3ee+89ZbPFZ599Fq1bt1bc9bOXyOXLl2Ps2HEY/p83MeTJpzDo8QF4fEA/DOz3CAb1fxSP9++HwQMHYuiQp/DSSy8plrFly5YpUz05frbedejQAS+88AJGjRqFjz/+WPE0ydsGcLnZYsjbBXA5+D62CnL+2VHKE088oQxsTCq5vLxB+E8//YQZM2YoUyPZuybLcebMmUqZiuLjUCQfHnxmzJyBrURa2UrHb759VjffdeeCMsxXDLher+c1buWGVAUPf/0N+lXzOemQMxbjzRd+RJn+PMoLqRr69in2LqYJi0SR1+TzkbNwDKannMWil/v7Hnj9X8Py3GDf9BUapnOXTcBPx64sM960JKQVOWORwtGqfUmnETlYOGY6Us4uwsvUzjnN/q8tR26wb7oQb2WwbMJPuHySEqo8/DW+6VfNNw1SzsDiN1/Aj6UE58Lm2XP9stShctdnMWb1Yexf+D761jb50vOmYMXCzfztb4GuwVP4YdJTqO+3crrPbMX2pD9T+T54acwqOxZ6kFfkqOzZj+nTd/J7yPJBWxttWxVtsUDVmHQK5dO1tKjVsR2qnrsxAykpZd8op6UXK5m6BujUKdb/o7zwYP/06dh5hYY6z/7pmH7Jm6gMjz2JPiX3dpCzkZbupFM10a51lXNyEWnJ5zn7CEKjO57E6wOqYP/cGcr4PWP2OmjveB3/vr3OJaaSXSLNsqCthY7tqhbXT0YKyhazTHEUvzjRNeiETpdyE0n9N6Lnv/F426sfw7W1HsOTfUq4m6c8ZFNdX8qWdLn+pq3ZDq2rnJM60pKTSpOEoEa448nXMaDKfsxlmVOYvU6LO17/N26vc3GpXxo6NHjqB0x6qr5/5oEbZ7ZuR7mGAfbI+WSfUtuDyNlpuFh1+nCFbYAgVXkYX3/TD9V8gy0yFr+JF34kRdZ3+k/h+qyTikGF6C0aIm4adk7PGhfVqUImtBBeNlp4aLy3QEtBdjgRERKFyMAo6GR6/gkDHHYXdHoBc7AMuzMJbo8FVosLTocLD/e7B71uaYluPRsRVyLCJBGxoTrKz8ulewLAHhodHitq160G2SPBVmjCiiX7cfJ4DumROsU3AymI9I/yQhXGXs2V31T+Ji2aoRLpqFq9jkgf6ZySILJJ+acmINM1/Nn5lltgDglRfrPDFPa5wG7/NZKbomELmBZ52R5Mm7wZiacKFCtanVq1kJOdTzoqtR9OjlhiSGgICgvyFOODw2GB0QT0ubM36btepCZlQKcNpnOBsBYSvdToIBmNdCtJU0NjtykTbt1JWOXjcGnOQDIU0Dl+dUUF8m8NoBEqcbsCFD0ifFY1RZD+4PUyG2YC4lEsZz9M+h6n4+NhMhiIjduporhRe2GkBsROOAoLCjD555+wcdMG2B1WLFmyCBO+G4ezGelc8wgOCcQ99/ZFeESoMn2Q92DbvHmzMoWQLVpM5H7//Xfld8uWLZX930aOHKkQPSZITPJ+/fVX/Oc//1GI02uvvUbEbQxWrFyBpORE5c1AaKAJsRR/RKAZoQFGyJTPpIR4bNm4CZMn/0L3DMfQoU8TkXsZX331NXbs2EUkrgBxcVXRp8+diuWMiWK7du2o7KQe5+QgIyNDIXpMuKpXr442RB55jRqvg+P1ebyuja1sqampiqWOCaXL7cLOHdsw+ccfqFNkKVOMeKzWUOfiPXw58PfUlCR8P2kicnKzKA4mwtS5SO4cFM87imWz4lAhc8X/JkiV7seXowaihjKfS0bm0rfw/KRT1+SheEl4T2HKT3l4edVazCXFdLo/zFu/BG+29q+7cOzADxM2KDO5y4uCHTtwxJ95Xe1H8ESJxXreU1PwU97LWLV27rn0pk+fh/VL3kRr32IHOHb8gAkbypGiVAn3fzkKA2v4pmjJmUvx1vOTcOqc4DxIXjIZC0q6moYZde56B7+tnoB7fa4GYbddjS+3awUJMXeNxLR3upThWOFq4MLekbeialAQqt0xGgdZyS4aKgkaYwDMRTpQBcC1cyZ+O6yoD+WECT0GPIQ6/rmM3tPbsSW5fC3f2GUg+jX2E37PKezfX7blNP/AASQoZEMDc4eBGODfOqLccO3EzN8Owz/rp5ygcXTmbzh8uZsCO+HBe+v6nekAzu3fYsxqbvtG3DSoP5ooyiwVL34Xdile9UpDX7MGKvsuUfpDrbrlWHF00TTLghFdBvZDY9+bHBLzfpQt5nwcOJBAPY6gMaPDwAH+rU0uAW0d3Nq3HcKK8n/FCESnB+9F3eKC4Nsxqy8zVl2mvxlvwqD+TXwEikoTv2sXLhS7HjVrVD73fJMq1UJ5xH5JSDG4a+Q0vNOlvE5CihHY6UHcWywEbP92DC5anUW4ojbAkFDp/i8xamAN37RjORNL33oek4oH2z+Biq8TT2Emsq0X9p+/Gtfa4sZUTWaPkRIF0mWZsIGJhMen40qyDQ5rCgpyjyEtcROSjm8ggpUMrfDwskJ4nDrSg8MRYIogfcoMt0uPDetOKHEcO3IYBZazJMwCSFoHnC4rkSMdPKRem4zh9Nx0wWbNIULmIOITho3rT2PbplTopQjSA/WkBzLJ0pKOTZVKomfyxmvWZK2Exm1aw0S6LtE4ip90R4mJkv9lP+vzOi3qNm6AyrVrEj/i7baoZJKeAuuaRLAkB7UakqMnBFkpbsybsQX2QgnBQWFIT81GTmY+5dFM+r4DkZFRyMvNpjiIuEYE4+Ze7bHgt8X4cdJs/PzjEnjdeoSHVSY9XEdELp1IqG+pFK8NdNIxt9cEc1AEwiKiIOlNlEPeXIZ7DocKfJj+jbjSMegKwRpJCa2EwCSFhc6WIO4kq1f/gY0b1lOj1NJvF5EVftDLTPwVgsFzVvXUGDOJ5Hz++WeK9ezrb75WLFFskWMrGU+NZAvWgQMHFUsar/PidWS8Zo7XvvAasUqVKilr1Jiw8dQVniq5ceNGfPDBB8pUSXa/z7+ZyPFUyTfeehOjxo4m8jMBEyeMw+jRI/HN119izDdfYsKYb/Hj9xPx84SJGE+D8Pvvv69YJmrXroNjx44reRw2bJgyfWvevN+Qnp5+bs85Toc35uY8sQOTIqcjbHFjK9gtt9yibALOFjLew43JD0/5ZIL3zTffYOovU/H5p58hLS2teICh+3hIKAr8m2XMFrelS5fCZvcpvnyMA9eB0gHLqJ9rhYqYcvD3QULsPZ9j9CD/Qm05C8tH/BsTT16Lh+LF4do5CTON96NfzfMGH10TPD6gi89VNT8op4/H/GzlzOUhn8GcqavATj80uhp49OM30T3Qf46V2UkzYby/Hy5M8nEM6OJz884OEaaPn4/yJCnF3oPPRw9CLZ/gkLV8BP498WQx6bVvxISv1pTau4vB+/081jOYnhkmNG/Xyn/074IZbd/4BaPujyu1Fuuq4E3BH7+tQzr1j/T1K7CtgI95zslDW602ahZ1GzkXm78ehF6de+HxkZtxyb3SzwOPJRdAzsbCMdOQG8trOmXkbv4ag3p1Rq/HR2LzJSI3dR2ODx6qorwgEu4dmPHLQR8BKANyxhrMWHraVx5DW7zyyROoy3UvCrF+wTJknp+MnIGlCzcqa2Q05lZ46dPnoMzQLQtUpgtLJSN74RhMy40955myNOieMkWxEGOm5SK27JuUtBQQ2eres7nPQuaNx+RPfoejGruXpuK1fw0jn2ui9ENh34RZsxMvfJlDD7LiFBQ16OIoR5plwdD2FXzyRF1lbBKF67FgWSbrYaUgZyzFwo28Zo3IcauX8OlzvqnXl4YOzbt1uYizk0uhqJ6ITHTviea+giB+8if43VFNcc59aVyqvxnQ/rWReK4Jj0UC9k2zMLvUix8fFK/TRVAU5msAc1u88cso3O/f4+xyKK7O7ujpEwJV52R88rsDF63Oq2wDCqRY3PP5aAzyO1ORs5ZjxL8n4to8piqqTmSkzH4STSvHIjqmER77+dhFx5a/Atf+hTPVp+Rz989WKiYSGsHth/RgtmJ5rUhNPoLdO5YhOXE1CnN30xVn6Tz7NdAiN8cBs6EyDNpKsBcEICtNVqYOVoqpCXOwSfG2yOvEeM2cXhcAm8VLnyFwOwyQ6HfVGlUoB1qkJNmwdUMSPI5guJ0BpAcywdERoaQ6UZRtyhoROZ7CSUwRzTu2V77zbC3WFxVrHDE7DZElhpsGD3NUGOq3ag4b6e1a0vWEzOv1qGRUXomIHm9tAE8QdCISu7YlYefWE3S/CQ0bNCWdVwOXU4bZHEhEzEn6sRkFBdmKte5MyilYrQ7ceWdftGrVDAmnUhEYEIEAYyhJzYDCHPbfwJZCHSRPHAINzREc2JDKVInywG8DWJc2U+CpqNyfruDBeYPgiofkKwMLrUhwvsDeDZlw8WdCQjyRq8mQeRqfV0YAz52lxsHTAdnSxrcaDUa4XWwiBQ4ePICvvx6p7JPGxIanPPbp01vxGNmkSWM0bdpE8UrJ1iyefsiOR5gYsbOQ//73v8qUSHZDymvN3n57BF5+5WXFuQmTJt4gm6c1srMPtsg99NBD6NylE+o3qItqVasgkhqWWeOlhw7lkxStSkTEGtepg07tOyj3vvHGG0TuRmPcuHEKaatfv75i4WNi+MorryqbC7KDlJo1a+I5Ov/WW28p696YkPHUR17DxhY4XmfHeWYLXKtWrZR8VK/Bi1ZNCllj4nnkyGHYiYwZ9Dpq/Pw2hQcanirJjZm/Upckgsaded68uTidcIrOkvz5TQlPqPbXC79BqShUyJSDq4HDDoffhT97rLOfW9tVNtiSeu4SN11fNJNKisadn3+LwXX8D8Xs3/H2sAkodjAmiCCXcIxBbfbiSdHDzV683gS8tYT/6znIKZj+2WQU1G1cxltOLWo+/CA6GTkndGnWYoyeeKjEA89NA67/Kx11OYu8FxRi75hheG95HhDSGP3HL8J3pJAXRS+nTMdnkwtQt3EZb5W1NfHwg53gS5II2OLRmHioxCNWJrkVC06Z4uGDhOg7P8e3g+v4SW82fn97GCacE5wXJ75/AoPH7y+9R5ztAHYdssLU7Dm8M7im/2BpuQmH47w9igSlW1QH1L6pb5SSq7CVqn+Xs7QjEy/1v+SzGSjTkyWVf8DEyXi+aRnK02XiLQVtHG7q3ojkqEWVB57AvWEkktw837oxTQBaPPAAWvpfs8tJkzHizV+wZssaTH1rBCZfauMtzkOJmVSF+Xnn5YHqfvwQvDyrELFVIiDJSZg84k38smYL1kx9CyMmJ/mvKwNSZTwybhb+16sSPeqd2PPNMHy4mdrQeXAcn42XBnyC/Qb/Gkyq+8g7R2LWV3eiql4gZ+En+GR9yftk5Kz+EJ8uyYUw1UW/8dPxbpdzbxEI3KdKFQol/KQoKNw7HkNenoXC2CqI8DdaYbOXmI5XiPwLb8L4IS9jVmEsqhTfVKIOeQ1xfikSJuftw89P34tXV5hRu65PCQfCcfMXC/HLsLYIl6xY9/G/Mf7AFViHryrNMiBF4s6Rs/DVnVWhFzlY+MknKC3mHKz+8FMsyRUw1e2H8dPfRUkxyySv4m0sady65DS+slB67BMF+cgvXRDs+/lp3PvqCphr1/WREcJV97fwm/HFwl8wrG04JOs6fPzv8bgysZcY4+FS1twUw0vP4WSczaDnsv9ISWhrDsDEybzHmf9ACZSKVxQgv7QQkLfvZzx976tYYa6Nc9V5VW1ApnuK5e2mZ1zxY+pOfP7tYNTxvyjL/v1tDJtQ7Any0mX/O+rEhjXTp+O4lcZr23HMencU1l5x+7t2qAi9hV/XsEt6dhvE1i3W01if5W2umOTEVa+EypVpTBaUNg1HEulvTJaYNPHLb73RAL3JQITLCQ8xJo/LDHq0KdtVRUaG0zEPpWBQphQ6LAKB5nDSKY0oLGAfBxKdN2HdmgSkp/B+wGYlRxxkyhPP01IsWES69ESEiHkhMq4K6jRpBIl0b6V1kE7uslnhJJ1atjlIjRTUnqi+SF9v160L9EGBpHJSfNRwdewcicrIqiV/ctykClHDMmLtH0dRkEPUSxuIpNNpyMrKp/M8xVJHOnwgLJY80l9daN2mMWrUiELdOvVRNa4G6f2nKAJ2qGamuASRvWDuKgop05DMeM2+y51L5cymY9To2NeD4Omfvq3BfGaNfxa0RGre48Zx9913+w+VD6W7e9ng927KdSQ3Fp6yYTR9KtP1iHj98MP32LB+vbJOizuLbx0Wm1p9AxS79ufvTGy0egN9+u5nEs2NokrlKmjWrDkiIyJw6OAhIn4B0Bv0ylozrU4iYmRGz5498NrrryleHJkcTfllCr79djS279yBZs2bEcl6Ds8+9wz63NWHGgt7yTHAFGBSHI/wnF09OyY5cRw7ly/CmgVzsH31SpzcuQt5SckwE8EKiYyEl66TiIyaiABGRkWhTet2uOXmm9G8RXM4XA7s2rNTmaqZmppCxDEScdQxeAuBRo0bKmv0TsafVCyHtWrVVqxw9913n+KYpHGjhigozMPOHTuRlXmW5Md5YsXQBZPRBCf1CL2OPfqQQJS2WdxAZRr+WW5Z2VkwUMfv0L6jIjOWIMuRLW9sGudjJe+7FK7kxSVbO1nm9erV8x/5i0HKyr7F0zFl9Hj8ujvN5/yAlJrUDBoCpADENYyD31GYD94kbJo1HT+OnYiFx/wPbZGJ1Ewt9NoQ1KobiwBzPXRtkI7fZu5ENsnQnrABa09oUbe6BnuWTcGYcbNxMNv3iBS5yUinwQq6aDSrQdq5AnqQ7l2K+YtnY9z4WTiYVXRtKs7KJnjzvIhuUBWBmRvw7XMD8cbsU0hPPI18GoRCazdFNSXDMjL3LsKsmb9h4ZqjfiuMG6k7t+BMUG00KtyCmRPHYNLKBNAYTvAiac86bN+8BFNGfYmf9gSi6+Ov4qtJ4/Fqrzhl2S7HmbHhWzw38A3MPpWOxNP5ENpQ1G5azScjORN7F83CzN8WYs3RXJ9s3KnYueUMghq3ReXkpZj+41hMXHjM/8AXyEzNpD6rRUituogNMKNe1wZI/20mdmbLEPYEbFh7Atr6rRByYAUKew1EkyOT8OXUbUjOycDpPcsw/o13sTzyaUya/j/cFk0PgPTtJHfqu+Nn4kCmX255KUjzmEjGkajl3oNZv07EmB9WIr5QKThVXwrOavSQgqogOHE5Zv48BuNmH4SvigRyk9P5eQJdsA5Hf5uITz8ch5VbtmFPDp02V0FTqje/Wq9AE1AbPbqasXV5Djo/dRcpXzJSt829eLzR9AC6gHVrEde5G6qmbsHGY1ZqiylYOHEiVicHo+OzEzDtw9sQ7TeFaHSF2DVzJnaQzAx17sKLL92JOkVzp86B6nfzbMz8aSwmzDuMHEXrozZyYB02bt+I5fPnYu6sqRj34Rt47+ddyNHUwB0vPodbq9GDfddMzNyRDdlQB3e9+BL6XBh5MUzVcNNj/XBTRCHOHFqLaeOnYkNiLvIyz+DItlWYO+lbfL9exl3/G43nO4SWGFH0qNThYTzaNRS5JzZg2re/YneeE4XJ+/HHLx/i+bcWwNn+X/ho8lR8dFf1YqU+aTNmz/wJYyfMw2FfoagZHsC6jduxcfl8zJ07C1PHfYg33vsZu3I0qHHHi3iul8C22TPx09gJmHc4x6cAU9s9sG4jtm9cjvlz52LW1HH48I338POuHGhq3IEXn7sZ0s7z61BG7qGN2LhjE5ZTm/1l/Od4a/gHmLKV6jW2F5574x7UK8qoFI7GfQbggdZmZO1bhG+//BmbzuQgNyMRh7etwMxJv2LFwTyENL4J9w55FoP7tEQlU1nt5grSLAv6Sujw8KPoGpqLExum4dtfdyPPWYjk/X/glw+fx1sLnGj/r48weepHuKu6PyI5A7sWUFqjx2HG3rM+5Z8IR0qqEyaNFhENaiHiUmkS5NRtmDvz51Jjn5x7CBs37sCm5b9h5i/j8flbw/HBlK00Hsai13Nv4J5q8Vjx04Sr6G/+EwQpvDH6DHgArc1Z2LfoW3z58yacyclFRuJhbFsxE5N+XYGDeSFofNO9GPLsYPRpWQkmORXb5s7Ez2PGYfbBbB+ZEblITvfCSC2vqfEofprwKT4ctxJbtu2BL1tNz+vDGgTU7oGu5q1YntMZT91FRLSseOVcHNq4ETs2Ladx6xeM//wtDP9gCrZSWrG9nsMb99RBxlW0gdppmzBr+o8YO3EhjvnZlchMRaZWD21ILdSNDYC5Xlc0SCfZ76S+LexI2LAWJzQR0KVsxZyxZZe9bT3n31MnlHaUIRV/rDwKT2gQXHlRuOW1R9D8b3rny8tR2BDAvhGuBZRxkHRaNkTwH8vSd4x1XacyxVHSOhEVHgRh8cBBY6PH5iYSJSn7lzncNphD6DmqbLydC6MuEGtXHsH+fYeRX5COrj3qIjCYlx95SQcNhs3iIH1PR+dsiCH9WNIEIDfTSG3wABxWtkbpoKH0hIZHRyJ19Kj07fPL69hINyf9954Bj6F1z+6k1/LsLN/0x7SkM9i7ZTsa1GuokC2ZCsLr9oJIV967cTNyklJhoDzrSa/0gT+JxLEuryGCqvMgN7cAVapURs160YiICiO93w5zKD2/WQ4mPc6mnkV4WAwMOjM2bdyD5JSz2LZtH+nBcajdqDY8TivOZqdDZ6SxKSqCyJqddAwblSETdlc6nO4CuEmukjaIym2mfNNDmMrIeivP8PsngJdSsT8OTf/+/QVbcyZNmuQ/VT4oHOoyoOql/3kBJpMtInHUuHwOSlw4sH8/3nzzDRw/elQhEZeDb4gqOYRQsyDSwm9InnnmGdSpU0chbNNnTidSKCsOSx5+5GG8/PLLikWN17nxNEW2gsXERPvJXGeEhoUS4aPG488jVy9XMjdmjdWFs39swPY5vyIr+Rj0AVRolxd6r4EeckQS46qjw6MPo26vnrBrSCGlRgxSFEmfg4EYFhPPPCJex06dwPQpU7Fk8WJlKuYjj/K+cE8q1sSc3BzFUqc4GnE4YSRCxtsW3H///fhlys/YsmUzHMp2ABQ1yVLp+vRQvRzYixEXhu/gKZxffjVSseBxvWmIaHLgutDTgF9eKG+JygkuA68Z5KmfKlSUDS9Sjp5EUP0Gyibcrsyj2Ln7GNIdJsQ164C2tcOU4f/6ApHcI8cgGjTye5m7WsgoPL0TW/eeQb4UiXrtOqFFZRo/zoOcfQhrtqSjUqeeaHLlc9YuDTkbh9ZsQXqlTujZxL/RcLngQvbxvdh7LBk5DgFTRDU0aNkS9SMvQfz8sKUdxO59J5FWQMpJSBXUa9kGTSpdWO4bE14UJh3E3kOncbbACY0xEGEx1VGnQX3UjGAl4q+CDWkHd2PfyTQUuPUIqVIPLds0IcLoP31DoRz9zVuIpIN7cej0WRQ4NTAGhiGmeh00qF8TFSZ2Ir1Hjgk0aBR7Bf3mn4KKqRPnH8+hyavhmLHzI7S9zAuDigLri7zshp3OXROwnqwoXUyUeJ2YXy9jouSxkU7F0/5ySL8rgDfjDNIPb4c9+wSCDXZkZSbB6XKgTt16EKTnssUrQFMZTms0crJsCI/WwRB4FgFB+ZSEm2QeoDi8M5hkHDuRgcZN28DtNBDRS8K86WcgyUQOJRepj3bKgJ7uCYCD4pV5z1+PF26dBtpKERgx5ms079EdkiGAiJuB7vNg87o1mPnTNIz+ZizpuQFwGzVwE/3X26z48YOPsWTM9+DdaYMDA4mzEQEkAsXbH3goON1OGAK0cFFaTVpVwRsf3oPc/DM4eHgXut/aluRChIsIalamBZFhdUh3jkZamgZbtx0jwmpE155toRGFcBJx3Xd0O2o3qI7K1WMoPgd0lJaGyKEDZthFFD2ZaiImtif0hhqU92DScX2e1nUSN6grUGCvU7Ro0QJDhgz5K4gbK/xFxM231xgTtw//9z/FM6LX7fJZjC4DolH0f+lRQomTAlsMq1atqjTa/IJCZSrmAw88oHh1ZEvWqlWrlCmMPNXw5ptvxlNDn0TdenUVc7Qyf5fyVHI9FhM3yeWG5fBxrP5yFMTJYwgWNiqzHRoPkR3ZCI8xFKmUJ2+DerjrlRcQVrMaqJUp/mx0RN6MGnZbyh6DKO9EWNmqyG7/eb839lzJjlGefvppZf0aWwI5f7/99pvyvW7dukRmJZw6eYLKRzKk/PEnEzeJSJtGaYSXBl8vqBxepWx69Husv+IcRaOscdPCQ3liwlxRxI29aPLav+7du/uPqFChQoUKFSpUnA8L1rx4C0Y2mob5z9T5217Y8TZNPBuKl7tcE7Bq658FAclDyiWvdSPdjAgFW9yEO4/04mykpxxCXtIuEkMytK6zCNY5kHU2nfQ3LerUbsIrEaDz6Ij/GZGUmI1TpzJgCrSjU7fKRNSI9JGeWZDrQJDZBLdcCLcmHJI3nNKOwuSJ27F3u5WyYIRGX0gRUWSyGV5vCOxEfnhdhXB74TFoEdemGT775QcEVK0MSUvXEx/UeNz4fuy3mDt5BpYtXQkRaIY7yABZT/ooEbedC5bg82degN7hQmhQCOmbPMWS4iN92S0KiCzyDC/eu01CYKgWI764G5WrGpGRdRoh4RoEBslEwqywFLqhFZEICYxDeroGJ07mICc7BxZbJvre04UIKrBj7wZUr1sFsVWjSJ4SjHI0lSMATq0Z2uDqMIU2gMZQl3TkSEqX8iiIqDJx07CX6hv/FUsRcftbSpKYmIjVq1crxIZJ058FLyjlOHl6ITs4uffe+6jj/RthYWFYtmy5QoqysrLx5JNP4bXXXkedOnUVMsPEhRfM8jRNJjM+Ru4nmbIHSacOofBsEoK9LpishYimBswhyG5FIG8gSI3CkpSIswcPQnISqfM6lEbCow6bbBViRCRLT3EbDEbwPj5vvTUCHTp0xNKlyxRPk5zvqKgoPPvsc5TvexWnKT5PmMcU8zfHweSSP/lcecHjhcbPtJjE8d51vEk5l1eZg8zNWClzxeCf5ZxEhQoVKlSoUHHNIedi56T/YkbMR5g09O8jbYxrrbcIUsG8VCAv6WLKfC46wC7wNaRTajyFsGefwrFNi5G+by0cOUlEtrJh1FiIwBApEkboiTxBw+u63fC4tFg6fy+WLTyCsyl5aNKQCAqpmzarja7jZTQ8M8uD7IxCyE72DxGKwlwd/SbdFKSbUry8T7KW4tXI7LjDTSRHgoeIlS4gAMIQgHbde8AYHQWXXguXTKzNZYdckIddGzcgLz8bp9OTeK2JskSH18WRNomOPXsgoFol2E2AVbZBq/NABxe0Xg8kSocF4HZ5KU0PPDYH4g+nEZHSENFMR2Y6f5dg0pGOy26LXEaKXkL88ZNYv2oH9uw8grxs3oTcTgRVB4PRt0WYh+MjJdct8ih6AVNQPZiD2hIxbUikNRQOYpx2OR8eOInIKhOD/1GoUOJWZEhjclZkHWPL09q1a5UNp/n3nwHHy9YxJjU+S54HN93UXSFtoaFhlM56fP31N8jOzsXTTz+jELeqVavBaOLFtdTo2CsNkRf2hlNM2jhmCV76kmnJhkvD+y05YdALyB7eqoDYOzUUWTghS24YqOdknTlDmWEHK27qYJQPduVaJFkvdVJKh6dvMnnr0qUr/vvfdyif3bBlyzZ8/PGnRN6SEB4eoeSxa9euClFjksZl8/L8Y0KRDMs7V1eRLQUehJwu32be69ev9y1qpuP8x/KqKHDc14VzEhUqVKhQoULFdQlv4jFYu32A70bc/Cenn/95VIzewnob63GsXLKfAQNrlERtiOkYw6EJjFC+a7w6IkOkkwo93A4BFwV2OmI20zm6nx3ZxZ/KRJvWzVCjZgyCQwP9M9+Y6lKgJHiCVlhojKJzOh1eFOQ7kJdLhI1f4hNBYx1X2ddMZr2XvVoSeaM/nsaoM5rQtlNnSDoD6YjsUIUC6ZspCfFITYyH3VqITRvWU9ycjs+BIK+B0wcGo3237kQAec2cB14ifLwllVahdUyC2UkI3URMi/XZvBzSk70aVKpUGSYii7ykiNVV3oTbS/oy69CBgRK639QKrVvVRsu2TWCz5dE1RAapHEppJSKebkqDymCUHHTvWYr/JOUpkfKcTeSUiSMRTJnIrzBQhsunN98oqGDixuTB9xaDv3On4Ma3adNmhUAwGWGr0p9BEXnjuBs0aIjhw4crrv/ZuvTVV1/Rca/ifn/gwIHKWjeGVrGAGaDV+dzj6/Q+t6Ecl9tNjYgaA/8OMAcp0w3dVAZ2zerhtXMUn4bIkLInh4aaJd3LDlEkfotCv71E4Hg6IzdZxfGHlhdHaugawzlCxg473n77bdxxxx3Kmjt2889ENjY2Bq+//jpq1aqlyMUnGyVxyievmaNeWc72x45V+D4Gl5XX/DFxyyf5e6ijMKHj8lcUVIubChUqVKhQoeJS0NbqiO71g/2//l5ca72FNTCeheULrM2RHqfRE8kxo1A2QwqrjuotuqFWy+7QE4nzeIhUCRNdZSIdLoA+Se8knZTXsAWHmNCsRRz27t+FvIJcUj95xpobBt67TCFiRHzceuRm2aDXsXMO+p7L3p7d8DCpo9hkoYVXsGGCckTHvBQ3kxpJp0d4TBTiatRQ9Fctnyddl/Vf9s5uycuH2WjA7h3blb2W+WYmhxqtgXezQcs2HaE3mZV0WOdW4vTroIquTF8pi0pwuHjtmxZOl6By2CHpiYCSdHgrMJeHDSVuhEWSfm4oIJk4qCwOOJy5ID5J17CXTBdXFJXbSOSMdG2PDa7CfbDkr4XLuR0aOQkGIm5Gjwk6jwF6r5FiL6fifIOgQokbg51kFHmMZAKzb98+bNu6VSET3EmUyr1KMOniwPHExcUpa9oaNWpMDS0FX345EidOnMJjj/XHo4/2g5lIGBeXCZgPnG5x4DcMfI4bAzdofpNQr1YTBJojqXEGwkadwq0Pgos6k8UjwenlTf4C4NAYUK15C3i0Ori8AnpqyL7OWtxQ+A0Cx89rCZnLMsGrXr0GXn75VcVCuHz57/juu4koKChE06ZN8eKLLyI8POyKpkaWB+yghb1WssyYmPo8SlYMuE5Ui5sKFSpUqFCh4kaA5xpb3Ejdo8C0jS1tvsDf3awr6gNIGdQqn7GxcahVuz6MBp+OyPumuXkPYwOTKheRNDs0Ohu69WiKjl1qIzsnG4lnTih6teDpXUxgJCJ72gDSrUlPtbmJeAlYCu1UJp5JpnhIUAgSu+tQApMrmaghlZf3ZevYoztCwsIUvVDi/BEx8xLJOpOYCLvN52Y/+UwicjMyKCbmblQy0nsF6byNWrdFpbhqRNzYesdWM58+Tf/RP0qbp4pyNumMl/KqpbxyPiWNER5Kg6JSjCBuL3u8dMFk9sBotiCmshZR0V4icE64XYWUqofi4zi8kDj/dB/nhS1xvG1YVmYaHPYCZqR0nE66mYDSBf8wVJzm7keRJYs/2erDm1zzni98rGjt1tWiKF6O46677kIPvyMMdgJy8OBBxbMhW9p482tOm4k/B6ZVF4AbADVYF7F5SSvh4JFjsGpNaNrjNlhDInDWHIBkkwFnTEbkhIQhKyAQ9rBItL3zLniDQ7Dn2AnIOhNkrwZ6mRomkT/KIWReiEpF1FOjZEKodEr6woFdo/Lm37zP3OLFi7Fy5SrlOOebtwTwWdyuHdjauYVIs9Vi9R+pOFzrAVCFChUqVKhQoaKiUBEvnL2kV3ooeBUiwzY0AbNWA4PXBsmeDb0zF86sJGSdZS+SVtIBWVeVFQuTIMLmFRYiPPn0PQ9uOQONm1VG77uaEaEJBHvbV5a/aI0QMi/JId2WCI05MEgxjnipPExq2FjAZIp1X14ZxPuweYkt8RIeN33aSTFtfVMX6IICfRYz0lV5/1c+t2b9BkqfykHfM7MykZmTRUmQIktxCYkIoykAlavWQp0mzYgnaeD0yAqBU7bv4ssIrPfyV7bTsENCt92pEEvewksn6aHhJUV0kUZ2Q0dlr1QpEE2bVyGSWg/1G8agUaPqlBrVjY50dKeTiAuTUd5Pji10WtLvq1D5myDI3I5IXlXIvH2YwQvZSPr3P3DiV4USN54Hq9QWBSZFKSkp2Ld3Lx3ntwm+TYF9bwz8FcvXXhT+iErAd69AkyZNFMcegYHB2L1zF5YsXoLw0DA89eRTCA4KobR1iiWNrWAeNzMqfvvgT8+fMJNIhUwSCWRPjCfPJOGb6dMR27kjGj9IJKphPeTWqIzMypHIiA0HGtVDi4fuQ5V2rTF26hQcTIiHRquHnhqhJKhZUecp6iRehS1y4IarUTYp9DkJ0aJB/QZ4YvAQBBARnDJ5Cg4fPkzfzUTc7lesb2WvaSsth/LBN/3zwIH9VA/JSm7YVWpFgetXnSqpQoUKFSpUqLgRUBF6C2trRRMlSfkl/ZCohteBADihcxYi4+heHNm2Hvm5mXQF6WREXNweB5ERB+lobtIriYDADp3eQ/pkIZGmAoSRCsquGni6JMfOpMzroWspGY/XDUtBPmxWKxE4E+m0rPOS/seWKrqWXfV7/IG5lVP2QBtsRv02LSlHRIZIT2TSxToxa4g33Xorhr/7Hl57+x0888LzCI+OhMvrIb2W55JRyeg6yaBDiw7t4SbZ8Vo3Xl7EcTOJZI7Hm4ormqz/u46+yA47ziYlw22zMyuEx+FQHJgID69lcyIwiFOn8oJ3cmcy64HDblOIKG8DINN1IJl4SO82BNRFWFhnhIR1IHlVIaKsp+OUR52bAslHIZr/HFQscSNipXjQ4UZAcjt5/BTSU9MVUqMlMsWBzVHsCEQQkeG5sIoLe244/jgU6s8rLrnh0XfBjY0IB5MsXscVYDDh/nvvR8P6DanirZg3dSKc+Sm4r+8taNG0AXVCZuZs3aNmQ3nQaYmxU34cxPBlnpyrzJcl1k6Ejk3HHm5oxOr1eg3mL1yAryf/CH2D+ujx9PPo3u8ptL6/H9o+1h83PzcUmppV8MXPEzH/j+WQ9DwvWIaR8q/xv7EQVDZZ1sItS7BT8i4tdSrqlLxxoZY6IzdGLTWqHj274tbbbkbCqQRM/2UG3E4P6tdtQGT0AZgMTDgpOmrY1FaVjqlErgRujCwX+mMZKm2Tq5TLzKfoP2WgIPlzJ6OOnXU2jdI5TnVDHYHOsRx9DlCUm/1x/Hl4VIubChUqVKhQoeIGQUXoLWzr8nmJJF2MqBCbDXhjaqHRoiDfgjPJZ+EiVVSW2bTAHs6NpKcGwMhTHp0yHDYmMjo4HE5FX4TE5M1KGiATO6dC9PQS6YekTntlF8xmPUIjghXSFhISQGmRXkfX+Ggbry/jNW9EaIRviqKLlMqOvXogMDocGpMBWqNBMV4wIdPqdXjkX0/ggUFDcP+Agbi//wCEx8SCPYQQ9VNilLWke+olNG7dCoawUMV652IjiE6v6KWcCCWv+IFg7dSk95L+aYOR8lu/YT06R2mxHuq0w6gUgnRTopDQ2EnfpU8/aeOpmh63E0aevcYOTSgy9tfAfEBvkqAL0FL9sUGIeQXXIfMJIrMS6fh+/fafggolbiwr9jzjJCbNrv+PHT2qrONic7GvOfvm+/Knm8gO1R2RCBawwk4ugaJK0KBe/fro2aMnTKYAnDgZj5VrN6Bazdq48+67iYBxiyWCxIHfHRBh0hCD5D8vkxb2/kg54Hm3XN0yNRqZ936g35wr3vRwzsJFeP299zBlxhyk5BLzD4hAitWBKQvn4z/vv4uFy5fB7nQrVj02+XJHEMSw2MWqizqIl9KU6LtMDU95m0KNHYL3rmMPlL63JQHBQbjrnntRv3EjLP/9d5yMPwW9UY8evXqiZt06FAdl3aCDkxoo55u4JR2ghJSg/PNxNCX4CBz9Kz5GF/impUok/3wcP3aU8ksS8Vs9KwKqxU2FChUqVKhQcaPgWustTNJ0pGfqiWSRlktHWPuU4BRaOIQJoXEN0KRLb1Rv3JHISSARNdIQnaQfiwC4XXSNTYvAwGjS1YhQSeynQUOkiggbxQeF3LCjOUqFyQ7pmTq9DIs1F2kpiXC57AgJDaQQpBA61jeZbLm9TNxcCnFj8hMQEoTb7r6L6BFdQbqrg8iPzmD0Wd4oFT1vqm0yQcd7tAWYoSVyx2vWmLzJEuu0CitDbM3q6NCjO7ykd9tJd2aiyQoxnfIZD+g7cTyEBRthIF51JuE4clKTSC13Q3YSR6Dr2QGKxIYERW8neVEeOSgblpPuy8usWMc1UH6cViuRPxOlYUN+7l5YCrYSeT0DLZFardBRIALM6TLxo1z+k1ChxI07gGIZo08XdYgjRNwcTmbQVBf+4LMg8Row375qbKJVNp0+D5zR84VvoEq+6aabEMebb9tsmL90Oc66A9D1zscQHlefWL8GWj21LmLdMlWeTB3HywycDvHSOq+OOhCdL9TpkU+NLZvaioXS91Kl81sPnt/rJbKjNRmxfM0aDH/7bQx76UW8PmIExv8wCYeOH6cGaYTWYyJyFAAHkb4CIn95FG8BNUybXlAHdcPl9XVanqOrvPVgqxvln71TCrqeHfs0bNIUnbt3RYGzALN/mwWb245KVSvhppt7QOZ5vXSni62FZbVAOsbErEjeCnmjw7zAVQlUDg78BoU70569+2C1EgktEn4FgAdA1eKmQoUKFSpUqLgRUGRxY0uS8pK86I9fgJ8fSKdS3tSXCIJIBweeIVX0nWc98Tt2IUv0m5fk0CdxEoPeTGkYYQqugrj67dCsy50Ii2gArzeMrjfBZDBTlFrkZrNhIATCxVsEMHFR7FzKC303RezkwMYC0hPzCgoQERkBrVEPQ5AW5mAZwSFGUnhJn9UQ2aEyOuleD2dX5nVgEoIjQ1CtVnWYAgKI4BHRIdLG69Q0pBcb6JiLPa3zjDhOg/RlXQDFQ3lQ1EclDx5lM25DcCBad+wAk1ELk9YL0mzpvC9/vM7PS+U2GQyoUj0KFosNNWvWRY1aNYjQEZ20O+GyF0Avsf8LIqZ20pXdXrhtFmXPO9lug9fmhUS6dlBANNiwZjKb6L586IWF9PA8Im+nkZp6lGRP91ApNUz62E+E4uXSRwAVElhGYCOOlyqFaO25wH+eEn+KhVG5/kJ+8ldD079/f8HeDidNmuQ/VD5wO70cZBIaz0k16A1IOJ2A/wz/D3jDad4YmvdPYwsQr/ViOyoTD17PZaBOk5KSBDvd52OV3PDpg85RUyKh0U/+j87Wql0bX3z+Jdq1a0+k8AieeubfyHJJmPnrVNSrEUuM28PLFiFRg+bFoS5ibB5B34nQOblzUYPyENnJpwZldbL5lpKxOhBOhTu0YzM+++wD9L71Ftx1y81IPnECi+bNwe49u4gQUhVytnm/C6+RiJkOb3/xOdreerMyI1drDoCBiGAghQCtDLbh6amMOmrkHNhsrqH09VQeXuemFJGOJSadxn3334Pw8HCM/OortGjeAvv278Orr7+O4yeOK285+G0ET570ycbfcwgOuwthYeHKVgg8+HDX5jj5LQUPMEzg2IzMA0r16tUxcuRI1K5TF5KW9+xgIuuLi79fjM/xS5byIiIiAqdOnVLKokKFiusfjmNL8fPi/cgjBYFHWH7DFdP5cQzuVsk/3hBsR7Fixu/Yn2FVppVLpii0v28wetakcawsWNbh+7lhGDyohbKjz+XhRea+xZgz73dsOpACi2RCAA2ahuhG6HbPI3iwVz0UzB2DDW2G4bGa+di3eD7WH8+AhRdV+KGsH9YHIDS6Ghq06YLOTWJoDGbIyNyzEAs3nECmlR7AyjG+3oCQ2GpoecsD6FxNg9z9lP7qI8i209hJMgiMbo5eXYJxYN0OnMklxaI4KV9apOCYAkMRFVcXLTp0RJPYa+sNWIUKFX8NunXrho8++ggdu3aiX6xn8V9p+FdrsdKmELKSYKVeeXF+Tlfiq/kiJn/sloTdapAuqyxVId0UdlJ/7UQuCpB+fA2FndAUpsIsWVFgzUGeowD1G9el8csDZ24WTKSEsVdFmWdxSZQWfUqkZ/IewUz0MlLOwkAkLSElG3Xq1ScCFY0Zv+zGmrU5lFIgHKSheihtrUtPJCgYHrMd7Xp2x//GTYAmOBQiwKysT+NNrnVe3khbIEDSKTq74q+BPr2Uppt0YBvp6CGhIUqJeHYa68+ZR49j2G13IMRKer+XdE6zARa61k16uJl04FrVg/H6e/fC6TqL1JSjaNq0GpE1GxyOPOTkZCEmprJi7WMvmBLppC4PxRNgJMIUgLx8CcdPnkXt+nURVTmE9O4cBPCG3F4DrIiFx1SXQh2ExTanOCKgkwIUPVupRw2Pyb6aYLCOK4hzKE865R/JUamzIlLmr/USgz3XNV/CviyKvdP/tWjRogWGDBlSscSNzZtMFrghOxwOHDlyRDnum7bH7kt9ZI0+lO+M7OwsfPXlF9i7dw8JihNhuqaIiyqPxcsNlxoRVeyjjz6Kt0a8jcCgIMyePRsffPgJbr3zHrz7zggEmih+Im6S3kfYbNQELfRJz2IU0kM7M9uC9LwcnLVakWJxIjPPAYlYvDczA82iwxFj8OLMiV145olBiAkLoY7lws7Nm/Dpxx/jyPFjeLj/Y6gUVxXHjyVg+drNGPTqG3CFR+NAejaMYVEw6s2ICgpBXGg4okINqBRtRGRYIIKNEoxULBPJJpBN29SJjNQieFGmzenE16O+xS8/T8abw4ej/2P94XS78d577+G3BfPhcDuVdX1sx/JJq4hoSfB6ZLRu3QavvPIKIiIjlU7GYAtcUeB6KHLowg2AO7uGOiXHo6wBVOTM8SkfF8DXsMuH4OBgpKamKp8qVKi4MeA4ORVP9R6CaSfZxk99PupWfL12EV5oUpKM5GPn+31w67yOmL/mC3SP8D/kLoCMlO/7otn/KmPKoUm46zJDgZy7DWOfH4r3Zh6GvusrGDVqOB5oHkkjtwOpW+dg1Lv/xcS9/8feVwBYVbTvP7djuxuW2iWXbrBoMGgEAxWwUDHQz47Pjs9WFAkLkRRBCUFCSrp7gV1YNtmO23f+7zvn3mWBBRYExd//PjB7zpkzZ+rMzH2f8868QwJPWQzG/fknXmqmUMHSNePR6Yb/YTeN39C1xhMz30aX7F/x8aufYmWWGrFdH8CHU9/G4Loe+pb9PYamjMScPP6R1iL5kaXY9NF1qJo9d8HveLTLjVjRaxFW/e86yCK6MvHt0Ba4e26e/FUyd3sNi167ln4zUrFu5od474ftKNZGo+N9H+O794egrm+muA8+/KvQsWNH+VG7fbu2dMWyJnV8j9zDcpM8ejyk0M/HM+QiRV71gsKQHCpDCyYKdEZkwumwQqNyQO1iM/sWHD+4DRm75kFjyYMZNpg0AqVEnk4QmUmoWxvxsRHIPHoAIVo1tA6SaylbQktxSuKmIjLmRkRsPDIOHUagXxAsLp4ppkOAMRj7dpXi8wkbUFDhT/Kvk2RyK5Equg8TXCYN/vsBlbd3b965GzZeEEf5VzvsOJGaiiPbdkDLGkMSCrmcbIdCjpomIzp1vx4qg57yoSESycotF/RlFRg/cBhObNoOA3m6WP5WO6HR2ol0OtCrZwpuHt4cdkce1UExzDqSzNWsRbSi4GQeYmJjSVZlBQfljatNr4Fd8Mw0f6QfL0JJoQ3JDeuQXAk4nAVE1ELhNkTBFNkYusBkqPzqwqGKoPoJoFLQAExsUqHKypo3/s/Oa0uDjZYoM9P4l4C3QOCwXEIORAfWLMojOS94Jpmsp78fXuJ2rl/cywJJs6iFMSkzm81o3aYN2rZrJ12r1q2RQplo2qyZtJ7YqFEjNGzYEBHh4ZK8yee5YmVnOVVr0lIlwc/PTz5v9vdj1ofd+/ZSWAc6tEiixsoig4NYuEC+W4tMpxbHnWpszrVg+roD+PyXDfhq8SZ8u2IX5m5Ox9J9+diUZcOufCfSKtQ4bmHRxIDD6Sfw9ffTMG3WbEz+9jv8tmolClkTSI2WNyrscv11uPWe26jRBMJCDeyE1YWj5WrszAU2HHNiya5izFh7HFN+O4RPFuzEhIU76ToNm05YkOVU4SR1njLqPhXUQl1qNwwmf7Rp2xE6rQnbNu+CyyYQaPBHu5RW8NMZiOBpoSfyyU2LO5LSCpUOw3VcUFCAyMhING7SWFra5LrlOmrRsqWs7zZU/+2o7tmxqViuVZ5CyfCMSeckbRcLp2fKgQ8++PDvgbH+cLwwqhX/5Em4Ty7DM7c9hxWFHg+JIKT0uRatO3RD+3OSNoJzJyZOWIqijNn4fPpx+XN4LrizfsGj1/fAo9N2oaLpE5g9/20Mk6SNYURsh9vx9sKVmNjXH+VM0KogoGVz1JMzBggqf8S3uh79738fcz4djhi1DSf++Ah3Dn4VG5RZ+kRG6bcm2vvDq0Z8ckPQr8hpUId2xvVt66NDj44KaWNoItG8aRwv7ZBQB9dBmw4U7qaReO6bX/H+jaFQ2bOx7tO7MfytHWC5wwcffPj3wCu3qIh0sBG9U1IWy6L88ZtGMSZi0inXLJN6HftVddIAHJEgQU7jdkFHREBHI4OBnNpugdptR+q2bdi1YRNsBS64ys2wlAYhN8cPORl+yDsWiIPb7Ni+vhBHD7pQdFIHR7kGTpJT3RU0Elm9jkhhmRN6tRl2qxsVZQ7kZObCZitBXIIfEmqbqQRWyguRLAfLZWw8xIag0HDUb9ocKpIHy2w2IoIsXxKBobzOm/o1Xn/8cbz+xBPkHsebjz+Btx9j9yTefHQ8XLlFcJVa4Hby7DWN1Pzx1MvuN98CF8mtVqGjKtCBN/M2EskMC9GjWZMYOChP+/fupHxYYdBq4bBYYCkqIRlXD42TiJLNQeOoE26rCpYyHfJyVDia5kJZWRDstiAUZbtRmG6BI1uNihwj5SEMBnsUVMVGuPMp78VuaEuIFJdYydmhKiVXboOqgpyFzq1U95SGxuEiEkxhXQJ6FoCJpLNFTCeVhad2uuncRfXh1JAfz9oj5yCSzB/t/mlcYeJGoDIyU2dX2QvOcEzOmIiwO0Qs/+TJfHrhyvRJqYmjiLiDsBl9DWuXiKiEEcGr36C+3DywpLwM+w8ehM5sQHJKE5RTfIXUaDLsOvyZUYbZm9Mw+fc9+GHlXqw6mIfDFiNydZGwBNWBO7QB/UjXgza0LjRBcdCHxUIVEgKXyYD1GzZixarVqLDasGf/Afy65Ddk5uSgAf3Qn8wvwuzZc7Bw6WJEJMRQIxUwBkXAL7QWVOYYqIIToQqvC1twbZTQdaYrEHvygBVEEqev2ovJi3fgp40HsTWzmO7pkU8drlxjQGLjFjAFR+LwsSxkZuVBrdIRsU1BsH8gdFR2udeFUrOVYAMwXEk5lLcDBw7Iu8rmh1R3VRzPU/Y6/mIgp/lw/V4B+Na4+eDDvxNqdTCuH3Ez4nheN40mFTuJ+Nz/PdJdyn2Gmvq2Ucc/8udG8aJPMGUnz7gowe9fTsauczEZ1xFMGnM3PttRSj+W4bjlP0+hS3XaOU1tDPl4Au5r4KVOHshxzHNeBSHXXYMWnjJYds3AjxvZuhiDZ3t4Tgk8i6E6aHVs3c1z4QFP8a8W6mj06dVSIZqiHNtmzcYOH3PzwYd/FSqNk/AHbUnElA/jLhePYzQAEqHh2VdqFwn/bMSDCJmOZR0+txE5sxBZqKiAulxxrsJi2HJPIv9IOo5u346969Zhx/KV+OOnn7Bs5mzM+mwiVv+8GGsWrMTMb9fiu6l/4quv1uHryRuxYOZ+bFuWi11LT2DLgv3I31MBS44TtjIXkR03XETQ3FYBexmNa5Qta4UVgaGh8mO80eAHtVA+zquIoLVonQC9nigHFUlFZIq35xJqB+o2SYZfSDCRFRU0RN7sRKZAZXWUl+PA9q1EbmxURhtHDrDSgsqmJaJlp3KlH0qFgcZDNjHIVh55+wItka/6DRuSDBtCAyiRKqeAge1EENFt2SoOCYnBRCyJTMaRnE3POCjPlhIibsVOmDRmKg9VuV0lNw4vtThBfA47dhdg6rebsPyPNOzYWYQNazOx8Y9s/LnsBDb8sgfLvlmGBZ/MxLKJc/DH5BnYOv0n7Jg1DwcWLELa0uXI+GM1sv5ch7wtG1GyeyfsRw7CnZEGVU4G1CezoC3MhaYwD9ryEqlpVBF5V9E7dduJcMt3T45q0kE/JTwPhTV07Mdg7uI9/ztxZaR2D/gHkadEckdgx+eKpuh0eP34a8dBIh4OqrwzIb99UCXxQUtCQ1RkJKJiouGijpSZnYkT2VmIr1sf+ph6OGrTYcXhAkz4bSfen78J3689hMW7srD1WBGOFtpxtNiOI0V2pBfacDzPgpPkl5dXhvz8YpwsOIncgmxYXbyWQaBXr97o0vUa3DygP5IaNYKKGmZYRCT63XgzzGZ/ass2BAWEwKAl4lVYjuK8UlSU2VBYXIrswgKcKMlDVlkxckucyCiy4Ui+FbsySrFqfxZ+XLUbH89bja+WbcXSQ/nYT3nSR0YhvnETpGbl4ODxTDipY4RFRSMyIZ43x5cNiDtjVfA1Vw1vMp5KxJdV8V4iXNVxZ618H0yCyUl/ek9KGCW+vwpuzNIoDVuA8cEHH/5l0CB2wBf49uGmMPGYQD+6GbMfxh1vb5E76tQI7nRM/3IhiqQmjISLHV/j82Vlyr0zULbkTby2+KTUyKn8u6Bfr1DlRnUIuBaPPdIdwV4N2/lAgoje+wsnSEAgIefKQQ0/s7lyDBUk6JBc5YMPPvyLUPnBWQrkbmlMz2a3wUKEzFpRjoK8HOSeyETG4cM4vnsPDm/egh0rVmDtz/Px2/QfMOfLifj8lVfx0oNj8diI2/HAwMF4aPBwPDRwCO4fMAgPDb0Vj91xJ15++FG8+fh/8Nkr7+KHT7/B1hVbsW93Dg4dKcaJXCvKaKyKjYhFq6RGaJeYhIZBYYggEuQsKIOt3C0tT0qORZxKuFRwOlwoKS6GwWiAgwgm591Sbkd2RiHsFgfi40OQmBhIYyyRK5LLDAY9lVOLtp3aQe9noPGaiCjJ3SbWEhIxO7JnF3IyjtH4ydtQ8UBGcTptJKOzbO6CTiOwdf0axXAIkTkjjfFm4i+s2UqIJYIWH0v8zyqf1wk7IsMM6NypBYWy4tCBvTCRHO1v8EdZsQ3CYQAbYxEuf9gqdNKVlWtQWOImedyN48cdyCPCenBvIbZsysDqlWlYszIL+3e5UHqYyPIJK/I3HUTmqo1IJRK84etv8MeECVj28UdY8PZb+OmNVzH91Rfw7UvPYOrzT0n39QtP0/XT+PH1l7Dksw+wefo32DfvJxxcsBDpv/2O3DV/omDzDhTv2Ivig0dRdvQ4bNl59GNVAYeNDai4pbzN7p/AFSVurFKUr5w7AQvz0s97VBz/lHIlMLjTpKWnSwLHUyy9a7O8v4ZELeSHECYp9RrUlwYw2O94RhaKKywITaiHHdkV+Oa3LZj+xz5sy3Mj3xgHV1h9aCPrwRiegICwWBgCQmEOiUBAcCQC/EMQaA5CVHAoQv39ER7iT0TMwL/5iI2NwS23DKAGX4caXReMG/cY6iQmorCgEF9PmYK83JNQuzXQwQCjyoBAfQACdEaYqUP4mcgF6uAfQsdgOgaY4RcQDHNwOPQh0VAFJ8ARUhsnEIzlqUX46rdtmLJoLVbuPIiIpCbIdzix63AqbNRBzKHBSG7aBBY2LsJv7AyZhS+9dZWWlibXE/KCNJ7HW9Xxujeub1nn/BA5XtvG1cvucoHfn/xq5YMPPvw7oQrBDW9Ow+s3hCk/Eu4irHnlNjzxa64cty8E+5ZJmOn/At7tH6E87zqOmRNmIeushyuwfNYCnPB8tNTWT0Hz6rRtldCgzn2vY1zjC38Usu/Zi0MeoyXqyGvRo3XVdXqXGzZs33mAfuf4nIjvtT3QXFlS54MPPvxLwLILEzceptjCokrD1hDd2LR5E5579hncP2oU7hk+HPcMHYb7b78NY8k9MvJOPDl6DF56ZBzeffZZfP/Jx1gxdy62r1yBI1u24NiOHSg6ehSu/AK4SHZ0F5cQASACReTM6CQS5eR1a+R4rzYiUPpgLdQBlA9/G8lRxRD2XOhUpdLiotPuIOKgh92qI0Kmhd2mJUKlh82qRnm5C4XFFpiJ5JVbKxAcGEnP+sNlNcLf3w+Nm8UhNIzHTRvxNEHpaeCwlGLZT7OxbNYs/D5tOn7/9gcs/W4als2YCXdpMTQuh5zuyWF5aFOsbfJg7cKmNavwGz23cs5c+eyy72di+Qwq95rVCDBpoNfaoHaVwqx1odcNnRAUZEQ5pVc7JgEuInj2ChfKipwoL1VR/OEk/weitMyE4hIDykqMKC3QwVpswolDJUQKTdBZNaAoSd7WoeCkFTt2nEBGai5UJU4E2FUwlVYgiEhkcFkpginvgSVF8C8pgLm4AIb8PBhO5kKTmQFH6iGU7dmNwi1bcWL1auya9zNWT/0ayz76CL+98TYWvPJfzHruZfz47Iv4jo7fv/w6vnrpNUx89S188+Fn2LV1uyRsrPBg5YSXv/yduGLETaoQnS6wRUMVsQTex8FNjJ2NcLhsVmpQTmJqAhq6R+0CigVKC5GiAuo8nl9xD6OQJINbjYrnnbKdSBWSkpPgR+yKN+47llOAAl0I0t1BmL/2IPZlOVAkAmDVBsKhMcEBrbQm6WZHRKtyuouKGi8RI63aRflzybULeiJhcGjpCWow2Tl4fPwT2L59B/TUqRrVrY9+3Xrjpp590aBOfSTXSUJsVBzCwiNgo3y4eOqQvxkqPxPURpOcaqNXG6FV0S84T9nRUVl5ICBn1+hg0frDZoqGxT8B+fo47DxpwK+bMpFVoaY4/HAw/YDcb4MNrCQ1SIbWpYVOKISINW9eMqwQMzoSCTtZWACbww6H3QYn1zOd8xxrXumpclO3I3IseE0dNTwXHZkEs7ucqJxu4IMPPvx7YWiGcd9+gdvrsP1bGifsB/AVCS6TDl5oDmARFk5YiWb33oU7HxjmMdLhRvGSCZi894xnXUflVBjvT5+axtP4yzB0uHLX4r3nJmOfk357glth7IS3MOA8iry/BFcR9vz4GB796hCcKh1irnsOU1/vCd51yQcffPj3wCu7sMypInmuguQorV6Ldu3bYtwjD6NVSgrspaXIPXYceRnHUZh7As6KYqgcFURyrNL6o5FGMz3JbTqSd40kqRlI5mULjRqnncLQPZ7hxDIvCW1uoSM5jp4ip6FzOc5q3CSCupBdmoNytxUVFJ9VY0SxyowCq57Ij5EImx/J0UTK6FhRqiOZzg82uxE5WRUICKlFZTDA5VCholiP9MMlsPLMsCA1GjaO4i3Z4GQT/yR/T/nwA7w5/nF88ORT+PSpZ/Hxo09h0vP/xbJvf4SmuFxahgzQG2FQE10imZU/9LtJVtaTDJu6axfeffppfPDEf/DRo0/iwyefxztPPof/PjkeW9ethL9BkIzuRoc2jdEwuQ6yc7Kxb/8BBJgDoHZrUVrIKkOSz4lYulwBKCnRobjMgMIyIm0lJtgKzCg55oI92wJTOdVbeRmCVTaY3BaEBOnQuHFdKmso1FrexoAqjjgEryPUCycMlEcD1ZuBKtRE8q2f040AhxuBVJ5A+gkKsrsRTOUPp9+HcAcQYnMh2GpFiL0UAdYSGCoKoCorgLUwBwX0jiuIcEbGR6HXzX3RpGkTqkPOM2+JoMxm+7tx2Ylb1TJwgZxUYTy5j9XNRC9gtVokYeAOwpty26hBMXNg9sqaovLycmKxnmxxZJ4I2RwpURXJ+Nk8aExMjDSw4XJQA88tICEjgMiQH46fLEV2UTnyisqQX1iCgsIiFLIrKEJRQTGdF6OYXElRIbl8jyugeydRVkz3CwpRnF9MpIc6i8WK1NTD1LAoj/TCjdSA27ZuQ2k6UZCXj9CwECQlJUkiyPvU5Rfko4hYflGR4kooXSUtciUl1BhL5AbYJcV8LEVpaTlKyizUWO0oKnMgr8yNtNxSnCzhDRbVyM7LQwXVF+9XFxUVhQA/f7nG7SyixdUkNWcqlJWVya8BvEaQa06uH6QjE2MnkzZeLEvngho4z9/lrwUc5qw4/wK8X6188MGHfzfUsYPx6XdPobW/Mg67cn7FE7e9jLXVz3qUcB39HpOO9cW915ph7nIvRrbUK2ORbSumTFiFciWYAlcpysqrDD56A386u3S4DmD6oyMw+O7X8GfITXj0zW/wx851+PiWuEv7sTvPQ7bNn+P26xshIjACzYZPwDZrXdzx7U4c+P0V3BBxxb6J+uCDD1cIXtnFzh/iSeI0mUxEqgQ0JOPVSqiFp599Dl9/Nw33jhmDqOhoQMOKBUGO5wlyOJKliKiRkEVHB8m9JO8SkZDyFsWp5vssk3nkNSaIQq3sG6xh8ubWgbc6NvgF4iTJhTuOnMCOtHzsOmHBoXwdMkuMKChWo7TCAIvDD1abGRaLCRVEdtyOQDoSUUs9ifi4JNitGvgZI4gk+SE7owhxMfGonRCH5OR6UqZ0EFkxEuMJpNHZz+5COGUmhOTpQHYkgfpTmcP8g4iMqokAaWAmMsjkjWe5uVh+r7AgmK5DhBrBdjURIjWC6BkzlclEwx9bdW/Roi6uvaYNCvNPItA/HHHRdVCQUwxbiQOWIgesJQI6dTDysitw8EAW9u3LwK7th7Hpjz3YunI3dq/ZhQiNCS0TY9ApOQ69OiThpm4pGNCnAxrUi4DOrEcFybRWVkZQPh1UHt6jjnduplqX5yzbmlR66Hhts0tF9cHW3AEdETc9kTYDkTejm9drEy/R2ODUu2AzulBOToSb0axbJ4x8+lEMHjsKMU0aQOdHZNND8Bn8Pv9uXNlfF3qB3BGyMk9g6dLfsG3bNuQRGeFCK3NlibARSeNiM3vlsDbPBt2nQ4agv2w9UcBg1CIgwJ8/WdC1VpIxlUoLEzF5rdmfnB8MdDSZSHAwm6jxKs7f4EeOjuQXaDYikDplgMf5U1gDEUEzh6XnufPq9PSqtWoUE9niuc6sFo2LjSa2rUduXo7ML6OsrFw+ZzYYYKLn/KlT+FMYPyKYlUeZRlVnpPCK8/M4c0Ag/IJDYAqgzkL5Lyu3wGKjlkWdJjAwEGaKh+vC21AUXssi0Slw/XG+vGvZFFJGNUf1a7FYpAGTPXv2YOHChcjPz6+8r9Tx5QG/Xx9x88GH/xsI6Pwyvn+vH6Lkr4VA2ZZ3cOdTS1HgVZOdBjs2TZwB4+13oxFPYdA2xt2juyNQDlMupP/4GebkVHlQE4KQoFNjmKgoR9lp8ZZh3+JJeO3hOzFi+HAMl24Ebr/vOXy65DD91J4BTTKGf/gDfvp1EebPnIz/PX0HOidcKhVUkyDmOa0GhjYP4ttpL6F7CI2hdC2cR7Fk1lqcvHxDqQ8++PA3wiuQa006qPVakv80MJLMqCen0ZmhNgUgoXEzPPjSf/HVggUY/OBYGKJjYSdSA61ebjKtIvKiIUJD/EexTEhyKotYbFZe7SKZldMgoqFlrZywEmErp4AlNICUErVwwERERbj0cKpMKCTmcaysFPtJbtuZdhyrtuzD7MUbMG3eWsxdvA2/rT6EjZvo3vZCHNxTgewjwPEDLuSfiIBR1wBlpRXSqF15jhrZ+4lk6RohpUlbNElpCLVZDRuNtQ4iMy6VDlae6aZ3w60tg8boIKeFjciYmwidlkZa/vymZwJE8iiTUhBZtdkscNiJ8thNNLxriTyWU/7VFMYPLVNa49ruKbC6c5CbcRL5hy1ECiOhKw+EK4fqNt8MR6YaOfuKcXx3LsqzrFDl2xFsUaFxQCi61k/ELV2bYmifJrimVQi6pASjcYweMQY3/IQNBhp1iapBOKiMRNh0JCtrqb6YmDExpkxS/bqlpUoN+1P98/53To0TbnJsnAVq4hxOKxxqN71DDSz0zgvpmE/yeXLP7hj16qsY8vDDqJfSnLhEANWBVpJX1rixjM3un5B1ryhx46mSWqqErOwsvPHG6xg7dizGj38CL7/8IpYvXy5JHENqh/jrA7Vuu91B59VlizVDTkncOE5eXMnWc1ifRH2AIuE5uBpqJEJOW3S6XXIurnAR9yaSKKiz8NHNKmKbFW5bObkKuO0WxTltdCTHUwvpGZfDBjs5JjeTJ3+FI0dSYSGhYvmK5XIBaLNmTXkZGYqKSogoEekkwuRmCzy8JT6vGnVYKE02v8rTFW0UnxUuiv90x35WavTkOD2Kw0ZxuZjxUuOwWOw0kLBWjNfZG6CjcvOXG4aXvHnBi1EZTNpY4ya1mpQGE+S83Bwizkvwxuuv4dFxj+D+++/D22+9ifT0NIpH0bhdTlT9GuGDDz7826FF8pjJmDQmiX646ZLGuGN/bsRxZSg6HQXz8en0E8hZ8BhukyTrNoxfXIgAnULO3IWL8MXUAzTGeaBJRNtWsXKaOkNkZeD4acTNH416j8aTt8di55wf8eOP5Gatgqb3k3ioVz3K2aVART/sntPzwG5X0w+0ku9zQR07FB98OBwJ0liKG7m/PINHphw5VT4ffPDhXwPvR2ceHthxr1Yc/eUpjizX8BIdEuyjEuti3DPP4ccFv2LYqHvhFxkLG8ltbq2OZFABP5MZrJ9iy4uStFVxGo9TrpmA0AnLq3SupEep0yDFth54CYz8gkTnap0RIAJZYnEhLb0A27dnYOPmo1i5ch9+/XU75v20Cd99vRz/fWEiPvlgJr77ZjlmzViLjesPYt2qTdi1ZSvSDu6HvaIMcZGhlDfAoBXQE5HRa3ktm5rGYtb88dRNXt3DWxcImIUefkTugqhsoSR7h+mNCNLoEajWkp8T4SY7oqluEonY1vE3oWlUOCKIz+xauwHbV65DyYlj2Ll2Of5cvBBblmzEwdUHkLHxKAp3ZsF+uAgh5QZEWvWId/kjURWEeIM/gkne5emmcBCRdFupLu0kX9spf8QDSG7lD4Gy7qiuNeSUeqU/dM4z5EgIlk7FR/JXlm0R16B7zAN4TaHdSeQuMBAWHRE2ImGlZn8079kLT33wIW6mdxrWIBnqgGAIrZF4CdUJ5UJpEf8suG1eVnC9ecGkgDfgZvJgJxKRlZWJtWvX4qeffsLDD4/Fdddei8GDB2LCFxOwYsUKpB46RAyeWPcZWiQGz61lMkKxyvuS5dJRmsenBq7XUfOiRmdjEuSykyPS5LTQS7LKl82ESkvET3npDnrZVo/jdXc2OtqpkRJpIhLH6/B0WrVMg82c7tq1CzNmTseKlb9j5syZWLjwV+zevQsnTpzA/v374G/yo1dJBSfS56wooUZkobQ4XRulR3HTUU11oHbxYk2vowbIjdDj1OxUVF80cKhZW8YDALVNNzUyb3lltcgGWz2407NmLT09HWvXrCHCOQm3jRiObt1uwOOPPYoZM6Zjw4b1SE87Su+D8kcd40qAyeM/8RXCBx98uEJQR+LG96fhxc7B5/nRcOHwt1NR9NgyrJwzHdOne9zcP/DrM61ofKUgNC5umvwFVluVJ0hsQNeRt6GJZIQ0dhzZgi0nzx7jdIm1EeP9WVBHo079v7CCTB2E4IBTvzHemROnoxT5RWZERF1ojFQjeuB7+OiO2nIZM9x5WPjsw5h02EfdfPDh3wav7HI6saIb5ORGzXQiaABkMuVSsb0FPYLjEvHICy/i65/m4b7x4+EfFiHlYCYHRmhJnuTpgCTDeZy+ijvlp4ZBpyfyxFocImws20qBT4HMAl0Sz4CFdQMuDRxCS9ck0bq0sNro2q4lmdFIMqNivKSiTIfSEj0KC1XIy7MjKyMTqfu348COzTh+8CgKThTCRBKqieROo9pOJM4FI5ETowiCzh0IPZE1vdoBM+XDn0IGUt5C9UAYEbcQvT8iDSGICwhFfLAZsQFO1PbXoBaR1UiNAWaHCwVpuSjNcKD4uED2oTKIUj05HXRlFFtFAEwlZoTaAhFh9UdoOZHBCgM5SsOmhdlCJNJmg4Hkb7Z0qXfzHnhukpGpJkhOFyTH877NTHiphiVBZomTOKji+Jwc+ykjOKtDKCzdM7jUVEZ6ykkvkspbTJVqIxm+RZ++GPXKa+g1+j7o4mrDERgCl9EPVoqBpHO4ibgqG2+fei//FC47cfOCGx2vWzOZjHItGpMKJl/cKJnMcVN0OGzYuXMH3nvvXYwbNw7PPPMMkaFManzVkRNvQ2bVrWJBUV7SHyaIHF9cTBRatmhGrglaNktGq5QGaE2ueeM6aN6kDpo2qYtmjeshpUk9uq7vcXxdX/o3T2mIdm1SkNwgEUGBJthtFoqfyBQ1nhk/zsDTTz+N9GNpqCgvQ/36deUizeLCQljKS6DXuNG6RSO0b90ErZoloWXTeuTqo0XTBuSS0CKlGkfhKh2H4ecoD02T6yHIzyxJKdch79PGpNVJ6fEbO7NTM1hly2GPHDmCp556Eg8+cJ/UsG3auBElxUWU53JJ6mQN0ntg6LQ8t9q7l9vp8f0V+DRuPvjwfxDmNnj6u48wMI5/KquBfTMmzTBg4PBEz4+lF1o0ufN2dJZ7CzA5m44J8/LlOUPfbjzef7CJ3HpAWNZi5qz0szVWNN6d+rGS378vHeoYtGwe78mjQGFeHglkZ6BiC7YVNUGbhAsRN4I6Cre88zFGeoy4uE8uxnMPTUSqj7v54MO/Cl7ZRfKDKo4h5SSWN+lcrk1T8UQ9knO0RJbIRdepg9vvvQ9PPvccAoOCifRoEKAzwF9rIPlQewGnIQKnhpa1bJQAz0JjWwResugmGZeN0fHaLQfLpCTDuSgPThpxHG6iL0RA3ERGbDYV7HaNtP1gJ+Joo7jslA87HTUaIoiUdx0NdhoidyqnGTo66ojIaCkNSYp45ppLR6STfJw0zpLcSSnRPXZElIjgqehcRexVOHWUjo6OJHvSsxodL1kqh0ZrRkmZQEZuKQ6ll2A/udQTVuxJdeNAqgGFROCcLn8afwOg5aPNAIOT6siphY7i0jl4zZkKZsqrkcrMhE1OeaSys1PLXwf+2Eb+VAeS/HK5KKeSAFNdsjNSvRo8dcuvTktOR+9PTwzYQDFp2dH7cau16NSzB7oNuxXhSY3gIsJmJyJnUetg1+ipvokQU1g2Asjf+Pj9/9M49Vt4BcAkTSFYwjM1hbVH8haBiu855w7Bxjuys7M9WqOzv4Ayl9MSk+cjT5HkBq1MseQFpHrYnRbk5WXh2NEDSD+8B2mpu5F+aCe5HTh2eCfS2B3ZhaPk0g/vxvEje3CMXNrhvUg/so+e24/Ug7tx+NAeHE8/CIetnDqwWhodYZLkcjtRVlYiSVRyw4bgPTBKS4sRERlG+c4g8laM1P07cfTgLqRRummplFYqXcvjLhxJ3UPHvZXuSBXH12l0/zi59AM76XgAZYV58osMiw3Msxx2h5z+eZaAQWCNI9eZ19AIT0EtL6P8U/3znh0aioDP+esE519DTkfXHPZKwKdx88GHfytcyM3NQE5uUbVjjSbxdkz85mE0NXk8KuHGielv45uS+mgcfPbPiiZxKAZ3NChDvvskfvl4IvZUDvMh6PbufHw3tg1C1OVY9cZDmLCrxjvGAVYLrDw1hsH7tVkuNK4Z0OW+h3BNCOfTiX0L52JHpQaQUYFtn05F2Z3jcN1py+Pccp2wN3YHpevdxUcd0Q/vfHI36km1ohv5vz2PsV8clOKFDz748O9ApezCshG5SnGVIBUGRCDYsezEH+5ZMcEfwvkjuLXCgp2bNmLmDz/AUlZKJEFDcmEFPeckmYuIjccxyVEcjYsex3KZ16Cc3WqVMrFXPuO/PBbLo5rSJwLlJgLFFjZUGv6YT47IFIcSROqYWBEbgtBZkdQqDrVTIhBa2w9aGrNZltVQvthugkqjo3P+eK+HWmOS0wYd9M8GC5xaGyqcFbCS/OuiNG0aizTcIUxqFNktKHFVIN9egnxLGTKLy5BRYkWpzo5CCpNOsmdaRTGyVMUoC7PBXUsNTV2gJNCBY04Hdubl43BpOfKJJJYQAXQZTHAwSSJp10FytZPqksuqZZnf61h2JfmXLaNT1ZGjdyPJgEtOReU65GmeWiqf4ihNWVaP43ssB/M9z5GnWOq1yrvev2cfjuyj8ZrX+VG0GiJ3bLeCId8ChXewupOu+B3909CkpKS8zF8Ybr75Zo9XzSALcyFQCV1uB4qLCrFw0UIUFxMjl0/yF1Ol+HzklWrynCqHCQiTolPwhJeNmF4fqyqJIfft1Qt1atemuyqs2boDm6jSg+PioeVNUKnm+QuBbMDUEOVR5aQjO2l7hl4MHykMheWcqOhaR/46dwVCjQIxwSYsX7iAmpLC6uGiZ+jgtNuRdiwNLVq0RMvWrREYEoIf585Fy46d4KBGUEwN3SF7I2WTGrzypYLSoM7OXy68jtP2Ou+1hjqE0UmEy1KArEO7EB3ohwE33YgAPz+kHjqAX+b/TASOOiz3eAmZczmgMHnjDbWlL3nLIFQmXhPHC2zlQMT32JvKFB4Wipv7D0B4RBSFp/qVTgY5Jy503ws2gDJnzhy5ptEHH3z4d8B6cAmmfvEWXvt8KdZv2IYC8jPHNkXt04iYCqa616GL+U8sLuiEMTfWpx/WXKz+5EHc8fQsHM5OR1oxCShBddE0wV+ON+687VgwcwZ+mr8C+wv5x49G5czNWH/MH43bt0FtnraoDkHjvrdjUCszTu5YgE/e+xprjxWgMDcdezcswYxJP2DJ7iIENu6K/qMewN19WyBaX4Adv0zHtx9PwA9bs+TXZYgCZOYCerUJcQ3j4DGGeRbUke1xY5cgHCNBa/eO5Zi37ChKrflI2/Y75n43A3uSn8BbdzeC0RPedXwtZk6fgs8mzseBIqUMIi8TeSz8BNZB/SgTzA26IDn7J8zYnE9CnQVHV6/EIU0S2naoi6Ar+onUBx98uBx46aWX8Morr7DsLqcm8njnlXuUGUskrZFwz0SLJVc1+WmJjBSdyMCCad/j49feQHbqYTluuG1WueSGZ22xfHU+MBkRTGL4RK+ByZ8tF/I2TiS7upgsCnmPDfSRh5x+yR/i5awsclK+lDIma6RIZtUJBEYCj706Cj0Ht0fT1rWwf/ch2MptFHcgevbvgYSkOCIwbmm93Cm1eG74heoQGmuAIVDA4KdGcblVpi2tZhq0KLCUw6UnwhpmQFCMAeYIA9RmHfLLKmBTC1RQ2GwisAGJOnQa0AAD770e3W9NQbue9dCuRwu4tAKHjmahqKQCep0eIYFB0Bs1cGkoDVYFMo8iMZatc+qYX5LsSvyOSCaVkwVwqkcnedjdWpSUOVFRapHWLtUON7RUf7IeKYzgE0/9KFVP9+ia/shr9uLaZGMlnFBBcSEOHjqEsqJihAeHwEh5Y+Ksl0uUmOwpMjV5UT4UefmfwBdffIFWrVpBddtttwm2kDJp0iTPrZqB2s0FwSpel8uO40R0Ro8ZjUMH9yuVxxXMVUc9g+uXza1yRTABYdLmIpKkTN9TYmGouVG7KQxVJOudPv7fuxh4S3/ZTCfO/gUvfvQFOg+6Dc2u7QFhMNDL59VsijlQqe5jrZR8XfwKFUYtQfHyLFn201G6fs4yROodMNmK8fDtw+CuKJeLM1lVq6fUmLj5B/hh7CMPITgsDCvXsnWf3/HM2/9DVNM2OEHSQ7nODJtKR42dW5pSUdwpucwy1ap1533/VAdamx1hRB5z92zEnAnvo3FCFL6d+BX8/c34+eef8ORjD8uvN/yIJyZ5xhpIHTU0h4ONt/BUVP7CQw1ZQxSVz+XXGwrKf6geuAE2btIEE76YiLja9WQc/NWI34EM4o36DFTyxQtgx44duPPOO+XRBx98+D8IImv7DggkN4qSY+flhQulx3dj+5405JTYoDL4ITiyFuolJyEx9C9tFlANKpC5czO2H+Y9kwwIiW+MVq3rI9Q309sHH/6/AhMzucUUHR0k7zE8kqqUnbyEjQQuxWgIWyMsK0Hqzl34/K13kLptBwxsXK6igjgOy1yKsREOL9e/ng8kjwqhg1VNUmqAHsGxobBYyiD4Qz3F6aQ4WJ6VWjnKHyvZWNnmdSTu0T2OR5Hf2IZJWH0dXv7qAWhCK2BSm7H46034+Zv1iImNxpNvPA6dnxZrF2zDxE9/gNXphjFAg5Gje6Ntxzokl9uRdigfkz9fiJJMel6jJRJlgIXGZv9IDe5/fACiapmobvTY8ecxfD9pCWxFvOZMhYhEI4bd2x7tuydT0c2oKLcQ2XHAoPGDrSAI86duxOo5y1BLY0KXeg1hdjtg5K2OdU7oDQrp5HV3JtaYEFl06Ym0GVzQELFzUb1XuLQodhiQlmtFflY+wowBUJe7oLMTZXUQsaPHXCzLcqUQ6WVuRrVEz1I9MuEgJwkvycK8LzTvbOMyGVBO5zatDmGJieg6eDBiWjSHNjhU7qksePqsRzHCW0P8U8StefPmGDVq1JUlbi5qSbz+LOP4cTzyyMPYuX0bvUildcliU+XxkRnyuaEk5Ob5tlRhTvqnNWjw4P334uEHH4HeFIiFf6zDg8+9jJhmLYHEhvIFCB39wKu00Lo14E2++eVJIklSBpM9XjHBR36hFBAapwNmips39wumhtOjXQt8984rOLhzB5E2alTcAZ289Tc1IGpkLhWbE+XvH1p0vLYnegy/A6v3H8WRUhsc5mA4eCEjxc1fQ/ifnTVv1Dk5H2qqAqaLnC7zRzc3MvrHHzX82dJkxn4cXbMUN3dui4/fe4+Lgc+++BzvffiOHAC0bHKW/p0Pyro/PuE/HFYJz9YnWTvXuXNnfPDRR4iOiZODC89/lvmh8Od6HTUlblu2bMF9992HzZs3e3x88MEHH3zwwQcfrk7wVkpBQUFyP2HeSZfBu3tJyYgEXsELnFwkKzFpIzk2L+MIfpk9DfOn/YDS9CwEUWi9g/fLtctZTuUuJxEOlgHdJIPK6CrBMpcUzTxQkSCoEnpYJHHTITgmhIhbOQTFJYhUudwULz/Asizlwes0HseyIwvlUtFEGdabdWh6Qyzue6sn3MG5JMPqUbhPi28+WAL/gECMemoA9MEqLPl6N3745jeUVQD1mkThhddvRWB4MZHUcsAegy/fX4o18/YhlNd6uY2w6Rxofk0Uxr14I1yGY9BqTbAUhOG9//6MA+ty5LqyTjeG454n20JtAv5c7sKvc3cQMdOi/y03UJ2VYcPKXUjfsI+ImxFdEhsgiOrHRORMqyXibKQjCdx6Esv1bLDKqCPiRpK6niRt8uftFZi4FdmZuFUgP6cAYeZAaMqJHNtJOncIIt0snyv1y9Mpue55TZ6TTuwa8uc69r4T8qeI6Z4aFrY4rzfAZfZDidmEZj26o3WfvgiqkwhhMsFNYXi2n1rFa/qYN/z98BK3y/+xtAq4cTKrZWIYGBgkSYFsVV7IHqGcnhtKIF4vJzfmphfCliMPHjoo91bjOalhoWEwaunFVJQhMSIYTRLjUC82DIlRoagbF4k6MeGKiw1HYlwYEhJCEVs7GHG1QxBbi10oatWNRDT5h9P9EHL51gK88Op4NGkWD62mmEhbDoJNFTCqC4l4FRABKoBWb0fX67vhgXHPophou79fJGrFJaNWVF3UjWZXG/WiEqWrG1UHidF1UIeOdT3HOuxP5/WiE1GHXL24BNSrHQczsTOXzYLacbEwUAu2WSpw4MB+OY9XfvG5GHB4WYUqqfJWplOq5PvgLQauBHzGSXzwwQcffPDBh38LqsotQhIh8mPbAXThEg66z1bKbXBXlOLg5g14/YnH8N3//ofSY8ehF2xjwA67sMtpf3Y1EQkDC14CTiJbLhL4nWoNHCTws7EQK8lgTpLFHBqS70hG5mU2ViJ7Lr1O7inmVFN8WieFoSPJvGqXGnqnDjqXhj/xM3+jODleEk3p6FRTOuxHzk1+LoMDCfViSS7WQe1Qya2topND0HlQY/jV0UATmE+cJRfF1pPgdbjGIBWu7VsPAdEuWFwunCzLhyagGG2uSYbWnw2cOMifiBPF27l3XSAgh54txcmCCviFGNC5WwOYQ6nC/Oxo3K4R3EbWSmowf/pKHN18AgfXH8V7z0/Bl//7Cbs3HiIyqoZO40cEmI/kqN70wiKPGiJVrNwQXEgirMqyJ8myiEOo6V14TJTQbYfWgDKVHqXEMYpMRpSajbDQuZ3JGNUra94cxA3KzWqUGYickWxt5Tqn92Gjd+0y6GCj9JxE2gxsTZRi1jgtMNtKsXXJfMz57D3K/1o4SvNhc1hR4aZ2QGSQFVBSM0ttRlFG/b24osSNweSNO0NoaGjl9aVAbi1AnYh5NNfT4aNHkZmZKYlMfHQUosNDUZSTiSQia41jI9C0VgyaN6iFRnVjyMWiETXihuzoummdKKQkRqEZOT5vSscG8eFoUj8eDerFoU5iPIz+AciyaXHn48+jaefrofILRJHVTh1ND4fOnxp+HLoPuhv97rkXx10WaGJCEJdSH/GN4lE7ORq1k4goNghH3aQwcuGolxyFekmRdIxEXY+r11C5lo7uJSVGIykuCoE6IrvUchs2qCcXZOZQOY8dOSx1g8qmdZcOZTqkQEhICJG4K/PVgBuzzziJDz744IMPPvjwbwAvMfHKLVoibmylkO3n8rQ6N93jvXeLT+ZixqSJePjOkdi8/A+gwkEyGT1LclUFEahSvUa6Mo0K5UQcrORsOj2sTCZMZjjMfnCTbCkCg6AJC4MpJhaBtWsjlGS9Ou1aI7lDG4TGx0Jl1KHcZSXiRqRR7VLWYvH0LHJSBmZyRmTGQaSOSZuDRDm2bs+O14TZKWhYnB+0KjuExY092zNQ7hBofm09NOpAxM1UAqfVhtw8Im70QECoEW061aXoHdi46Sh27MiBRq9Gkxb1EBYTTORHizKnFsExAajTJBJsnnLtuhzs2cPbbxnQon1dRNfzJ/Lphl9EDGAIhJ0y6bS5IWwaIrxUl1oTAkMjYA7WQegF8iuKkW8pgcVtpTKSXMuz2Ig48fo0nhLpYuJFZRPM4qisvNTJSW/ETqSrgsheiY5IWUw0wrp0hLFdG7iaN4alUQMU145DcXwMiqIiURgejpOhwcgN9EO+vz+KzQFE7oJQ6heEQmMATlKeysyBsJB8X0YkkPfh443TQXVjqrDh5J79mPH+x1g5bTYcx09CV+qE2skEkugzvXOWoZnA/d24olMl+WsFNSO5sfQnn3yCLz7/THYOeif0Chj87cD790JQNEa8iJIbbGRYON589Q306tkPpXY3HnzqKSxZuw7te/SFX1QUyjisVi/j5kbDkwt5fitbyNGxIRL+esD8Wqo8NdCq2YSqDVq2UkPEyWnnPd8MSI6PRoNwf/w6/WtsW/OHJCXG4FD0HXoHWna+BptTd+BYcSacbFZUZ0QZdQ4VpcslYlWsnGJJcHjmGXL/k2eeFy+JFF9ShZpd1BvyC7Btyc8IgxVTPvkQ7Vq3xtLly/Hs88/iZH4OPcvElSpQieWcqJwqWRmO51xz56eaoDR5+4UHxo6FkQYT9r+cUyV5T75XX31VbrLugw8++OCDDz74cDWDrXE3adIEubm5xHzYIAjLuSSvEklwOaw4tG8f/kty5sEdO6Em6Z5n8vG0SJZgeRkOO7PZjIjISETHxCCxbh1ERkXDHBAAM5E1nobJM538A/0pnB8MJiOMFN5gMBBJ0hMpIZnVVo43X38OG9cvh3BYIIgssulaxTQ/yaokt3LGeOqm3EyajlKm5HmUxB/4nL/H+0WaMPb57ki5TgUbybYvP/8T7r57JOo1UUFnPErxEukpisF7L/+O7ZtzceOgNhj5UEeUlhdh2nfL5cys4SPaI9BUBzM+34j53/+J8goT+t7eCHc91hxaPyveeG0O1UEQHnpoMMwmJxbP3Ihvp/6JW8f0Qvf+MTDqrfjsxa1YvygDVmsFetzcEsNuG4Hy0kIs/n4e9q/Yi8aBYUgKCUGYUQWjxgG9gTcZ15HTQE0VrNGTlG50S8MkbKjEqjWikFhjjtBif0EpAhq2xogHHiOZlacwkvxM8rdw0Jsg+d1pscFltcBls6OiqIjyYEN5eTm5CvKzwV5WjpPZuSgsKCBXCFtxkTQ0w4YKWcKWRv1Ili8hUdpu9EdwXG3cNOJ2JHZsAW2QWWra2KYEkzeWqf8OXPE1bkwG2Hw9W4kkvoTZc2bj6aee9Nxj7izPpMasalySyHhIDUOSDQ+Y1zL54mmprNZ8bOyjePCBsUTGdPjvu+9i6oxZuHXUg2hzww2SkduJPfNeGzy/lb+aOKlr8ZcLHeWLjY2wupUoC8Wq4jWM0NELYHLCX1fojK71MLpskrhZc4/hg9f/i/37D2Hg8DswcOQYFFPnPV6QLdXCblZ7U0GEJIJsep8aHKWpZT+On+dFU9ze18tHToOP0o8/KjgAS24eXh//MJKjQjD5s08QGR6ByV9/gw8//hDWilK2LUJ993TiVn2j8dah955C2FzUwVkD+vrrr2PIsKHUIRSrOV7H8BzOQk2J22+//Yb33ntPHn3wwQcffPDBBx+uZvAMrjZt2siju8IuCQQLr1ZLOdKPHMWv83+CvaQcCZFRCPLzg5mcf2gIEbJAhIWFIYCImd5kIEGJ5DP6L/goQbIXMQ+WZFn5wIbgKnU0JFPJ7a3oroNkTYelDO++9jx2rlsJZ3kxMQabssaNFQ0kQKpcRBRYOcWRsb0CelZuFM6Ejvw5Rd7+yT8yEK98PAIJKSXIL7Bj3IOz0CwlGQ//pyt0fruJ6OmpLIl4YfwM2Gw6PPHszYhKrCDZj0hRphZOZzmi49mQnQ6ZB4x44z+zUGG3478fDUNSS+a1AocPkCypMqNWbQM9l4/iLA3efvlXhBJZHfdcH2iNx5F9RIfFc3ZBr1fj+j5JiE+IIxnXH5+8OBmZW3PRJi4O9QJDEUKFMmrsRNx4yRmlK0kbO5ZXqc6okCp6HxatCXkkl58g6XlPURnM9dvhvvEvUKm1VMe8+TjVj5r1pLw6kd6BJLouqkO2Lu+RhlnY5zP2cNKbYBndRWFcDkmU2eBMCRE9S1kZLKVlKLY6YKF3UGyxQ2Uyo0H75qidXF8asmEwgfOeX2l4idtl3w7gdKGfLR4SSdJp5f43v/6yQC4A9VYgEwXeY8FJFVmVoFWFl1DwfTnlVWmZ5EeOKrxj+w7w9/NH+rF0bPhzAwy8o3tMDIrKqcEWFaCI2HRFcTHKeBPq0mJyRSiuKEKBpQRFFcUo9LiiihIUkH9+eZG8LqBOU1RWSPEUIi0jDWUuK1pf0wnNu3ZBRFISth5JQ2YpPUMvs6DUjqISK0pKbSgtsaC8uAJldCwrtqC01IJiOi8srKDGUIFidnRfHovKUVJYLo9lhWVwUv6yU/dj29oVaNOkIW7u2xd5BUX4+pvvkXY0XY4HrLHU8BcJuvA6Bh+9deWtr9OhvBg1kVMzNb57770X0THRSj1WeY7+nxPnu1cVBw4ckAZKbrvtNo+PDz744IMPPvjgw9WJwsJCfPPNN3jssccgtGoiVzy7i0gDyVsBIUFo17EjOl97DZq1bokGjRqjbpMmiKtbH6GxcTCFhEJtNkMYjXAZDHCylW96zsXkj87lLCwW7vmcHSsVSO4WWrpPTmjYaiHvG2zFupWrkHX0KGC1Q0tCr3C4iGsQuSC+QbREHhlSwiN/EvYkkZOOSBsTw8DwYNzQqyvJxkE4dsSCRT/tQF52CYIDDWiYVJ8IipmImx+WLdmM9h1boW37OjCYXCQfk3zpCkRIUCjJ7W5pECSUiFV6egZ0ZicGDm9G5SiGy2aA2hkFsz6AnsmFn1kLk5HK4A7D6iWpMECHBknhCA3Wo037FKQ0r4vAICJ85eVY9N1a7FyVhlCVEUkRdXgbbhhJjNWxAT8NOTWlq3VCryZHhE1H1yzlMsF16RTrj4VU1lybFQHhtdG6/bUkm/JOb1rwXs8qNdUz1ydb9WPHGjE/8mNSzRbnDXq4DVqojXTtbwLMRsCPjoEBECHB0EZGwi8uFoF1aiMsqQEiGyahVmsia21aoF7rFIRGhEktKcvYXrnbK4dfaVyx7QBYuGfOwIViq5JM3NgKT+aJTDzz9H9w5MhhqYXj/cV4Oh8Xl0mxJGbEXKsSjjP9eL6rnV6P5MtCLXelb9uiFbF0I3KIpG3fvQ8aYzAaUMHcQYFQ+fvJhaEaYnus/eJYWONWQQ3BRiyeUpDlYD7ChKYqM+Fd6F2CXqzDTo1TQw21HNERoTBR58zMOSnn71p4MqyKSRTPhlbiI6pKeaN4qBdVxkZp82RN/itDeW5wR5NfS/jIau+TGcjcsQEaIo6xIQFIadyUyGc5du/dD4vVQh24AkYDbzPA8StxMM6sNwZfK8XxBlRUuqyurF27Nj77/HNERkVR56QGTQEvRNoYNdW4/fzzz5gyZYo8+uCDDz744IMPPlzNOHz4MHr27CmPFXLiogIWe6T5eBLcWFZjSY6P8o7HuiDLdOx4ayuWT73XHAkvnNHKC3mpREiQYZRTRX5zO2EtK8bkjz/ELz9+Dy3Je24LG0RRthWw2Uj6lTPIKDwJrioSnOX8LiZ0LpKlyZ83luZ/On8dohKCEF8rCg4HsGnzPmmZsnHTKIy6ry+CQw0oK7Hh0w/nY9yjDyG2tj/s9lx8+P7XJKuXSQLYplMCbhvZn+RONQ7tz8TJvHx0uq4WlbEE0775E5vXZkG4VBSXwHMv3gtDQAVKc4Px8rjpFHceunSPRJuuSTCbQmCz+yHjcAa2rtmMwv3FQJEG9cPikRwZhwC3DQFGG/T6CiLJDqltM+oFXVP5iGBBT6SMSK1ba0QxkbJ8nRHHnALHSP5u3m0Qrr9lGL0GIss8VZR3GScCRwWQ9crvjWtZkLzP9S3JrbxzNtxuJsU8D84TxhNYGkGRR5bfVeAU/ikLDldsqiQL/1xX3NDkxn2CGh2TErqRcSxdaoyYtDGhY8cVK7WZFMbrvCRExlF5zevTACuRPVYzq4iQmYlNu6w2ec+tUUlzqTqVAQ5i0hU6nVwsynu/8Q72Gs4wx0+hXdwIKDynLakUvSC5JszDXNiX1XvCpZXaQG7EWmpAduoBsltSo9BJRk9xEBlyciei55i08RRJQS1Edkr5omWEipUcOmWNId9jcBORnY3uMbFUVZRBby+DUThg4hsU0OnWUlZY9ctl4/1AnIrW0ROHF5yX0yFTJnj9T61x47nW9evXl3nX8hchT5izojgDNSVus2fPxo8//iiPPvjggw8++OCDD1czeKbQLbfcgv3796Oc5x0SpMjjEaUUkb6qRKU4BsuVUuZjEUv+YyjyH0tY/IHeC6/8x17yGXlBYaXpfzvKigqwaslCLFkwD4d274aztJypCNwOkn3dDilTs6zp/ejP0yRVTp42SSl6/HRGTkRDcmqA3MtXa7CT+GuHVqtBYKAfDEYKTEJpfp4bCbEJMJLMzCb79+9PJRndAZvLgci4QLRo0xR6VhpqdLBWOBAYDJQUF2HTuiMoPkmyK2XMZq9Aw4aJ0AaWEsPRIWNHOYTVRQSsHBp/yhPv/1aih8ZmhJHqNRQ2JIREIiYoDME6Dcm6VpiMDplHYrhSM6nTq6ExUplZ7ua9AUwmktuNKCEaXGbwgzoyFvU7dkZEw+ZQ+QVDQ2SOqodqRQs1T5Vk2ZzrlWqX3xGvR7wgnBqoiKQqT5JjXsBCL8XFCh8mcPy++H1etHX3y4S/TNyYbFUHLo9svJIU8ZGIDP8jciPcRNrkTW5hSlhZfqoNrmgmelxpSnjuClRBUhVJdIhIHhM2Jm/yqwOd64jBMPliuxpOusvRMu12UOO0UAgL3dPqDLIhK/toELHiVY6cd8oPx62ml8Nx87YFMlKCi9LmTsELFVkTR32CItBIYytaasVcDv6ywQnyBn4UiEgexc1+FBdHz5lirij3qKMT3uKbv3jwNE9lnjOlR+lwSeQXE2ogTqoHu9MGE0WplYWhu2zFkuLmKaU8B1enVeqHyaOX0MrkPKpamXfKK+dRKQ//URyrmuXUSIqXCbFGRw2cCGhNwDHUlLgxaWNt2/Tp0z0+Pvjggw8++OCDD1cndhNJGj58OHbt2iXlSSn1sGxKZyxrsUzKEqp332GWxLQsXHrlIkUUOx3sx2zKc+o9SsfRe33pwm0lmY1ImcVWQURGh9LCfBzdfwCbVq3BoR27kbpnPwryskjcdJJMS0SNCRs9zto2eU5OZoccEyoDESa7TQ+T3kiSbzFlk8okdCR/aqHTqUmuJGKlo/KRUK11+8Nh1ZDsSCVXlRJpYsN9JE5TWd1uK3QkN+pgJvnRAZfDSdd+LE7DYLLDZrVSuoGwqXQkF9sQ5LbBSJkIDCCiRWHtbiMRSx1CjHqE+2vgJxwINpphJJnVRIK5n5nqUe8kwkZyKe8czvsPEGFz0qnDTITRzwA9ryEMj0VYQgP4xyTCFFsL4P3bjH5SbtbqTHBIuVov65Vrlt8PK1L4qJOS9inIWvd4eN4Ai+PSSc0q3fT+VcJxKHpbfMkydE2F4cuMv0zcWLt1IQg5JZLJkkIy0tKOYPXq1SgtK6EGQoWnRsF9gK1paolAyM7hcQzvc9JRPBxeTmnkCiQS4nQq5lu9WjlJhiiM8lKomVLEvMM9Vz5/aeD1dRyG/ZiF8N4NTCz5mv2r7pyvk2SMWDadK1ZjlPu8HtBmo4bM+23YHdBT3Tkc/CWDebiSB86Lk8JKIsf5ofxpqbwMJZ9EBtniJrcSuu/m9HSULpWHSR0vLlU0aEzelGf4KwvHwdo8flRL4TlezhM3LN7N3ZuugefwOqwUB9UE3ePmy3XC6bIVyWuuuVZOlyTWRp5cn+cH54RdTdvqd999Jw2T8NEHH3zwwQcffPDhasa2bdtwzz33yCMTKIUBKEIPiVZS5pReDCmfsSzHBI+h3JB/ObCE51mSw/g5RZpTQD5SJqsEXTitDgqj3NEQsWL5UE6xtBOZstiRdeQokbc9OJq6F+lH9+Pg/h04mZdHz9F9K8mADhWI60BDeTcSIXM5iP/oA2ElOVWnJfmR8qFyE5VxKuu/hNpBcmSFLKpORWTJaaDy2CE05ZRfVkDwjC+2uE7lpGfVLiJglE8WZbXQQK8jQmS0UFgqmSOYwseQrxXBulwEGrn+SCbV+8sZY0aKw6QqJmelZ5kAGqU8ypts8zIzDeVPZTDBaY6A2j8WhsgI+MUGwxwdAXNMFPxjY2EMjaQoTRQuEHa1AS6SgY2UIi+FYrmZZVlWlng5AknWUrEjGYFH/vaCfLyvR56z48mxbMCQ2IC8pRG8xEpSNwrgiYcrgORmRT7/+3HFrUoymJBwlTChYPKzfPkyPPvss8jMPMEKI9n2pabNRQ2O8uAlYExG2LGfJGME3lKAweE5Lu9miUzG+Bk2w8rnPPWPn/VWrJPIEJMxbzz8HN9nU5+8AbWbiBvfKysto2vlWb7WERFjSz52O5MyaqayMTD5qUImyXGe/f39JYkqK6cGTxXDxInTYecfEEAEkc6ddvj5+aGsrEyGZ7Ok3j1DOK+cT6PBIP05PaUMSpOSdeR2wmQ2EVl0UVjqMDqtTNtOnZLridXbnDfekJzzyktrlYbGMSjEjbKL6OhYvPnWW7j++ut5XKBGXjONG6OmxG3q1KmSoPM6Nx988MEHH3zwwYerGZs2bcLYsWOxceNGj48HVWXds2Sgqjc9ONPL80w1IU8DUwQlzKmQ/KgkjCxvksDmtpMsaKkgGa8A6/+cj917d8HPGAFrkRpZB47h+K5tKM9KI5JGMjTJtiVWkhEdLAG6oScSoiXZUSMU0/l8X63lKZRsh4JkUUqHN8Pmay0rD+ia0zfqSX6ktNkwCm8TwPk0kOzscLICg0kmheO4iaiZWa5W8XROp5TFOWU1kbYAXrPmrKD7VDadAXZTIIQpBOZAfwSZVAgN0CEoIhp+DdrCWL8djHEJ0PuTzM1yN4UXFC+b5hcatvHA2kBFptVxWeifRHXyqbcqq7vnwana5nMu8+mBz/Po344rZlWyKpgUycZGjonIsWPpcm+v0tJi2RCZrHAjiYqKkZZ8hg0bJs2xVlSw5cVijBkzBoMHD0a3bt3QtGlTaamQ12bddNNN8v6QIUOQn58Pq9Uqv5TwMSc3V8bF67j27t0rydGAAQNkYW+88UY0atRIPlNcWITxTzyBW6jcXbt0leTq6NE0+ZIiIyLw4INjiTCpcfz4cUmkBg4cKC0x9ujRQ8bB6nTGHbfdjnvuugvNU1KQmXFCNqHBgwbBarGgoqwco+4ZRaTTiuDQELnwNScnR+abyRvvF8Jl4fj5mst56OBBWS9M1tiIC9c0119K8xR06NABqamHPHWqkGImm71795JELicnm+JiYumCNG/qJZf0suQ0VCqPyeyHXr16KRo3gtQ+1rBperjwBcEDIJeTy+aDDz744IMPPvhwNSM9PR3Lli2TsuJpYLnH685C1Zsex4JSVefxv9A/xpkhFR8PKC5WeLCJfN6sOjg0Ai1adkVKi2vQpkMXtO3QFLHRdjRubESj5vVRv0kSmjavh+RGsYiNNCE0WINAP+I/WiJhOiJnRiJdRhXzIoqU/A0UL93jDa+FmteouaUGSqMnWZP83bwruYaczgm7sMEYQCRSY6OwTuhYw0aypxsOaM1E1yiPxgAXkTEVQmJ0iEjwQ3zDSNRpHoe6zRIRk9IQca1S0LznDYhKTkRYnQTo4mLgVzcJ5sR6cJKcqvUPkFYgiRlSGkQspWPrkVQJVBFcP7zESSppqlTTaTijCquDN4jiTtW6111N8FqV9FDVSwFTt/M7XnfFpEOZaqhoyrxaKnbs59Vm1alTR5I6JmS33noroqOj0bJlS7lQlP2Z0HXt2lXul9G+fXsZLiYmRhIqJp1JSUlyA8V69epJssfkiMkba6EaNGggNWdz586VhGXggIHwN5nROLkhtm/dhrTUw7h9+Ag0apAk5wi3bdUa3bvdgL59etPzXBQXUpo1wf59e7Bk8UI0apiEHt1vQFKD+ujTuyemT/sediJq/Xr3htvpQNvWrRBGRM1AZKp9m9aICA9HUGCgrHA2I8rarhEjRiAyMhItWrSQZWLXrm1bSXC9RJfhJV/RUdGSbUutmkv5osGOlbutWjdHfEKsXLgqQM+TP9e/91mv4zh1ldo8lfRTcPp7q97VHF5tqA8++OCDDz744MPVDv5g7p0FdbWB5TU524tIklvtYJaFwOA6MPslQqUJJymQ5C29DaWaLGijy2GI0yKxZSIatUlAcpMAdO9Zl2Ti5hg5uiseeKwn7nu4G+6k81vv6Ize/Vtg2B2dcPPgNnTeDDcPa4NrezdEl16NcW2/Jmh5TT20urY+2nVrgLY3NECra+rSvQZo0TEeXbo3RLd+zdC1e1P0HdwRPYd2RN/hnTFs9DUYdGcH3DKiNXoOaYZWfeoh4Zp4mJuFwtQwCCJOB3uMASYilv7tWsHUrh1EvfqwRoTCEWKGKsAIt14PoTNC6I1Q0ZHtPfA0RbWKtWzEKZht/n+KSyZurKHiNVk8hZGnRPI1MYHTHBMDJiFVyYMkC55GSAd5zUSCrzMyMnDixIlKsseOpz+WlJTII5MvbsAcvrS0FAsWLJDEh4ne77//jpMnT6I3kSfWzHG8zZo1k+E5Hn6G42FtHmusmFzw+Z/r1+OHH36Qe3gweeS0mTAuXfIbXSfCz2yWJITT547NcRQVFclwvNaN1dgdO3TA3r17sGjRQjltkV3XLl3Qt29fhISE0PPU2Dx58BKaxMREXHvttZXTONnxfW8dcZ69kPl3K4SOwVo2bx1Vrb/TyRg/x69XVrLnmsLTkfOgPOO5R67y6wKdc/14/fjc5XLLstcUV/MA6IMPPvjggw8++FAVLBNejXILy3VepybiIlS8F5wf3MIg16CpjZRnE5EaPz9UqE0whCeiQfuuaHJNZ8TWj4XGYIVaXwaXrgw2TSmculKYQhwIj1UhKtaN+g0MiKvlRlS0FckNjYiLd6JNh0g0bRmCFu0i0KpjLFp1iEGzluHkQtGyfSQaNQ9CSttwJBEpTGxgRING/giNt6NuswAExrqgC7HAGGwFjMVwaIthNxFHCA1EMeUx221HiYFk+8AA2ANC4YyoDXdMEkIad4R/rWS4tETaiKjZiaDZiaLYSRzlDb958Y+KCCrVAv1j2ubVj/3/h0vXuPF0PHJsSMMldyVnSsDEoqoTlYSESYO38Z2CQjSYSDDBYRV1nz59sJ7IFBMkJmqsnfrPf/4jp979+eefsnNxnIydO3dKx9o3vsedjknXwYMH5fMpKSmVRKlJkyZ4+umnERwcjDlz50DNc2Yp72whiK1FWiktI5G0hNq1UKdeXWTl5sid07t27iS1aAF075ounfHEY4/K+b9r/liFI6mHMGnSlwgND8XQW4eiR68eskb1Rj3FUQctWjZHQFAAxU95pnQ4L1wmntLJ5PKaa65BRESErBMvETtF4pwyvJec8Zo7DsMN1eFgQyU6qncmbTxdkg2kuKi66Tk2C+v5EsH1zs9442RwPrzvgZ3cmoHSUvbV4zhYE8rkkck4rx9UtH+8dq6m8GncfPDBBx988MGHfwv+FXIL7xusMpKcpoNGrwFvW2Zzl8OtdqPCZUa7ziPRvss4xCX3gC4wXq4jc2r8UOrUokxjBoIjoA+PgEtPMqHeCYO/A0FhGgQGuxCboENoqJ1kUrYLkQ+d/iQJjDkkV+fDz7+I5Np8hEXaoTPkISi4AoFBVvKvQFi4CoEhLgSFWKExniSiVoIyVTk5O5xUnw4imiV2IyLrdkDdVv3gF9McblMskbNwuNTBlD/KjzYGdk0UyePhJF8HQU3lk9MieY9kknXlhuUqkm9ZseBx9Edx/x/ikokbE5CC/HwUFhZIx+d5ubmnOSZbrJ0qKCiQwr+XQJxJ3phc8LozNmoxfvx4aUqetWGsuWLT8gsXLoSZmDo/xx2Lw/OL447GmyUyUWMNHE+d5PVnPKWS18QxWQsICJCpLF68WJqn5/R5vReb9XfyOjGNGsFhofAn9p+bl4uUFi1QL6kBbh0+HMkNk9GrZ08E+PsT2bJg7pw5+G3JEoQQ+TPo9WhK8ddKrI033nkLvyz6FY2bNZH7veUXFWD6zOl45/33kJ6RTg1dXznZkPPPdbFy5UqZ58aNG0sNlZegcZmUclJDpevrr78BN9xwA/z8zB4SRmRO7lPB4VXQs/lUOvJXCKPRRM6PwmhgMJgoTq2sQ7Y0yXFx2anJy/Q4rqysLFnmPK+jd3byZJ60VJR/8qQkxOxfTO+Q30dN4dO4+eCDDz744IMP/xb8e+QWlp/ZuelgJxnWCrvKAUNAGMJjWhK3awiHiIEwRBF5S4TTEI1yXSxCkzqj0bWDEJLYHFZBcqPOBLc5AGXChQqKy0Wc1a1xw2DWyH3ggsP8EBzuj4AQAxE0DYJC9dAYnOTnBxhIhvbXkzPBTizCSfK00LhQ7rTC5ReEgNpNIMLqI98eCBuRMgtioPZvCG1wc8Q37YfE5BsQHpYMjTsQOpCMLvzJkYzvNkLrJlIqiCuQXOslKNI6pFQqnFIMsSz7/ysumbht/PNPPHj//RgyaBCGDhmMEbfeiluHDq10w8iNGD4CQ+n48ssvy/VnTB7YMTHxOp6uxyTCYrHg2LFjcrojkwS+x/58zYSLyRIbBqkkIHRkssNhmESy69CxI5YuXYqHH34YjzzyiCRtPCXRS4bmz5+PzMxM3HHnnbBRJw2PjsL9Dz6A5158AaWWchw5no42Hdph+owZGHPvGDz26KOolZBAhDCa4rehqLCQ4vgZFsrfdddeI+Ptd9ONeOyJx9D1umuIpB2D1WGHWyVQTkTP7nLAQeTQ7lQsTHrJK5eVrUv+9NNPcoom+7HjgYOnTnrDchkTiRjed999GDBwoCRaTMTuv+9BIo3NpYVJ1q7piLwNGTIcLzz/MkbdMwbJyY2kYZeIiHCZlt4zGMm6468WFDdPSX31v/+ldzVEvq/hw4ZJN3TwIM87HIIhdH77iBF44IH7sW7dOhlHTcD59xE3H3zwwQcffPDh3wCWW67+mUJMWpys7pAf7FmEVz7ky1O41CRjE4mCLoDk0EByQQiObYrGXfojse2NUEc2gTuwFmAKIbJnRIE7ACEN2kEf3QBWbQjKVX6w07M2jREWtRF2jRluvRl2nsWlM4ON+VcIDRzkVyr0KFWZgaA4lNOzVkrLrgmDxVgL+lodEZHSD6bETihCFDQh9eA2xdFzsXAY6iA4rgWi4xtBpzVBxZbQZfaJD6hIRqbykWRPpI5kfComO7lvHfnJcsudxl0e9/8nebtkq5JRUZEwm01Yu3Yt0o4elcSsoCAfeUS0+MhaNuny8+U6sT69e0tT90t/+01OY6Qap3/UDF3MnN04ln4MR9OOys38qEVKEsPk4sjRIyikeLZu3wbed+0opXXo0CGpzWOyxib4mfAVEAHia55myeSMNX0cji03pqamSs0cnx85QvEVFcr0eFuC1NTD2Lx5MxYvXITC/EJJpDZu2oTME5k4mX8SaWnplI9MHDt+HIcoLGsGd+7eTfEXy+t1lB4TyG3bduDneT+jpLhUhj9+PIPKWYqszCyZ/smTBTIuXsfH+T10KJWOx7Fv334cPHgI2dnZ8jm+zySO4+TeeJjSOJlfQOH2YSHl0Wq1Ue2oZb55CwDWzGVlZcv6yDiRIeNNo3qssFYgLf0o1BomatTQCUySeUuBbt2uR2RkOKZN+x779u6juiugOuayF1D5ClBUXETvrUDWQVBIMEaNGkNE9Vr5vmsCXm/IbYrX8Pnggw8++OCDDz5czWBL4QcOHJCG7a5WCPC2WDZpfl8lmGRq5VbhdrddEhmthkkd24JUEwnSwKDTIDI2HubweJTCDIfKRGQJyD12iGQ0NaKbdkRs/abQG/2RkZkNoTHA5iL/OskwB0egsMwGt+CZWhpoTAGIqdcQxVYXrEIHu9oMQ0A0Yhq0gNYUidJSGxzqELhDkhBRvz20AXHwC4mRJBLGEIQkNIRLHwy3JpDkUoMknnLpDsmlKrbHQCRMLUkZK1q8DIHF4Co2GBQvAsu0HIL/1VD/dCGOVxn31QuvVclL3setrLRYarvY4uPbb78tzeZ7tWnsz0cGn3NC77//viRdL7zwgtQceTVnTNDkZoNVwBohJi6sfeJwbInRZqOXeUbNVk3HmzY7fp4hyQ+Bw/E5f1HxarfOBIfx3uNzjk+r1Sv5o2f5mted8TTEqmB/730Oy+A4vPny4sxrbxpV869oH5U97Bje/LD2iv15yqNMy608502by+WNj8mrlnqm7ACycZ8C34+NjcXrr7+OWgm18Pjj47F9+066o9SbN04v4uPj8eijj6Jb955yDzreK68m4L36WNv5zDPPeHx88MEHH3zwwQcfrk6wkbpff/0V06ZN8/hcHkiZ6oKKIQpQA+0RKzn4r0qQHEqEiuFWk2wqLYmTfMhyHMvJvEaM0hVuG8mQyrRCB4VxEcFz20qwd9s6REeGITyxAfSqUris2di2bhkqSisQF5uIOvXqk0xZhiOHtqIk5xjUbhXqNGuNsMRknMhIR+qebTBR/PG1khGb1A52VRCKjh/GISK+UXWaoU7D1lBpeaNtYolULLvTDa2R5EeVnmiWQaFavFRJir/0h/c5kOC6ovJ5T6VfFSji8inI586W50/DOer/TJlcgmTwqxl/eQNuNlzBRIVJA5O3CRMmSK0QXzOZ4EphAsKOzfIzeWOjHPxVg6fvMZiUyEbNNvjPAO951r9/f/k8Exc2unEmaWLwfS9R4ri8a8iqEhC+x2HYn8+9YauCr73hFBLE+VOmYnrB53y/Kk6FP0XgzkR1fgxvXhhK+nxU4vLCm28Gx+9NzwsOy9dsYZMHHY8vxUX5OaM9czi9QY+WLVvJNXo7duxCcXEp3VHy4C0/g7dXYNLGWjOd3ijTrun0xyeffFJudcBHH3zwwQcffPDBh6sZ33zzjZRl+XjZQKLcueS/00HUqsbT/i5AVBgUFWvllBOWF3mbKIc88sbZdrtFynVCQ7KdOx9aVRFSd/yJosJyNE3pCKN/ENz2fFjKM7D1jyWIj0tE7ZadgIBw2CzlOLZnC0qyj6Fxk7YwRybDbYqHyl6E3KOHpaYuICgGKl0gkTcT5YDyy2VjGZdywJt/e2XOc4HlYDaUdxY88rIXbFzwQnHJdKur2jPiYrD272rGXyZuNivv3q6RGh4mBFOmTMHnn38up0dKgxhE6pgEcKP1kguv4M/nXsLCRyEb1inwcw888ACeeOIJ+awkOPTyeQPpM+G97z33Eo/zgcPVDB5i6UHVtLzgsniJatVynYkz/b3xVs07/fW409Pic2+5+NybDjtvPP/73//w2WefyXv8dYUXckpz/1XABJDvc1yK4y0KTqXDR77P2rUHH3xQrq2T6cp1ce4aa9x4A3TeL4+Jnw8++OCDDz744MPVjMmTJ8ulNhcrC58XUqSjP4qYdk6wzCZYgXG6yHYOXFjGVdJVTuUJydhsKdztdpKcp6TH8TiFASpHIfTqEjjKCuhaC4M5nEiXAW5HCTSqchzdsxXRMQnQBkVJYyZutpJuLUJxdjrCY+vA5vaHyj8OOmcJ1A4L1Hp/Iom855qRREeS+aV8SXImSG7l7LAW7gIFlQoMmccLgeLxyK/nhDeaC0VH0fDUzasZXuJWgxZwDlABmZwxcdixY4dc18QaNZ7WWJV0MPicNWFeklGVhFR1XjB5YM2d1KYRafCSDY6nKslgeEkTP89hvPHwkZ9j5z3no/e+N66qrjpUTder8arqvItZOX5GdfEzvGlXzcOZ8ObRCz7n5zkdL+mqGiejavnYn8+58fEzZ4LvM6nmI4f3kuszHZNxfp+8xYI3D1XzdSHwu/MZJ/HBBx988MEHH/4NuFJyC0lnUjlxfldz+arGYDGRxUB2JEc7nIDTxbPWDCRPsjxOR4cKOm0gZTIAenMMjETAXJpAOBAItSEaLlUkEht1gzGsKVxqIm4q3uw7BBq/BITHN4fQRRA/C4dLsPYuECpDBKXBlszZKrqOskDyM7lTG2az47KyvHweR3lnubOqk+Wpzl0IFEbGwWvpPK6yXqq6msR1lYCze0lgQZ7JBO9HxlPi2MAHb1LNfuy8qKx0D/g5Lwlgfz73kg+vY38mRHx0yD3iFJLI8bLFSSaIfGSCwZ2N77HhE/Zn5/XneL0bd3MY9vPe5+maHAf78znf88bNjq+96XnP2fE5x8mO4+dnOW123ni9YfjcmzZbkWR/b/rsvHF7y+IN643fG2/VPLF/1XDsx+dMuDh/St0q01T5tKpjjSXvx8ZH1rbxkcvgLRvHw+B4t23bJtcjrlq1qjKtmoLz5CW0Pvjggw8++OCDD1czLofc4pVhvWBC5iJH0ig5F0osZbC5HfLcIVywuuzy2kX3WRZjY30ukrdcvG8ux+UWsNsojJVkPTvJesS++B5f8z1pzI+ODpIJ3SzH0T1B8bDczForRbamqCQXYvLES4mIPqn19IwTGpUiM1Jw8jQTKdPCTbKhnS4dQgunMMGpCoDdbSQiF0hh2e6EHnYXHfXBsDqJQqi1sDtJ7iVS6KR7aq0fUTM9pcOyPSXORzZCyKdUNs4ny5NWlpU9+ZZHzrfn6JVLuRxex2WrKgdLuZTqwU7OZrHKuuFjBcnMDqoz6VhWpvAOB9WhXeEndjrnZ9lxnHzkODmP/xb8JeMky5Ytk1P02HojGxLhSvGiKlmriqqNmkFNkwIrfl4ix5qt22+/HWFhYVizZo28dvIG09TsvBoh9uOvI95K907PZLDWj8NwWAYf+R7Hz47v8bN8znnm+5yuNzxDuaesmfM2JIY3DD/HYdifn/Wa8ef77O8th/d+1TwwvGEYfI8dq7EZHDeXh4mfyWSS8VaNzxuHN94OHTrIPde+/fbbU/msEr8XZ14zvHF5wWlw5+D64SPvhzf2oUfQq1cvBAYGekKdH6zK7dy5M+655x6Pjw8++OCDDz744MPViQ8++EAa2WNDepcKr4zllat4z+Byazk0WpL/SK7TkLzGchXLbSxbcnC5pIVO2Lo92x5g4qVieZBvSscR8n9FgcF7+PI9Jjws67LMx9bDJckjUiL9iKlxWJ3eoMiaTKAE54mIJIVn2ZbT1WiIvJHcSWKfNHDioiBsBtDN+wTbXTBrlBl0Lv7IT3I6x+Ukssn7qbmcNpiNJlgoTTZC4nayFUuTJEA6jU5RYtEzTN5cTsVoHkVD8jdbxSRZk+V3jyxPAquMW0Okkcko36sgcsZlM3lkew7HTk2OjfVpKDI75VHWnef5kuISaVPDK59LA4f8j9OjOrKTLO2V6ek2EUDKl5bjVWYEcvirGd6pkpe8HcCGDX/iu+++k4SBCRZXFh9DQ0MREhIiXXBw8FmO/auGCQkOQVBw0KlrchyOCQNboVyxYoXcFqC8rFzeY3P5bF6fiQ3nm823MvvmMByeXwifcwdk4sNx8f309HRp6p+v+R5btuT8MonzxsnbBfD6LiZKHC+/TO4EvJfcnj17ZOPhdV6cBm85wJoyTpP9OX6+xw3LG5a3SOD6YVP/fM358MbPabHlRW9+lSmmbkmCOU+soeMO7r3mPHOj4jLz1FTOs9wCgI5c9wkJCTKd8PBwmUaopx6rOq6/0+q+Gufv7y8Ni/A51w835uzsHATTdYMGDTxv//yYM2cO6tevLxuZDz5cPGwoOJ6BAmFGoJGnVvxdcKI06xhy7EYEmf9GjbGzFFnHcmA3BuHvTPbSUYbUFbMxY95vWLcnF8aEJET7CeSsmYAX//MS3v50CuZuAlr0aoEwSw7SM8uhC/SHnuUG60EsnPQ15v2xF/a45qgTRL/k1fn9Y23g3HBnr8P3k37E0i0nEdi4ISKv7t94H3yoFraC48goEDAHGuXEtasJ/2TeVq9eLWUu3i/4coBlJ5bpXEQOnCSLGkh2U5EcaNDqYdLpoWIyRbKgjmdA0blOqOGwEpEh8mIpLYOW/GUYcoLIEGuW9FodBGueKqxEkigOSoOXEzks/LGdrj0aN4aW5FcdxUWZoHjc5M8aNkqLHFufJL5CbK2C4maqRsSPCBgbCiTKR2k6oWUtnY2eofzaiXjxXmrW8lJWm0l7J0aDn9Ry6SguNYVnssbXRt5HjpUQRNAEhwWRLErMZrcqBIvKIkmX1SKPgkiYnsmYwwUnycicXx3l3UFxmYh4chgHlV1H9cf1wKRPR+HtFo6f930jgqbWynrmPYs1kqQR8aSwfM9F8jOTZmkjg+qB65Q1cxwvk2EXpcOTOVm2lmH4d+oqxV/eDiA7O5PYbbFHU+SWhfZ+bVAaLJ8rLLgq2L+qlwzFv9OSFTM7P6XBeu2117F06W/yetiwWzGg/0Ds3r1bbsj9+OOPS3KxcOFCya6ZQG3cuJHCDZMkhxeZMhkdPHiwJFj8TMeOHdGsWTNJhpYsWYKxY8dKMsUWMTdt2oQ2bdrg3nvvlSSLLQv17t0XderUkR2a64e1Tnfffbfcy+23335D48aNJXm96aabZBg26MEEacaMGZIgcdxMpHivu3bt2snNwGvVqiVJH+ehW7duck87frZ79+7U8TQybGlpqSRynDanyySWy+Q1FsIvj9efMaFjssj54vrge973Ib9iKK+jEmfWfXVQvmawyl7RnsrplBQPk0HeHqAmGD58uKx7Pv4luNKw+NOpWJ3joJ4ajBZDHsKQpjUzkHIpcKUtxqdTV0NJrgWGPDQEVzA5H6qFE9te6YBOr2yBzf8GfLjtNzxS7+/4CXfjxOT+aHbvAhRpG2H88u14p/PfIJm7T2By/2a4d0ERtI3GY/n2d/B3JHs2XEhb/Cmmrs4BiRIIbjEEDw1pirOavzsH8x+8DrdO3A+LHF90aPvqdqwetBi9O4zHyhJl0FEFDcWPh+/CspY3Y1KGQMxdP+HAlJtgSn0bXRs/jfUOA/pOysavo4LhOsvP/x9qA+eHdc5tiB36Awo1KXh+wxa82vLvZdnuvLWY8tmvOGyl30i6llPe9WaEJTRF51490T6h+sHKnb8aEz9ciDTHGT8IVaEyoumwp3F7C6PHQ0H57ln49MetKKKfA61fLXQZfjd61Ts9jIIy7Pt5CmZuyoLVpYKxTm/cN/oaRMvf9hqidDumfzILO0vd0IU0x4AxQ9Ey5FQE7oIN+G7CL0hFQ/R/5Da0DvDc+D8FF9KXTsDUVdlQxV6Pe+7rhoSqTd+dj/XfTMDCww6EdLgT426sd1EEx7ntFXTo9Aq22Pxxw4fb8Psj9Tx3/nn803l744035NIU3i7pUsEylhdSliW3heS7LevWSwvdbFX9loEDoSWCIUjOXPrbUtRLTpIascT69SWxsdsdMPuZ5VRCvcFI/McKLcnD03+Yjj69eiMiKho52dmY+OUXePTRx6Ss7JXbOD2dQQ8nHV1EClXkr+ON2+j3jTVdnD2NRqXMOKO0eM+0iiIiiVomSLFeCJ0AAFD+SURBVCQ3+mnh1ipaLLVNjb2b9yKhTn0YQ4NQlJ+HD957By1atsTg4bfRGKRGdlYmJn3xKZ54fBzMQcEkO3P5BZFOjSSLLo6HuAFr6wTJprxUR0PRb92wESfz8hAcEgyT0YTouFhER0ZJbWAZyb+8R7KbhNV27dtJDZ6aiJ93GinLxnaSrctJrp85faZU0DQhWfwGkqFZvGXZt7SsTCpGODwLvXY6aolQ8rVUfmzfjvS0NDmLrBs9x++DzbCrua4uICP/k/jLViW5cbGqlRuCJAPkmMkrYBLmOT0DCnHgP2cG4Gv252mJQmqqnn/+Bfw07yeEEBl67NFH5VTA9h06SHVzEPltIPJyExGE4qIibN+xA3/88YckXvv375drs3gjRS4bEyMmUgMGDJBEqyU1PCZMTIx+/vlnqYnjRn/nnXeCNWesdWICxqRrzpy5UuPGGrKBAwcgkhrX0qVLJWl84onHieB9Swy4JRGrDGowarmhdq1aCURyEoi4WYmcdSeSuBgREZEyXiZ8adRgunTpIvPGcTGZa9++PeV/FW4bMUISOyZgPXr2lKQyKipKEifWAmZnZ8mGuXHTRjlI8NxlJm48ZTUwMEjWpJcsn/kOTifRys0zw0hyxx3a48/CAauXeUAwmar7wT4bXO9MoJk0/xVYlz+Exj0/w1HJIdUIHjAVB2ffiYiLEQZqDCuWP9QYPT87Sj+dBHUwBkw9iNl3RlDKlwbrkifR9aHZKPDrhjeWTMSwqCuS8f9jsOH3B5PQa8IxuHQt8SK181eaX04B2YolT3bFQ7ML4NftDSyZOAzKa3Fh/xudkfL8BjhUMbhn/hFM7sft/VzhLxLWJXiy60OYXeCHbm8swcRhUUq7cu3HG52ZCNCPbMw9mH9kMmSyfzesy/FQ4574TOls1PwHYOrB2bjzjM7mOvgOrkl5GuvoRz266yiM7uoHv05Pot+Wm9D6pS1wGlpi3IyJuC02AHXqbcDo2ndhXhlgvnEyji+4G0E1Im6mv9QGrlS/qylxu2Lpz70dcUOmoUD5oH4aVMZa6PPfGfjhyQ5QfgVOwb7qETTq9gmOKK/2HNCh41u7se4/SZ5rhhU/j6yFgd/m0a8yQwV9yjNYvel1tDvj44JtzXi0uOF97PeSQ/21+ODQcjxaq+Zlt/50B+IHf498mRi1r8HfYMuM2xHricK+7kmkXPseDqha4+Utf+KlZpdzXLhaUIEZQ6MxfFYpVBF3Yu6xb3BL1fHAvgaPN7seHxwkAbbvJGT/OgrBnls1ge33B5HUawKOuXRo+eImbH3l6pkVU33eLtP4WwO88sorUv55+eWXPT6XBi954yN/AN9Gct1/n30GDzz4IA6npqJl69ZYQzJpGzrOnj1byrCRJOOt27QFOiIXrFxgOZHlU5YTf543T4pjTC5G3HY7AoND5F5zqQcOYtAt/aV8euTwYbRr155k3T+krNuydUuSLZcgOTlZKi6OHDlCcXXGxo0bSIaNIJkyGpu3bJJrx8KCQ9Gje0/88usChEaFISg8CNu2bUVKoxRkH89BvaRG6HXjjSgiovXQfffhjpF3oc8ttzBDwh8kZ8/6YRruGH4rhFaNXxf+inZt20o5tYxk+BQiGhs2b6bfgnrIyMxC69atUEL5Zdm9Xj0ihETCjhw9KhUbhw4elLPReK/hk/nFCAkLQ+3aiVixcgWap7RA3slc5BcWoA3Ff+111+H335bBaDahVZs2OEQyf9rRNLmPXNvWbVFIaaQ0S8Ge3buRevQIykkWZ/n9jxWrJMuIjo5GQVEhgiPCcQvxAv4Upqe4VKyhPE1Ovrrwl61KarTM2LXE9HneKqsYmalSdNIR26YKqM7xPTrxHBWnGMqgc1mlyjk7nn+qobjNZn95zlqnmTNmSE3T3j17cJgaK5M2JlnMQLiTsLZMzmula2bWt1ADe+qpp5CSkiIJHRMgDsMkhgnPf/7zH2pA9eRaMr537NgxSZCYZPHLffzxx2RjY1LGZKp3b9ZuPSYbPzey66+/TuYnMDBAdo7Q0BCpbjcY9JIM5uXleqYYCspnEB544H7cd9+9CAjwx80334QXXngecXGxMo3R9EJ4+iM/L6dT0nlD6nha6iARRCJPZGQQmQxDhaVcxseO25gyUHDdsYaTXymdcx2eVffe93Oq/s8MI99nFX9OgL/O6KmD1RScd677v4YKrJoxnwZxlTI3mrpW8e+zMD+3GqnlcqBiFWbMJ0GR2rFOS/XnLsbvs+bjryTnyDqAXalpOLJ3P46VeQQaHy4AA657cTZmTPkK38z7Fo9dduHMgawDu5CadgR79x/DqdeiQdLYKfj5m68wecZPeK23V1o6V/iLhCMLB3alIu3IXuw/ViZ7r4QmCWOn/IxvvpqMGT+9hspk/2ZUrJqB+cdcUNG4rjT/3zFrfq5HYD8Fx/69SGXhXJuIoa9+gldffx9P9wtBevoJ+cFDk3AtBvZpQz+uyQgLHYYPfp2GSZOmYeHHwxGqRFED/LU28E/3uyuVvpwJwdGpAtBp7Mf4/LOP8c7zd6FDFNWP9RgWPXc/3tuirJOuCm2dzri5X1/06dOHXE+0jObfWorGVBvte7Mfub43oVfrKOl/Cop1Z05STcJdMD1m3zMNX/9RodyuRBmWTv0RhxwqBIeFQMM/RYLXnl9c2fn321X5iBs5817F26v4t86HywXDdS9i9owp+Oqbefj2sWYe36sD1eftMo2/NcDlkVtOQZkBpYLd7cANfbph9YbVVEiS0fQquNQuHEg7iOSUhjAHm5GZe4JkuyAkN6iL9WtXoVGjBggNCYTVVi7lkcOH9sFlt9AY4IDNYcVR3i/NaMDuXTtQnH8SwmaDTpC8eeIEjCSrLvp5LhxlxdizdSNOnkiHzm2n+w5YiwoQaNTDUV6CTi1bwUzyTm0iSn+uW03yZjaOHkrF/l370btHP5RarPCPDEbzdi2oN7qxlMhkh7btcWDfPhw8sA92pw3r1q9BRGQkNm7YROTpAMaNe4Q7spzCyR/webzq3KED9u3cAQsRpX1ECF12K3p0ux46Gk/Ky4rQsnlTxEZHINDfhGNph5FYOx7xsVGoKC3F5g1/4pFHHkHqoQOwk1x83bXX4nh6Gnh6JU+91Jv1UOvVCIsMQ1FxAUaPGYVd27YgPzdHTk918Ow1ehcNkxtg+9YtqFe7Fvp0746i3FzKh43GKgGhIcfvRFr3VN7d1Q6W8i8JTBjOdJcL/APFjZ7JFWuXmBjxOXcq/oLAUyOZZPE1h/MSMSYY7McdkLVZ/BybtedFp7z+i/14/RZP42N1K2vlvvrqKzltkcmSnF5I4Lg4Dzwlkqdi7t27V6bB4GemTp0q18ix5iwigr9eRMn7HD/nr2/fvjJ+JpA8ZZPv8zmr4Vnj9+OPP8qvIPxV5dNPP5XaPHZMHnkKJJeB88BEMCYmRj7P0y55WmTbNm1w7bXXyPsMJm3e8ysFjv9i0uC64Hfxl1C2HDN/zaTO5I/u99+FZBpPRelKzJqXdYYwacfRVSQcTp6FDdkuWA8vwodPjMTggcMw+tmvsCbrbEGmOpQtn4lfM2nA8e+O++8iskziSunKWZiXdXpqFanLMW3SV5g6bxvyKm9RW9k2D1O/moTvf08lymnH4aVTMGX1cSWvIhebfvwSE774FqtIOK6EMwvrv38Tj48ajoEDBuLWUY/jze/XI4tNOnlhP4pV0yZh8qwNyHZZcXjRh3hi5GAMHDYaz361BmcXz4ms9d/jzcdHYfjAARh46yg8/ub3WH96pKfVWcXBBXh33O0YNHAEHnx9DvaWcRgrjix6H4/eMQgDh9+Pl6dtQWGVqqhZPXjgovJPewPjKN8DBgzF3eNew9frshXNZjXggd1BI76T+ojV42c/uorSm4xZG+g562Es+vAJjBw8EMNGP4uv1mTxrPwqcCF30zS8MY7awYABGHr3OLz29TpkWw5j6ZQpWH1cybDI3YQfv5wgtdrsvvxhFdLKnHDSWGBnAcFeffgvvl0Ffo01rQP74aWYMmU1lGgE5e1HfOlJc8KEL/HDqjSUUZ+xWu2nCB3jirSP6lCG5TN/RaZLBf/u9+MupbNh5ax5ONX8nTjy+1RMWrRPEZ6EDUeWfeUpw1dYvK9c5l1U7Meir7xlm4JFe4rgcNphZ6tlF4Hq2gCj/MgKfPPWeIwZMQj9BwzByLEvYeLyNCg2b2vW78pTF+Oz5+7DbYOofwwfg/98tAD7Sj03K1GB1IUf4Im7h2DgkHvw9ESqy3M12ErULH1n1np8/+bjGDV8IAYMvBWjHn8T36/PoqdrCJUR9XuMwQMPPownX52Mn9/ogwAanoVjH9auy1HSrgJ1LSLQP/8qf8sWLpyNR9oqwqk6rBdemcd+5H6dg5e6n6mrOwVNQh/c2IJ+l1wZ+PmH36nFVEHBL/hufhZcmhjc2L8d/qpBdZVfU7RMolichzDllS9x4AL1fv42cQq29BWY+ML9GDFwIIbcMx5vfuJpp198hz+OUyLUl1Z+T31pJvelMuyb/y4e4740dBSenrAKJ6r0pYsZ/6qOXba0hXhjzBAMuuttrKhOdXpJuIjfQJcdVgcJqM4KVHDHsh3G7999hYmTf8Ta46cPFkoZJ2LKvO0enxr0narjkS0NC98YgyGD7sLbKwrkbReNodPeGEdj9wAMGHo3xr32NdZRnpWbZ+TtPONv6pHVmD55Ir764Q8cOy3bFTi47Ft8Nek7LN5b7PGrGS6L3HIGeExUkTwXHhOHRs1aoKCkDNt37YbBPwButRYVdifKbQ6oDUbkFxdhX+pBhEVHw0jyrSACtmvPbgSGhUJDJM0uXNCaDMgryke9pAY0Lg1GSVkZDCQXlpSX4dDRI4hOiMfRjOOITaiFyNg4hEZGwRwYRATHHwdSjyAsJhZpx0+QXKWB3t8fGoOJ8hKIyJh4ChuNmPhE+AWGyA24dUYzTHQ8npUJu8tJBNSN6Ph47CLiVkbjchYRvfCYKAy/83aKww8WIkJ/rF6NgyS3FpQUYzmd83N+QYEIDg9HOJUrlGTZcpsd+4ggsgEUhyDZUqdHRnYOsk7my+mW0OpQbrVBTe8ilORrluH9AgOlRkxr0ENLcjbXaXLjhkQc/8TihYuwbPlyIokCK1auRADVl9XtxPotm1BBRyOlr6c6MgcEoKC0GD//sgBuqlsHlUel11GvpbdE19IYzL8FPFVy1KhRJP9fHFxUysvlGESUBBEy6agDieLiYnH33XeL2NhYQWRIfP7Zp+KxRx8RE7+cIO4dM0p8+81U8crLL4rPPv1YvPvOW+J/770jbh02RHzwwf/Em2++LkaMuFW89NIL4t133xbDyL93755i3ry54lGK4+effxJjxz4gPvvsE3H77SNE69YtRa1a8eKpp8aLt956Q7xHcT355BMyrnr16oiYmCgRFhYiHnjgPunHcQ8c2F+88MJz4sUXn5fxjqE8ffLJR/L6G8obh3v11Veobu8WU6dOFl988bmYPn2ajJeffe65Z8SHH74v4xo9+h7x+uuvivvuHS2+mviFeIvy/87bb8oyfUpxTpn8lXiewvP1u+++KV757wsiPiFaxMZFivj4GDFy5B2ioCBf1pu3Dqur50t1TpfiaoqePXuKxYsXe64uDUVz7xBRagiVf18xMX2NeCJZS71KJcw3fCzSqubFeUi81VFH7NUgrrvvUdEhRENDgSJDcnhj43FiWZEn7DlRJObeESXUFN6/70SRvuYJQbIrxWkWN3ycJk4l5xDbXmwhaGgXquDhYpbF4y0sYvaIEHoeQpfyvNhqPaDkqTIfXqcXPSfkyCdc2YvEk+1DhEZ1RhiVRoR3fUWs9uTZeegt0VFH6RmuE/c92kGE8CeiyrBG0XjcMsq9B65ssejJ9qeHkU4lNOFdxSunIj1VZ/eOE+2C1VXqTC0ib/6f+O7ZziKsajzqYNH1rR3CJiOoYT04yMuZLqaNSBS6M8qpbTherFMiOwNOcejtTjJuGPqJyYUev7c68q4wwnDdfeLRDqfXm8rYWIyrfMlOkT5thEjUnVEH2obi8R9fk3V5mn91TtdavLLLIZwHlLo/676+p5iQU9M6cIoDMu/VxHOG07V+RVCyElekfZwLRXPFHVFqCu8v+k5MF2ueSBZM3VTmG8TH3s7mShcfXqc/PS81dlpR75GVsu148wsYRN9J8uVW41ddG3CJnLmjRQPTmW2b8qmJFH0+30/j34X6nUuc+Pkh0TyAd7qtep/6fbOHxIJsb0+3iM1vXyfC1FXrUidiE+OEgd+HLkU8Lxv3GahB+tmLnhTtTxujFKfShIuur6w+77sqnzVcBHP66ghx57zKBieKpg8RITRW8nh14+STHt9zoURMvckg09TE3ysWWz3e1aJczBoeLPOqa/6cmPVqB/4wLdQRt4oZBZ4gXKcT+4pA8tckPiAWTOovjLKOOot3Up2eMDWDt3wq403ijfd6yDihiRN3zDkpx2Db2vHKuEz98+WdXP81aBMyZiGsO94X3SKo3lUqoQsMFv6njQ96cf3HJ6gdvi06cV8ydxUjRzUXgVyn3jD0/hNvmy6OySZyEePfaWPX3eKuJIPy7qkNPbe5mjZEdf7jkAAZRh1xp6jymhXYVovHkvi3EMLQd5JQhsea/wZ6y8h9rR91LFf2RNHHj+tCI+JGL6TUvTgpvhngeffNnqXrmvWdquPR3XclKf0FOpHy3Gb6KZgmRiTqquSNnVY0HL/OMzacnrdzj789xDsf3ay0DzXJP/NKZNoSBT+IIaGcRyXNi8Hjjz9Ost97nqtLB8uy7BhOp0NkZqSLA7u2i8z0w2Lzuj/Enh1bxOL5P4lNa/8Qu7ZtEru2bhQZRw6K9X/8LtatXCqyjx0Whw/sFof37yL//WL+nOnSf/P6VaKoIEfk5WWJ/Xt2Cmtpsdi6eo04uHWbWP3rQpF98JBYvWixWPPbbyIvPU38NneOOLB1izi6e5dYOGuGOHHwgNi8coXYtvoPkUnnJw4cELvWr6fzQyL76FHx+y+/iLUrfhdHDx0QmcfTxIH9e8Th1ANiC+WvqDhfZBw9LOb/MF1s+3O9SKV7WTkZ4vDRg6KC8nFo53ZxdP9uMW/WNAp3UGzfuFas+O0XkX5or8ik8hw/vF8sXjBHluvgzm1iyc9zxfY/14r927eKQ1Q3uzdvEEsXzBN/rlwuMlIPirXLloo9WzaL7LQjYuFPcyieA2L31s0iNzNDHNi3W9gsZcJSUSK2bfpTzJ0xXWQfTxeH9u6iep0ncjKOiV1bNonf5v8s9lL591EaRw7sEycorpWLFomta9aI/Zs3i71btlB+9olyiqfCUSGsDptQ3trVi5SUFPHRRx/xGPPPg/Ljme536py1al61NRvrWL5iBbp27Sq1X6z14imFSUlJUqPFUxt5PjBPfSwqKpJaLzb2weBpkGw8hDVgK4mNcxz79u2Ta9l4Li1PE+EwrGHj+2xJkTVbbCSEp2J6tXD8fEFBgXyG18pxOM7DokWL5F52O3fulHFw2uzHVir5edbMEYmRafI1G0hhjRxr+OLi4uRUTl4gyVM0N2zYIOPkOctsbIWndvKWC9u3b5faOWkghJ5hi55cR06nomlUoBh24Xr7p8Eaz7/25aoQS2YsQp5bBXPnm9Evvi36960rtWCWdbMw27MO5zQIG1Z++RG26Fpi8H33YkBKCPh317pvKj79Od8T6BwoXIIZi/LgVpnR+eZ+iG/bH33rsuhqwbpZsz1r7DzwtFOJc30w1dRCn4eexxM3J1Ge+ToB3R54Cv95+gWMvjaUnsvHT+NH4f0NhXCbGmH4u7Px+4pfMPGhjghVuXByzesY+86m077AC9tKfPnRFuhaDsZ99w5ACi/aF1bsm/oplOK5kf/TeIx6fwMK3SY0Gv4uZv++Ar9MfAgdQ1VwnVyD18e+g02nR4qVEz/GNlM73Hr/PehezySnpObOfwJ3vLkBmlZD8eCYvkjyozbmLsK6L7/COu9n7JrUA8G572u8PysNDlUUerw8G8tX/YYZHz+JwR1rgwSj6lEZN40FnjMFAraVX+KjLTq0HHwf7h2QAqUa9mHqpz9DVoNzH75+fxbSHCpE9XgZs5evwm8zPsaTgzuiToM+eOj5J3BzkjKuaBK64YGn/iOnS7MbP6AhiGASuC/xa6w+/NMvjAa/xprVgQa1+jyE55+4GUo0GiR0ewBPedL8z3/GY0BDEuv4luAJKYQr0j7OjcIlM7Aoz01yP0+pi0fb/n2hNP91mDXbu+YzCtePeQbjBzbh2T5UjCh0uYfatKcMQ1LMsgzq8I6460lP2cYPQwt/9lXGptPf5QVwVhsQKNi/G7mR12L0a1Mxf8VqrPz5I4xINvBnfCz97GtscZ2/37nz5+LJ+ydgR5kKcT2fx7TfVmLhpIfQnthC2e4v8Pibq2VK7vQpePb1VXKtlSasFYY88CBGdIzEyfQTsJ2vEBfo9+78nzB+1PvYUOiGqdFwvDv7d6z4ZSIe6hgKlesk1rw+Fu+c1kHPBQcKDm/Cn+tXY/H3r2Dk8/NRRHlVR/bFrX1CPGEuN9RIHDQQbYm5ufMXY/oCzzRaVxpmTFuBUqL6dfsPR+eaz6g/J/i3LWrEU7idG6ErEzNe/RBbqt1GtAZtQlZnMea/9QZW5AHR/SdhX14hsre+i27B1EfUYegw8jk80D1SxsevV1SsxjdT9kDffCDue+gOdI5l2uVA2owX8L81nozUcPw7BQH7qq/xzZFAtL71Qdw3/Ea0jjvXAHiJqNFv4KkxlYugjuiNfh153Hche+kCrPfWc9FS/LqqhMLSe+3Zr8Z9xwthX4WvvzmCwNa34sH7huPG1lHY9/X7mJXmgCqqB16evRyrfpuBj58cjI61Az1Tv07P27nH3zG4ccgQdOcxzp2DhTMWo0iGoDe9bAFWcGfQNkCfmy5uKijLU5db40bEFkEhYYivUw9hUTFo3Lwl6jZoiK43dEOjlBaoUz8ZSY2aSo1cizZt0aJtW6kli6tVC3G1ayM0OgbX9+wl/Rs2S4HOaIJ/UDBi4uPltOKUNq1Rh+TgTtdeh+DoaLTr2gVtSMYMjojENT16ol5yQ0TFJaDXjTcjkPyatGwlXRjFGxoTg+SU5ggi/6DwSHSkOFq264DYhESERcYgIbEu4hJqI7lxE2j1BoRQuJ439kODhg2pPHWkJo/j0ZqMiE+sgyjKU68bbyK/KDRMSUG7zp3JLw7+wcGISohHl+tvkPmuQ3m6tntPJDdrjjh6Lo7SSWqagmu69UCLdu0QQuVv36UL6lM6XGfXUzkiKK/16DogJITqrD7JamqotXokN2mKmwcMlOv+OL/X9+iBwNBQGfbaXj1Ru2EyEslxXUZSXtt26oikJk1Ql+7XJVk9nvzpl4/e02Xui1caV4PGjb9OeDVF1HmEzWYTubm54q677hLR0dEiPj5exMfFiqQG9URMdKSIigwXtWvFi4bJDUSthDi6FyPvNahfVyQm1hINGyaJ+nRep05tkZRUX56zf3x8rGjUKFnEUfjatRNEA36GHF+zVo0dP+PVsnGY2NhoERERJo8JlFYypcnP8DmH4yNfR0VFyGuOP5LyV7duokyT446mPLNGj/0aN25YmR+Oi/PKz/F9Llcd8q9LeeBycVn5yGXle/UpXP16iSImNlxERoVKl5AQK+644zaqr2xZb0QIBREn4aSKPbOe/6qrKYgciz/++MNzdQk4+b0YFMIaAD/R8/MM+bXVumqcqC+1YHrR4c19lV9SK7820liviR8ophxQPiE7U98TXQ38JVErGj31p0dTVD1Ofj9IfrFW+fUUn2fI1MSqcfUVrYO+g3hznzc1h9j2QvNTX1orP09W96VViJKpNwkSIc76+uzK8n7l1IoGj6ykpz1w7hWvt9fLL5LaJk+LDRTPKW2ERsQPnCKU4jlF6ntdla+Z2kbiqT+pdK4sMbGPn/Jsg0fEylORir2vt5dfyqFtIp5WIq1SZ4PE1ENK7ZT/dr+orVHSir3lS7FXpmUVaz0aGP7S+bn8slrzerB535smXgz9OvVUWc8J7xdqesbQVyhKmSp+FM/AKQcoV+ydKt7rqnzB1jZ6SnA1UIJiXH3+Ik31NfRrkXpWgqc0DrrO74iqSoHyaQMFcVR6X63ESzu8X8PPFf7i2gI1BnGTgeKGTnR+J/VU+xXlYtpA5b3pWr0kONkr0j7OiZPi+0GcX5Xw6/m5UJq/tw5VQt/hTVHZ/AnlM4cpWh9dM/HcJm/hLOKnO8JkmbUNnxTrvclZfhH3RPPXb42o89By+c5qrHE7qw0QLEWiSJbPC4fY8WJL5R0EDhU/et5B9f3OJXIm9RPEI4XK1E18qqhOCFax4qG6QkPhdU2eoWuXyPy8pzBxGT3aHgnnMTHnniRFc3wujZsH50o/a2IfpX1pG4hHTnVQeq2vi/Z65X03eXqDx/dsVGrcOO6qTmUQ0W3uEB+ty5dj5flxqRq3F8Q262Hxv2uMdK0SAb2/ECcoMcfOV0RrzrunnZV/99c1bso7d4qjE3oL4lYC6lBx06RjwrLuTI0boSZtwrFTvNyKNVJGceOUStWTZwzUi26fZcl6q9qXYm6aIPZ4XlHp0gcEcUjy14mmz2wkn4vp+1XaMqXf4qnV9AbOh7+gcSO/C/0Gnt3XXOLYZz087bIetUvl2ZI5t4tIrnttshi/zlLDvlM1fpUwtnhKrK4srK3yN1UTP1R8ffbAXE3eGOcaf3mWTLSsa3XoYDEtn/1KPTNnKGzTZ8TGc3fRavHAAw+Izz//3HN1+aDMgGJ5THFON8m55Kr6udxO4aZ2VdW5hP0s5yR/ku6U8C6qDJKXvc7Njvzc8p6LnLsGjuRvchT8lPPIew5ydsqblVK2uCldF+XLSfkiZ3PZRZlbcRY6dzoof3SsLs+nO34pFDHLk+d1nBEql8dxubjMVHPyH9dBZT14nLzvcd77So3RfXqSnbfAsp7YUVgnOQ7HsXPSVzOuKo3bmeCvs6xtY4s6bH7/1ltvlVYKBw0aJM9HjhwpTc2zJo2PbA2yf//+8potGfbr109qsgYOHCjXs/E5P8/P8jk/w9cc7sYbb5TnvOH3iBEjZDwchs+HDh0qjxw/O77me6xx47i91hM5X6NHj5bH3r17yzzzOYcjYiyf5TQ57p49e8o4OC7OG+eZ45LloHJxfOzPfnfccYcsjzcOfp61dbfeOlzm15tn3oCbv+zwej+uN6ezRgtbrhj+2iJfN3IXzMSyIjdUpg64qV+M/BZiaN8ffWrxT4QDW+bMwr5qiqhN6YsBSSQyETTxjZAURj9/9DtgrbDwr0H1cOdiwcxlKHKrYOpwE/rFyNTQvn8fKMltwZxZ+85YQ/XX4Ni9FXuslCO1P9p0bYtKexSaeujcLl6W15V2EKmnfXzXIqXvACjF0yC+URKU4llRwXbZHbuxdY+VyqmGf5uuaHsqUtTr3A7xSqQ4eHqkVGd90L++YiLOyF+hpIJZg6a9+4M/XHNdJCfXIR+GDdaqC45qAH3zHrguTlkbM/PuZqjffhie/fpP5FxqhWpT0HdAklxwTC8ZjZLC5PcyYa1QzNPrm6PHdXHQqlzImHk3mtVvj2HPfo0/LznBvx9XpH2cA+7cBZi5rAhulQkdbuoHpfm3R/8+tSgWAceWOZhVXWf7J2AMgqlgM+ZOeB1PPzQad91xJ1789YSi8HA6LtBHHdizfa/SRtTHMXf8bXLMHT58JN5fy5oFqtO8TPrrxMF9qXKNoyqgE/r1DOOHqUoTaOxtA6lAvCQ4sHvrHiivtQ26nuqg9Fo7o53SQZF2MFXxPB9UesS36Ynu7esgkC0A07sPTLoBvVqHXtnvxppEDBzUEUbiAmWrfsTMdCs2f/cjdlA71DUdguGtL+c+Fhok3vUCxrA22l2Ixe++j3V29dnlq0mbUIcjMozGIOHE4d27wOZO3Cc3YSub2aQ+Fhnpf0a8WrS85VY09rwi/07Xo6188U5kHE1TPC8F+mtw//guCPBcXglc/G+gGnG3DEBnM4VzpmPxgi2wUw2t+nW51Dhr69+MQa1VNew7VaHHNfePR5fKwurRvMd1iNOq4MqYibub1Uf7Yc/i6z9zLvG3NQi97rhFbpXgLlyGmWxIqXwFFixjC6g6NLxlEC52t47LbZykEvwKqjovTvPnFsi/sjVwUmz3uNMMzvHXZ7XcLFvwTKzT4j/b8dcBEnukO+2eB0oKiifLFey8vpxOZfqV96rJa7WO4qyaXnVO/vGkUdUpVP00v9Pyxvnx5o2cisKy815X3veG8dzXyKNKSfrfgEvVuPngw7nQpk0bsWnTJs/VRcKVKSb29XxxDKgvOvfuI/r0YddLtIzRSn+VroV4cZvnc1qVr42VXyAZ1kViTJzcirHya391cGVOFH0D+KukWgTU7yx6y7TI9WopYrTsrxK6Fi8KJbnLo3GzzL1dhPJYo4kVoxZWzZlDbHymiRK/8SYxteRcXyG5eGNEHEvWmjrioeUUh2WuuF3O7deI2FELTyuvY+MzognHoTKKm5RIq60zV8bH4no9p6WsyXF5/Au+6qOUQ3+NeP8o+15kPWyfJMZ0iFG0fhwPrxfq95nY47l/Oi6gcauqgaFSLhoTJ7/4auo8JLgaJEq2i0ljOogYqcXgNOkdxvYTn8kEr36N2xVpH9XCJTIn9hUB8nc5QNTv3NvT1/qIXi1jBMlY8l21eHEbpazgn9O4uUTW/IdFiyBlPaZKpRVG/0ARYPSMCeYB4nvPO6i+31nEz3dFyjyq1HrhFxgoAqu6oGAR3eU1Ge6XUTEynDr6HrGgimLAMnuEspbskjRuFjH39lAZryZ2lDj9tW4UzzTh/qgSxpumejzPRqVGqnKNW5nY9N9OnvcXJLp9fKhKuzoX/oLGjYrsSv9UdDNTv1IZRIeXvhD3JtIYq9KLtq/ulmlfPo0b+1D7/HagiJByWbDo8fA9yjhWZY1bzdqES+T+eKuyZprqqV6Ha0WbWtznqL6bPC5WlHKYc/clYV0oRsvfEpXwH/QDeVyixu20setcKBc/Dg1U8s9xn6VxWykerst5obH7xinKmsiL+A2stoyuDDGhp2e2BmvyS34T9yXwc15NXU37znnqUKJEbJ80RnSIUWYNcH5VuljR77M9cnyp/tlzj9fCtkY8LrWPKhHQd6I48utoZczTNRcvnKd/ngs8w2vq1HP3v0uFy+2iFujV+VTRuFXxY3em0unM+5XOTWHZeVVjHsfXfI/1dZVhzuM4jJMeZXdGVKc5K8VXQfl1sBbPSfkmZ3M7RRk7at8Wl1M4nE5Fs1g1n+dwNQLlrWomKjWEnnxXF+9ZzhOWnzkTsg6qxF/p6P/VjKta4+bDvxt/5cuV+8RczFylmEt3l6Zi7eJFcs3gokVLsC3LqYz2jt2YM2PrJX6pqwo3TsydiVXSTJ4bpalrsVimRW7JNmR5NpN07J6DGVuV1HjrCgmHFdbKtQ022GznW8MjTlsSoQoJRhD9cvG6sZzsquau7ThxIk+uKVKHRSP6Yj5gq0IQrESKopxs+VXZC/uJE8hTIkX0RUV6blxMPQQ0H4WJ648g9Y8peLJHAvRwIHPxG/hgabULV/46Appj1MT1OJL6B6Y82QMJVGRH5mK88cHS0y3N0Us59zurBmeEv7S2wNGcP9Ur0j6qg/sE5s5cpViJdJcide1iT19bhCXbsqA0fwd2z5kBT/P/5+Dcik+e/QLbi4Hg6/+LlRmlsJQWYOvLbXHukaZqv1NT/1DW0qjCbsW0nGK5V2ilKypE1urnZLigwAAZThRlIIPXy3jgcNhP68cXRtX0VQgJDpJfdN1FOTj9tZ7ACaWDSotyNYcf2jz2Mm6rTe3QXYxVn3yGtVU04u6KPBw7louKU0U4L2oSXh3fH4O7+pGobMfG/z2FH3gLCX1bDBnaUH5LPxcuNi8K1IgZ9jwebGmAisq3/Lu5yOBq8qKmbcJ9HPOnLUOe8Eeja9sjlN5rUWAKbnrwQyz67W1c5+8JVwVO5ykzqO6Co0iTm8uppZU7xqX2/QtDI83Ay/ZXvhc795/e8dw5u7EvW8lLCOVF0a39RahjcPPALvCjxuk8uAg/fTcPSzOporVJ5N+Sxuua9p0LIQDNR03E+iOp+GPKk+ihDMxY/MYHqNFPwRnjL/TtcfuwJmA7M2WrpuH5SUuQ7VJB1/QWDLqEbWSulMaN9zdmzZXXaeiaXVU/djw2VHVn3q90Hivfcr/dKo6v+R5vnlQZ5jyOw/DWHezOiOo0R70PJsqvli29ayjf5PQqDbUXctRejdQXeMsquf1B1Xyew9UIlLeqmeCySefJd3XxnuU8YfmZMyHroEr8lY7+/xvgI24+XHbwAHhpi3xdSJ87B2sr+EN/Czw6d500PlPpVn+BYXH8g+nEASJcG0+f9XfxcKVj7py1qBA02Ld4FHPXVUmL3OovhkFJ7gAJuBtJbKYfyxBF+BKW9fhpzjG4SKDYNmEUnpuvTBmpCo1eKwdFFhwOHayg9OhHnvJsaNIWzaX9bivWzpqFNI8w4s6chx+W5hP1oh/KTtej3cX8KhuaoG3zAMqbgHXtLMw6FSnm/bBUTntRB3fC9RcV6blQ83pwpS3BtEVHYIURCV3uxptfjkN7/m10FyI//yJtxNcErjQsmbYIR0iANSZ0wd1vfolxSoIozM8nyqiBXquReXcfPwTltVhPM/RxOs4V/uLaAjUG+nGTseD4oYOooLbO5v+rwxVpH9XAlT4Xc9ZW8GdvtHh0LtZVafvr16/GF8PipDDuPDAXM/9yZ/uLcKbjqJTaNajV5UZ0ijWS3wls2ZlJ9XE6qu93ejRt00xOdXQXLMesBdmnP1eRhWN5XEa9srcSV79tDaZ8+ifYqHjxjokY/fx8FNdAKq8+fQOatG2umO23rsWsWWmSgHN7yJz3A5YqHRSdrm8nfWsM/+sxakRjaVTHeXg6vligmF1H2UI80DgOiYnxaHjvAsXvfKhpeBLybxl0DdWjgLusBGVuFYydhmBIvfPQtovNS1XoW+LhZ4ciViPgKipCcdWXVtM2YVmNX3+nfqMORP2+j+Gj7+dg3qzv8PGL96BLbHWCuh0r3rgXn2wqhNudj1XvTcQatkqj8kOLdil0/yL7/kXBgFZd2yOIJTPHLnz+6KtYelxhNc68Dfj0kXewkucsqkPRpXt7aq2XA2pE3zQAXSRz241Jr8xAOlWrNukmDGzJKdS075wPLqQtmYZFysCMLne/iS/HtZcE212Yj3P/FJxvvNYiZcStaMNTOcpX4Yefjst9WFNuGYwml8C/nFfEOIkPPlx++IibD5cdlzwAuo5izux1sBKR0rYYhNE3d5Tr9ypdl5EYdVO8IkwemYcZlSawLg2uo3Mwe52VBFctWgwajZs7VkmLXJeRo3BTvEIUj8ybgfU2NWI6d0JDlpLc2fjpnoaIiIxH+7E/Ic8vyGOR8BS09ZNRhx93ZWDKoFqICo/BoG/zgYhbMPb2BhSeyMTiR9G16yDcfc9QXNd5DGZnuUg+aIWx4wdcxIbFjAjcMvZ2NKBMuAsX49GuXTHo7nsw9LrOGDM7i37Q/NBq7HgMuLhIz4Ga14Nj53Q8flMzJHUcgJGjR6L/gLew3kkykLkNOrc1eUJdRjh2YvrjN6FZUkcMGDkaI/sPwFtKgmjTuS1M9GNf37Nmz5UxBYNqRSE8ZhD4tVSPc4W/uLZAjQHJSmNAxpRBqBUVjphB3yqWMM/EFWkfZ8KFo3NmY51VQKVtgUGjb0bHKm2/Q4cuGDnqJijN/wjmzVh/urby74Y2GY0b8LdkB3Z9NBx9bx+JQZ074s7px5Q1GlVwrn4XestY3N5AJ9db/nBnG3S45U6MHnMPbu3bAfXi6qD3u1vl82H9bkc/3qRaVGDTG9chPjwc8W3ux6x0KJvzXwDnSj/Cmz6v2Xq0K7oOuhv3DL0OncfMRpZLBb9WYzH+ojuoFi3vuA1t2dSnOxe/fPUj0kmqduXuxd5MB4RwIHvfPk/Yc6Pm4dWIunkQrmMGyqBx5Zqhg+V64HPhYvNyJsJueQbjOvpJ4f001LRNGFuha/sgqF2ZmP9kH3Rq0wJNG9VHYkwIQutcj4enHzijbQs4js3DuE4JCA+vjZ4f7JBrEzXxg3DPLWx98iL7/kUibPDTeKwda7jcyF/1X/SqGyb3ywqL64hx847BKdQI7vIknh8ccdkEOHX0zRggNakunMzNp9FBh+RbBqGVhxnWtO+cGw7snP44bmqWhI4DRmL0yP4Y8NZ6+mVVwdymM879U3D+8VqTNBzDuygWbRkqbQpuGdSInrp4XPoHZx98+HvhI24+XHZc8pSD4nVYt5uEbG0wrhkxGA3PEgaM5D8EySaN/AFZu+oAjdR6BAaZoSHyFRAUcGrAVgUgJEgHtVq5X91vafG6dVCSuwYjBlcz1cdI/kOSYdLwguq1WHXACW2rx/D+U50QzguA3BYUFjgQ3eNFzJpwK+K0augDAmD0JKZvPQZPDaoDNuzlthYht0SFgEBWkwSh+9tz8dXodojS2pCxfi6+njoLq9OtMNfrgxdmzcOL7ZSV8Sp9IILMVF5tAIICTtWpKiAEQTo11PK+kmBQ97cx96vRaBelhS1jPeZ+PRWzVqfDaq6HPi/MwrwX2ymGLs5VZ7pABPuRIKT1R2AA1Z3HW+sfBH+SRjTmIMjss18N60HXvBf6JWmRuWEevp38LX7ZQb+4wc0x8pPPMTa5OmlPBX1gEMxU55yuUuQqfgFePwbVZwgJSmpKj+9zNeiao1e/JGgzN2Det5Px7S87iBwFo/nIT/D52GR6x3q0HvMUBtUxkJDihrUoFyXqIARTudRcp1QetZGuPXXKX5vPCk9ti+vhYtoCNQaMeWoQ6rCpR7cVRbklUAcFw0C1zGXQqtQw0rWS7JVpH6ejGOvW7SbBSYvga0Zg8NmdjZr/CAxJNlE7IbK5dhWo+UPjH4xAjtdA76EyXnoPwcFyKo0hOAh+3oajDkCwpw8GByuC96n8+lfm92y/atqAtinG/u95XB+rhyg5gKXTvsO8A2G49X/PoleABho/f5g96Z6z3wV0w1tzv8KY9tHQ2U5g0/zvMHnSVMxYtBHHRG20TYmVz6sjBuH9SY+jQzgbtHCgLL8AtuC2eGDKBNxTm8qjC4B/5Ys9G+dMP6g73qb0R7eLgtaWgfVzv8bUWauRbjWjXp8XMGvei/C81mqhCQpDmIHKaghFWOCp9DVJt2N0n0hJGCybl2N1EflFt0WXZsEkiAYj5To2XuWFBkFhodCrNTCGhUkNoPStNjyFDQ2FQaOFX2gITJ6w6ohbcOeAWjByv4u9GSMHKgak5L3AUIRS+9D5U/vz1NG583I6NNRmQ/Qa6ILDEHyqKdONRnjwfy+iexz1FhW1jahGaBhFKda0TahCUL9hHL0PFYwJbdC9+w24rlMK4sxulKWtxGdj7sNnqR61toQO7e54EJ3D7CgqLCeiRGnGdcNL372Hmzy8uuZ9v7rx7AIwtMGzP83D60ObI5xeqnCWIz+bxh0HLy2MQbu7PsTCuePR3Ktuu4jfwOr6n4Q6Crfc0R8J/NtKY5EutANuH9byVFw17DvnjJ/qtHmvfkjSZmLDvG8x+dtfoPwUjMQnn48F/xRU/+y5x18JdQKG3tUb4bIB8gff/hjUqGq6NceVmirpgw+XGyo2TmI0GjFp0iSPlw8+/DXUqlVL7oOXkJDg8fm/BheKUjdg3a486Gq1QdfWcacs/52FchzbuBpbjllgSmiJLu0TUXVJhS13LzZtOYgciwbBCc3QrlUiSOb4a7DlYu+mLTiYY4EmOAHN2rVC4l+OtDrUsB5cxTi6ZSN2HieyEpKI5u1aopa/V9S7EnCh+OgWbNx5nEhZCBKbt0PLWmdYjis/ho2rt+CYxYSEll3QPrGahS5Vcc7wF9MWOJqNWL3lGCymBLTs0h4XSvaKtI9/MyqOY8vaLUR2QtCoUxc0CjtXZZyv39mRt38zth7IRLFDj9CEhmjZMglhZ8w7c5cewYY1O5GDaDTv2g51LqrNni99G3L3bsKWgzmwaIKR0KwdWiUGnP3hyIea4QJtwvb7g0juNQHH1K3x0uZ1eClFedGlv4xG4/6TkSHCcMecDExt+hG6Nn4a6x0G9J2UjfmDcrH2j90oNNdGm06tiejJx6rg4vr+pcCWdwBbtx9AZrEThtAENGnVCnWC/8mWUrO+cy64io9iy8adOF6iRkhic7RrWQs16lbnGa+dO19G+zb/xVanFm3/ux3rn298SX2JLXY//PDDcm9fH3y4GtG8eXOMGjXKR9x8uPyIiYnBtm3bEH1RC+198MEHH3zw4fIib2IfJNy/GHZtG7ywfgVeac1CfzE2v3ojbnhpDcr0HfD6tjV4SvfeacTt11HB/6+9O4GP6dz/B/6ZmeyxxJ7QWGKJllgqNJegtht7VV1bqEtCUVVb0SqCtlFbo0SCWGqLlutqaRW1xb61EkkQsVQsSWyJLLLMzPM7Z2aQpMGE0X/O/37eL17JnPPMWZ7zzMz3e55nnhg3QMVYDo5PagTvOeegs26CgN+PYVr9F+s169ChAyZOnGj4SVQcPUrcXuVtb/ofxSEHRERUHJTt8C90cpY+j3JPYdY/XOHq/gbqvFYVzeWkTV0eLT6di5Gvs79TkbIOY93mOGilX608uqJH3RePO/gdN1IKJm5kcZydiYiIigNNjSHYeHwvwgJGol+npqjtXAGv1WuD3qNmYfXBSOyZ7o3SUjlVGQ+08XkbLdt0Rkt3Sw96pFdBf/c21DWbS9fsHXw0adALzSb5COMWUgoOlSSLc3R0RHJysuEnERERUXH21ltv4dtvvzX8JCqOOFSSXhneuSIiIiKlYNxCSsHEjSyOY8WJiIhIKfjdfFIKJm5kUTqdDiqVyvCfiIiIqLjjDWdSCiZuZFEcbkBERERKwtiFlIKJG1kUhxsQERGRkjB2IaVg4kYWxbtWREREpCSMXUgpmLiRRXGcOBERESkJYxdSCiZuZFEcbkBERERKwtiFlIKJG1kUhxsQERGRkjB2IaVg4kYWxbtWREREpCSMXUgpmLiRRXGcOBERESkJe9xIKZi4kUXxzY+IiIiURKfTsceNFIGJG1kUhxsQERGRUshxi0ajMT0iKt6YuJFFsceNiIiIlIJxCykJEzeyKPa4ERERkVIwbiElYeJGFsXJSYiIiEgp2ONGSsLEjSyKb4BERESkFLzhTErCxI0sikMOiIiISCkYt5CSMHEji2KPGxERESkF4xZSEiZuZFEcckCvlP4ezsXegM70sPjJQXJ8FCIjI6X/UYhNSDMtz0TczlUI2xqF+3rTopeVk4z4KHk/0v+oWDze1Usz71hzkuMRZTrPs1dT8GKnpUPKpcP4ce0yLA5aiCUrN2Fv7F1opTXaK5E4e89SlZWHBetNdy8WZy6lmx5Jm755BlEJT2mdz2m7mXG7sTpsM07fls9Zj/uR/0XYql9w7snm89Aj5erZx/V/4VamaflLyrn9pG6k/1Hnb0mt4QndvSs4a1oXGRXzlLrT4965WNww+0VatPIZV4/h5+9XYknwMqz98QiupMn1pcPlszHGAkRFxB43UhImbmRRfAOkV0l3LhRD+83H0SzTgmJHA1vNdawc2BSNGjVGu4AIyIeqjVmAAd39MLRXV3y6J9tY1MAYtN58kUxUYwvN9ZUY2LQRGjVuh4AIy1SKuceqRhI2Dm2Gxo0awWvcz4bzLIqsuM2Y1NEd1bzGY8eDKvDq6IPmNdWI/LYPvN5qi9adxuKnRGEqbUEWqTc9EnfOxqdr7sClegnpcQ7iv5+OmbtVqOZa+N+Dembbzd4n1UVnDBnaG626fIHTieEY2rYXhg7phla+K3HtL/mrGla6s5jfo4nUzprgvW+jpSOwALX03p28E5938TRc10Yeb2Hw+j8fJ5sqGxvor6zBsPb+WB0v/+0r04q8dOcQOrQf5pv7IjWzfPalrZj6rgeqNR6E5TFWqNu8BRqUvYUtk3ugQ/vW6Dp5t6kkUdHwhjMpCRM3sigOOaBXJxP7l6zAsej1CP7xrmlZcaNB6Rot0bha/rdWqyrN4dO8Jqo37oQ27k9ubOiTt2PSiCWIlbuYikpTGjVaNkaBXb00c4/VqmITNHUvAZXxYZFknp6P7q36Ye5eawza+CtCP+wCz7p10aj1exgbuhP/Ge+K5IR0vIK0zSL1pk/+AeO/TsG7I1qhkpS86M4vxqh1ZeE3oCFKm8rk95y2q3JE2TI20ieyGlmR+3EkpRTKlNJApVEh5dBenCokKytR/R9o4Grpi18GtdqPw6whHrBSqyC0Cdg8aiDmnDb2u6lLVEHDru+jS8eO6Ne1ESo7GBbnk7l/CVYci8b64B9hzqvUnPLZMUvQq/W/8OXPD/HOqgPYMvN9tG1cDw1bvofxweEIbC2QnPFKWgv9D2DcQkrCxI0sij1u9KroEzdhcfhV6PS3sS10DS69SC/V36VgNuPUFrP2XcSVk0vRp6qpmyLzLJYM/gDfXX65E3mRxOmZinCsKtUL7D3zCGYOnoLfknSwbz0Kn7RxMq14RINqvYMw39f1lX5AvUy9ZUX8hN33/8S2aV9gU2w6buzcjqgH0Vj++QLsvPbX6/nctmvTDDMiLiIudinec62CKq91Q+gf8Th/7Eu0rio9/ps/qVXWjfHvj9qivLRffcohzBgwAb8YhnAaVsLGViPnmH+lT8SmxeG4qtPj9rZQrHnei9Sc8jmRmOc3ET/f0MHh7XEI6O5coF04wnP8FxjkVnhPJ9HzMG4hJfmbPw7o/3e8c0Wvhhaxq7fjTs1KUlgvkHl4OZaeyDuM74n0mB8wfcRQ+PftBJ++k7A2Ms8XcdJj8MP0ERjq3xedfPpi0tpIGNZmx2Hb3MkYO2YMxkwIxdH0JOyfNwQd2/XHoj+M+0mN2oCp/n4YMdwPQ2dsxaU8u9fd3I+gkT3x7r8/wcyQfZBykid017AveDrGjZW2Pe4r/HhVB33yAXz5bieM25EIXeoxLP1kDCYsO2b6PlEqojZMhb/fCAz3G4oZWy/hya50uLk/CCN7vot/fzITIfuSnvqdKZk++RBCp4zFGOm8xo6bjtCIPxG/fQ4myccyZiw++WoD/ribhtgtczB5fADWnDhbxGN9JBOx4Z+hb/tWaNvnc2y9/PQuxHs/BiEsJlu6ilZ4o9XbqFzop1AZdJ44GT6V5PQqG3Hb5mKy4ZgnIPRoOpL2z8OQju3Qf9EfxuKZl7Bj8SxMnzYavdu3QTf/OdidkPcYzKy31ChsmOoPvxHD4Td0Brbmvch5qKUgT0RtROCcaRg86XukWWlw/2AYAmdPhN8Xu/NcL5mZbdfRGSXOHEX2wA/RsYSUvjpVgfroGVSQ2rKnjanMU4jsq9gaMBjd2rZFj+FB2H9LOjt9Mg6GfGZs04ZrHY7I+3pkX/oV304dh/EBa/BHimkDBamsUNN/FZYNqglrlUD2+WXw81+B+Of0DGtjV2P7nZqGXkiReRjLl54oUBf5mVM+bcc3CD6ZYWgvjTr4FN5eHFpi6MhWpgdERcO4hRTF19dX+Pn5CSJLCAkJEcOHDzc9IrKQ9N1iTJ9AcebYZ8JDjiShFi4DNot7ptWPZEctEG3L2Yvms8+JrOiZwlMqq6kyRPz0wLBSLGhbTtg3ny3OZUWLmZ7WQqWpIoYYVgqRsW2wcFFL8aHN22LU5C7CvZKdUMFGvB10TTw8NVu0LusoWs69IHKlYxlRw0ZU6btB3NBJT0zbJyZ42Au10zti1S2dyDr7jWhXTm04Ruch28VDqUjumWmikbUce7qLCYezRe71k2Lz2KZCChWEumJ38fVPv4hfT14XuVLpU7Nbi7KOLcXcC7nSaY8QNWyqiL4bbgjjriYID3u1cHpnlbilyxJnv2knysnHrHYWQ7bLeypIKy4H+wgnqYzKro349pq0layTYkpD6dyl46s0aKtIl0rpbgSL/oO+F8nS6qIc638HlhNqSHVcoYkYNGupCOxZTWikx6U7LzPWzV9kiV0fuEplpO2rSope4fLezZCxTQx2ketUuh6jJosu7pWEnQrC5u0g6RTPiyWdKgo777niklYnEpd2FA4qlXCUrnN0rvHpZtXbw1NiduuywrHlXHEhN13sHlFD2FTpKzYUdiLpx8XX/3xN2NtXFd2XxIjspB3iE68KwrbU68J/k/FaPWZW280WVyLWiiVrDokkw5NTROyvK0Xo5khhbJ2F0F4W81paS9tTCfvqncQnS9eKhYPqCXvp3B2afC6OZkhFriwX3crL9WYl3CcclvYiyxL7Pm4l/LYWfPU8kivOzBomZsdopYo7IqY1Kym1FeP1ajr1sHiQGyMC/aaLk6a6fUKqszF9ROCZY+IzD7l9Se3FZYDY/LTdmFU+S/w2Qm5T8rUqI/r/p7A2TvRyDh48KFq0aGF6RFQ8NWjQQCxcuFD6zCWyIA45IMvT49amdbjfcRA8PP3h7+0AlTw5xNYQrL+ap99En4TwabOwP9UVXt5usK3dEV0aOEINLXK1eiSFT8Os/alw9fKGm21tdOzSAI7SO6A219iNoHF0hJQMSI34NGIqLUDk79sRNG0upvZSY33AbESkuaFVGzdY2XvAoyZwc8tirI3PxbXvvkRI9ENo6rVAywpq2NZ/H32a5r97qypVCiVNv8usqniilXtZw5AHlW1lvPnPTvDxrAL1rfUImB2BNLdWaONmBXsPD9TETWxZvBbxudfw3ZchiH6oQb0WLVFBbYv67/dBgV0VoEGNgSPQw1kDkX0MmzddgU5jA1sHO1ip9Li967/4LU2Pu/vi4Nqvq7RN848176vc+q0PEfT5MHzYrYG0XCA9+g/E5ppW5qPD7dv3pKsnUdnD0cHM4W0aRzgaLw5Ox1TCgsjfsT1oGuZO7Q198m5s3pOMrOObsPGiQOlKFeEo5UeZZ08jWv5umN6cepPa2PoAzI5Ig1urNnCzsoeH8SJj8dp4U5k8HJth4s4EZGb+iR9HvAGbih0x52gyMlNjsbxX5TxDWcxsu7BB9ZYDMGJgC1Q0PLk0XvcZjA/ea5DvWhROA7e+Afhi2ACMmjMare2AzD+WIGhbCjTVB+LTwXVhrdLi0taNOCJ3k+puIDL7bQzrVMb49Gcp8Q9MXb8A3VzkdDwNp2YPxEdbko3XrwD9rU1Yd78jBnl4wt/fGw7S5dInbkXI+quF9m6aV16LW4mP9mcHe1vDL0QWxclJSEmefL4QWYCWQw7I0rQxWLWtJPr0coFaUwO+H3Q1fPdGZERg2bLfn8yml3UIuw6kQq+SEhMbqYBNUwScuIO0q9+hZ5ksHNp1AKl6FWxsbaQ3Phs0DTiBO2lX8V3PAgGslTva/rMmbCu3w+gZo9G23AnsP/IAQn8HB0MmYcLEQBzIro6a1XNxJyETJ4+cxkO5H6WUE8oY8hBr6TVg2FKR5RzbjyMPBPR3DiJk0gRMDDyA7Oo1UT33DhIyT+LI6Ydy1wNKOZWRwnWJtKPn7qqkDwb0cIVGZOFY+AacPbUdqd0mom0JKYVI+gXf77iI7ccd4NO6kJkmzKS2tpFqVEohrKQAX+46ycpEplQnf6WBU5nSxu+XiYfIfJgnBdAn4vSWhRjX7x10794d3d/pgYETl+C3+LyzDVrBve0/UVNKINuNnoHRbaU2Uak3ZnzzCUZP+wzv2kYgbPNppEv7Fjk5xraRY0695eDY/iN4IPS4czAEkyZMROCBbFSvWR25dxJMZZ7vLx+o5rZdC1GXroFqhi+mpeHc2UtS2mOLZsOHwVvKirSXN2DRliTknN+CyzX7oMlzhl8+YlVrCMLChsHdVgWRexlrh4/EDzcKpm5axKzahpJ9esFFrUEN3w/Q1XiiiFi2DL//5UTNLa9BqdIlTe0lHalphaWARC+HcQspyV8+Z4heBnvcyNLS96zA3hwt9gRMwIQJExB4vATqV7aCSuQids0S7Eg1FcxOQUqmFFDqEpFw3RT5qW1ha2iO2UhJyYQeOiQmXDcFzGrYGlfmpyqL8uXz9ATlpiI1Qw5UbVC//1eYNy8IGyMu4OKFE5jbTo20B/J2pbhSp4O2YDxbRLmpqTDuqj76fzUP84I2IuLCRVw4MRft1Gl4IJ+flILodNpCez0KZ4eWvu+hlpVATuR6fPrNXTQcPAwD2jtBrb+LHcHjsK9UZ7SwMxW3BCGkoyyMNTxbNkMpORKXEsmEywlPelfUzmjSczh8Sv2OX7Ztw7Zf4lD5PX+0r5X3wFQoW768Mfl6RF0R3oOGwDt9KXp2D4G+/huQctIncs2pt1ykpmYY1tnU74+v5s1D0MYIXLh4ASfmtjMWeQFmt12LsZLef42/aTTGXzRuAzG8WwXpWt/DL0uWYWP4VdTtVTd/HT6TGhU6z8O66d5wknPC++cQWzBxS9+DFXtzoN0TYDjPCYHHUaJ+ZVipBHJj12BJwRM1u7wNmrXwhKOpvVyJuyKlfESWxbiFlISJG1kU71yRRelvYlN4OgavDJYSJimRkf8vWIrQj71gKwVzuptbEBqeYAzGHaqhqjzLgf4+InYcQP6/W+yAalXlySH0uB+xAwcK/aPGJiqV/O8JGxe4VJC3exPHD13MFzjqpcDS2cWYSIg7SUgqPCsolLqQGRltXFxg3NVxHLqYf0+wcYaLIaEUuJOUZDxnM9k088W/6llDlXsRJ4UnujhXRFffziiv1iPlyGU4d21m6DF7msKO9cWoUfG9cRhaz1ZKwbSIjthfoM5UKFFCHk4o/+qIkiXl881LvjYFjiU7EvO7eaPv/MvoGLwKw143Pf8Rs+rNBi4uFQzt4+bxQyhY9S+kKG33JUl5sumXDDw0dP+WhUfjmqbhrGXRfaSvIXHPOv41PrvcDD2rFvWj3wFNJq7Fol6vScmVadFjUp1tCkf64JUIfnSe8xZgaejH8DKeKLaEhiPh8YkWpbwazr1GoW91KdmV2kvs3t0oZNJOiQ4p9y2eBdP/CMYtpCRM3MiiOFacLCn79xCE3m2KDvKXrx7ToFa//mglfylGpGHvsjBEyl1ott4Y0McdNiodEjbOwNwjciCnQ+K+9dgWbwXvAX3gbqOCLmEjZsw9AsPaxH1Yv830HSa9zhhEC630QZ4nnLZtgV5d5KGGuTgTOgVhsfLQvQxErQjEhjhpuz274DUpL9Ce24Wf47RS3LkL+84aI3+9tE3TL6YAXUBn2rStvR008ilkP0SmNhHHjl6ApkUvdHHVQOSeQeiUMBh3FYUVgRsQZ+WNnl1ek85ei3O7fkacVoebu/bBuCtp+88aRWbVAP17vwlrdUV07tdZCuUBp4790b2yBtav90TvvNMWmnms8m71emPGIIReKi09fvSEx9soRImWmBkehB5VrZGxdyEC95i+8/ZMetOxCEOQlbd8zvFVCD14F0Ljijp1rHHjSoJh6KrhOXKdSO3i+fVmixa9usBVI5B7JhRTwmINf1A8I2oFAjfEyQWKrEht96UIPMyQZ12UzibpIi7dE7Ct9298IE9NaWLX/AP4v2UvJT8l0bbXO6j0zE9+PbIepiLTWIlPaKphQOh3GO1hb1pgkv07QkLvommHCvkCCk2tfujfSk6iBdL2LkPYoxMtanknHwQuH4c3S6uQdXgRZv50K9/1h3Sl4sLHYMyKK6bHREXDuIUUhbNKkiVNmTJFzJo1y/SI6EXpRNLhRcK3nqOwcmkvJoftEufTTGvuxYjdqz8WXiXlGfqkKE/tJLw+ChdR8vR7D46L+d2qGWYcVNmWF7UatRYDFhwR9wwz9T0Qx+d3E9XspOepbEX5Wo1E6wELxBF5ZdZFsXXkm4bnQeMifAJ+FZeNU/AZ6JJ3iyneFYW1SiXU9s6ijqePGB0eLwwT6+kSxfaxTYSTWiVsK9QSDdoME75e1tI+rESphoPE0qN/iF1T2ojy8iyGKgfh+dF/xbl06WnXw8WAGrZCJR1LxTe6ii8PyyeoE8m7pwjvitbScrWwd64jPH1Gi/B44xR+usTtYmwTJ6GWnlOhVgPRZpiv8LKWztWqlGg4aKk4caeQGRBNtJe+EW1q+4ufH0/kmCX2j3YXntMjjech0141+1jToteJ992NswFaufURq06dFMt6VjXMAKiyfkP4/XBOZJg2Wxjtrf3imyEthGuFOqLTR1+LsPBN4vuVc4Rf03KilKun6DosSETclc8nS1zcOlK8KV83KX128QkQv+a5ONory0SXcmrp2DSiUstRYml4gGhTSiqrLiUaj94mbkqbMKvedMli9xRvUdFaJVRqe+Fcx1P4jA4Xpqovghdsu0UlzyrZqoyo4/OuaN2sh5i+ep2Y09tdVGrwvlh+tmDNS8e0tqeo6DZC/Pasi5J+Uez9LkB0q24nqnedJlbtuSBMh/5Y1tkg0bHN54ZZJXVJh8Ui33rC0cpFtJ8cJnY9OVERs3u1+NjLNCMl1MLJ6yOxft+uIpUPz1MxKWe+E+M61xVlS9cWncfOF6s3/UdsXDlPTBn1gZgQfMgwIyrRiwgPDxd9+vQxPSIqnh7NKqmSEzc7OzuEhYUZEjmilzF58mSUKVMGkyZNMi0h+rtlIzH6BKKTreDasCncy+X/7kJ2YjRORCfDyrUhmrqXyzc74jPp03Et8hTiUh3h1uhNuDnlHcanw93zx3Am0RF1vepDfekMHpR/A7UrOTx7WEPaFRw/fR2Or7+F+pWe9Hrp068h8lQcUh3d0OhNN+Tf1V2cP3YGiY514VVfjUtnHqD8G7VRyeGZe5I2moK4uAy41X0yI6Q+MRYXNHXxer5eoad4yrG+LH36DcRGXcD1lGxoHJxQqZo73GuURVEmEMy6eQbH4zVw9/KAs3RoaZeP4eSN0mj4j9fx+PKbVW96pF+LxKm4VDi6NcKbbk7IW/XFSyauxd1G+TrVYJd2FadPxuNhmdpo3LAaShZyOfXXgjF6RVMsmNHsmcNin0+Pu39eh021qmbMeGl5Ofcu4Wz0ZSRnqFDCpRY8PKrnf30QFdG6deuwc+dOrF271rSEqPhp2LAh/Pz8wMSNLGr8+PGoXLmy4ScREf2/k3EyGB/Pv4wOXwWi2W9f4pfW0/ChO7McorxWrVqFiIgIw0+i4upR4mbGbVYi83GsOBFRcaDFxW3LseaHxVgYHIyQG43RuzaTNqKCODkJKQkTN7IovgESERUHVmgwciHmjR6A+rZl0WdcD8MfWCei/HjDmZSEb+NkUfx7KERExYPauTVGB63Asq8GoUlp00IiyodxCykJEzeyKPa4ERERkVIwbiElYeJGFsU7V0RERKQUjFtISZi4kUVxrDgREREpBXvcSEmYuJFF8Q2QiIiIlII3nElJmLiRRXHIARERESkF4xZSEiZuZFHscSMiIiKlYNxCSsLEjSyKQw6IiIhIKdjjRkrCxI0sim+AREREpBS84UxKwsSNLIpDDoiIiEgpGLeQkjBxI4tijxsREREpBeMWUhImbmRRvHNFRERESsG4hZSEiRtZFMeKExERkVKwx42UROXr6ys2btyIadOmmRYRvbhFixahb9++qFChgmkJERERUfF079492NnZwcHBwbSEqPiZPn06Fi5cCNWGDRtEcHAw1Gp2vtHLO3nyJOrXrw97e3vTEiIiIiIielFynjZv3jz8H7oogmRetKuoAAAAAElFTkSuQmCC";
// Function to add a properly positioned college header image
const addCollegeHeader = (doc) => {
    doc.addImage(collegeHeaderImg, "JPEG", 10, 10, 190, 30);
    doc.setFontSize(14);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);
};

// ✅ Generate PDF for Solo Participants
    const generateSoloPDF = (studentsList, eventName = "Unknown Event") => {
        const doc = new jsPDF();

        // Add header
        addCollegeHeader(doc);
        doc.setFontSize(14);
        doc.text(`Event - ${eventName}`, 10, 60);

        // Define table
        doc.autoTable({
            startY: 70,
            head: [["Name", "Email", "Verified", "College", "Phone", "Payment Method", "UTR Number", "Receipt No", "Payment Image"]],
            body: studentsList.map(student => [
                student.name,
                student.email,
                student.status === "verified" ? "Yes" : "No",
                student.college,
                student.number,
                student.paymentMethod,
                student.utrNumber || "N/A",
                student.receiptNumber || "N/A",
                student.paymentImage ? "Available" : "No"
            ]),
            styles: { fontSize: 9 },
            theme: "grid", // Adds vertical and horizontal lines
        });

        const safeEventName = eventName.replace(/[^a-zA-Z0-9-_]/g, "_");
        doc.save(`${safeEventName}.pdf`);

    };

    // ✅ Generate PDF for Teams
    const generateTeamPDF = (teamsList, eventName="Unknown Event") => {
        const doc = new jsPDF();

        // Add header
        addCollegeHeader(doc);
        doc.setFontSize(14);
        doc.text(`Event - ${eventName}`, 10, 60);

        let startY = 70;

        teamsList.forEach((team, index) => {
            doc.setFontSize(12);
            doc.text(`Team: ${team.teamName}`, 10, startY);
            doc.setFontSize(10);

            // ✅ Leader Details Table
            doc.autoTable({
                startY: startY + 5,
                head: [["Leader Name", "College", "Phone", "Email", "Payment", "UTR No", "Receipt No", "Payment Image", "Status"]],
                body: [[
                    team.leaderName || "",
                    team.leaderCollege || "",
                    team.leaderNumber || "",
                    team.leaderEmail || "",
                    team.paymentMethod || "",
                    team.utrNumber || "N/A",
                    team.receiptNumber || "N/A",
                    team.paymentImage ? "Available" : "No",
                    team.status || ""
                ]],
                styles: { fontSize: 9 },
                theme: "grid"
            });

            // ✅ Ensure `finalY` is defined correctly
            let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : startY + 15;


            // ✅ Members Table
            if (team.members.length > 0) {
                doc.autoTable({
                    startY: finalY + 5,
                    head: [["Member Name", "College", "Phone", "Email"]],
                    body: team.members.map(member => [
                        member.name || "",
                        member.college || "",
                        member.number || "",
                        member.email || ""
                    ]),
                    styles: { fontSize: 9 },
                    theme: "grid"
                });

                // ✅ Ensure `finalY` updates safely
                finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : finalY + 10;
            }

            // ✅ Ensure `finalY` is valid before drawing a horizontal line
            // ✅ Draw horizontal line only if `finalY` is valid
            if (finalY) {
                doc.line(10, finalY + 5, doc.internal.pageSize.width - 10, finalY + 5);
            }

            startY = finalY + 10;
        });

        const safeEventName = eventName.replace(/[^a-zA-Z0-9-_]/g, "_");
        doc.save(`${safeEventName}.pdf`);

    };

    // ✅ Generate Excel for Solo Participants
    const generateSoloExcel = (studentsList, eventName = "Unknown Event") => {
        const wsData = [
            ["Name", "Email", "Verified", "College", "Phone", "Payment Method", "UTR Number", "Receipt No", "Payment Image"]
        ];

        studentsList.forEach(student => {
            wsData.push([
                student.name,
                student.email,
                student.status === "verified" ? "Yes" : "No",
                student.college,
                student.number,
                student.paymentMethod,
                student.utrNumber || "N/A",
                student.receiptNumber || "N/A",
                student.paymentImage ? "Available" : "No"
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);  // Converts array to sheet
        const wb = XLSX.utils.book_new();  // Creates a new workbook
        XLSX.utils.book_append_sheet(wb, ws, eventName);  // Append sheet to workbook
        
        const safeEventName = eventName.replace(/[^a-zA-Z0-9-_]/g, "_");
        XLSX.writeFile(wb, `${safeEventName}_Solo_Participants.xlsx`);
    };
    

    // ✅ Generate Excel for Teams
const generateTeamExcel = (teamsList, eventName = "Unknown Event") => {
    const wsData = [
        ["Team Name", "Leader Name", "Leader College", "Leader Phone", "Leader Email", "Leader Payment", "Leader UTR No", "Leader Receipt No", "Leader Payment Image", "Leader Status", "Member Name", "Member College", "Member Phone", "Member Email"]
    ];

    teamsList.forEach(team => {
        // Leader Row
        const leaderRow = [
            team.teamName,
            team.leaderName || "",
            team.leaderCollege || "",
            team.leaderNumber || "",
            team.leaderEmail || "",
            team.paymentMethod || "",
            team.utrNumber || "N/A",
            team.receiptNumber || "N/A",
            team.paymentImage ? "Available" : "No",
            team.status || ""
        ];

        // Add leader row with empty member columns
        wsData.push([...leaderRow, "", "", "", ""]);

        // Add member rows
        team.members.forEach(member => {
            wsData.push([
                "", "", "", "", "", "", "", "", "", "",
                member.name || "",
                member.college || "",
                member.number || "",
                member.email || ""
            ]);
        });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);  // Converts array to sheet
    const wb = XLSX.utils.book_new();  // Creates a new workbook
    XLSX.utils.book_append_sheet(wb, ws, eventName);  // Append sheet to workbook
    
    const safeEventName = eventName.replace(/[^a-zA-Z0-9-_]/g, "_");
    XLSX.writeFile(wb, `${safeEventName}_Teams_Participants.xlsx`);
};

    useEffect(() => {
        if (showForm) {
          document.body.classList.add("modal-open");
        } else {
          document.body.classList.remove("modal-open");
        }
      
        return () => {
          document.body.classList.remove("modal-open");
        };
      }, [showForm]);
      

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === "isTeamParticipation") {
          setNewEvent((prev) => ({
            ...prev,
            isTeamParticipation: checked,
            maxTeamSize: checked ? prev.maxTeamSize : ''  // Reset if unchecked
          }));
        } else {
          setNewEvent((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
          }));
        }
      };
    
      const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setNewEvent((prev) => ({
                ...prev,
                [name]: files[0], // Store the file
            }));
    
            if (name === "image") {
                setImagePreview(URL.createObjectURL(files[0]));
            } else if (name === "rulebook") {
                setPdfFileName(files[0].name);
            }
        }
    };
    
    const handleAddEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('eventName', newEvent.eventName);
        formData.append('description', newEvent.description);
        formData.append('registrationOpen', newEvent.registrationOpen.toString());
        formData.append('isTeamParticipation', newEvent.isTeamParticipation.toString());
    
        if (newEvent.isTeamParticipation) {
            // Ensure the minimum team size is at least 1 (leader only)
            const teamSize = Math.max(1, newEvent.maxTeamSize);  
            formData.append('maxTeamSize', teamSize);
        }
        
        if (newEvent.image) formData.append('image', newEvent.image);
        if (newEvent.rulebook) formData.append('rulebook', newEvent.rulebook);
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/create`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server Error:', errorText);
            } else {
                fetchEvents();
                setNewEvent({
                    eventName: '',
                    description: '',
                    registrationOpen: true,
                    isTeamParticipation: false,
                    maxTeamSize: "",
                    image: null,
                    rulebook: null
                });
                setShowForm(false);
                handleCloseForm();
            }
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };
    
    
    // Function to fetch latest events
    const fetchEvents = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events`);
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
    
    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, { 
                method: 'DELETE',
                credentials: 'include',  // Ensures HTTP-only cookie is sent
            });
    
            if (response.ok) {
                setEvents(events.filter((event) => event.id !== eventId));
            } else {
                const errorText = await response.text();
                console.error('Failed to delete event:', errorText);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };
    
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setNewEvent({
            eventName: event.eventName,
            description: event.description,
            registrationOpen: event.registrationOpen ?? false,
            isTeamParticipation: event.isTeamParticipation ?? false,
            maxTeamSize: event.maxTeamSize ?? "",
            image: event.image || null,  
            rulebook: event.rulebook || null,  
        });
        setShowForm(true);
    };
    
    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!editingEvent) return;
    
        try {
            const formData = new FormData();
            formData.append('eventName', newEvent.eventName);
            formData.append('description', newEvent.description);
            formData.append('registrationOpen', newEvent.registrationOpen.toString());
            formData.append('isTeamParticipation', newEvent.isTeamParticipation.toString());
    
            if (newEvent.isTeamParticipation && newEvent.maxTeamSize) {
                formData.append('maxTeamSize', newEvent.maxTeamSize);
            }
            if (newEvent.image) {
                formData.append('image', newEvent.image);
            }
            if (newEvent.rulebook) {
                formData.append('rulebook', newEvent.rulebook);
            }
    
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/edit/${editingEvent.id}`, {
                
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });
    
            if (response.ok) {
                // Fetch latest event list from server after successful update
                fetch(`${process.env.REACT_APP_API_URL}/api/events`)
                .then(response => response.json())
                    .then(data => setEvents(data))
                    .catch(error => console.error("Error fetching updated events:", error));
    
                setEditingEvent(null);
                setNewEvent({
                    eventName: '',
                    description: '',
                    registrationOpen: true,
                    isTeamParticipation: false,
                    image: null,
                    rulebook: null,
                });
                setShowForm(false);
            } else {
                const errorText = await response.text();
                console.error('Failed to update event:', errorText);
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };
    
    const handleOpenForm = () => {
        setEditingEvent(null); // Ensure we're in create mode
        setNewEvent({
            eventName: "",
            description: "",
            registrationOpen: true,
            isTeamParticipation: false,
            maxTeamSize: "",
            image: null,
            rulebook: null,
        });
        setShowForm(true);
    };
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingEvent(null);
        setImagePreview(null);
        setPdfFileName("");
        setNewEvent({ eventName: '', description: '', registrationOpen: true });
      };
      const handleShowForm = () => {
        setEditingEvent(null);
        setNewEvent({ eventName: "", description: "", registrationOpen: true });
        setShowForm(true); // Show form on clicking "Create Event"
      };
    
      // Function to handle download format change
    const handleDownloadFormat = (e) => {
        setDownloadFormat(e.target.value);
    };
      
        // ✅ Download All Solo Participants
    const downloadAllSolo = () => {
        if (filter === "all" && soloStudents) {
            if (downloadFormat === "pdf") {
                generateSoloPDF(soloStudents, selectedEvent?.eventName || "No Event");
            } else {
                generateSoloExcel(soloStudents, selectedEvent?.eventName || "No Event");
            }
        }
    };

    // ✅ Download All Teams
    const downloadAllTeams = () => {
        if (filter === "all" && teams) {
            if (downloadFormat === "pdf") {
                generateTeamPDF(teams, selectedEvent?.eventName || "No Event");
            } else {
                generateTeamExcel(teams, selectedEvent?.eventName || "No Event");
            }
        }
    };

    // ✅ Download Verified Solo Participants
    const downloadVerifiedSolo = () => {
        if (filter === "verified" && soloStudents) {
            const verifiedStudents = soloStudents.filter(student => student.status === "verified");
            if (downloadFormat === "pdf") {
                generateSoloPDF(verifiedStudents, selectedEvent?.eventName || "No Event");
            } else {
                generateSoloExcel(verifiedStudents, selectedEvent?.eventName || "No Event");
            }
        }
    };

    // ✅ Download Verified Teams
    const downloadVerifiedTeams = () => {
        if (filter === "verified" && teams) {
            const verifiedTeams = teams.filter(team => team.status === "verified");
            if (downloadFormat === "pdf") {
                generateTeamPDF(verifiedTeams, selectedEvent?.eventName || "No Event");
            } else {
                generateTeamExcel(verifiedTeams, selectedEvent?.eventName || "No Event");
            }
        }
    };


    const filteredSoloStudents = soloStudents.filter(student => {
        return (
            student.name &&
            student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) &&
            (filter === "all" || (filter === "verified" && student.status === "verified") || (filter === "notVerified" && student.status !== "verified"))
        );
    });

    const filteredTeams = teams.filter(team => {
        return (
            team.teamName &&
            team.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase()) &&
            (filter === "all" || (filter === "verified" && team.status === "verified") || (filter === "notVerified" && team.status !== "verified"))
        );
    });

    const verifyStudent = async (studentId, studentName, eventName) => {
        const subject = `Confirmation of Your Successful Registration for TECHTRIX 2025`;
        const body = `Dear ${studentName},
    
    Greetings from the TECHTRIX 2025 Team!
    
    We are pleased to inform you that you have successfully registered for ${eventName}, the Technical Fest organized by the Department of Computer Science & Engineering and Artificial Intelligence, Priyadarshini J. L. College of Engineering.
    
    Further updates or changes regarding the event will be communicated via email or through our official website.
    
    We look forward to your enthusiastic participation!
    
    Best Regards,  
    TECHTRIX 2025 Organizing Team  
    Department of Computer Science & Engineering & AI  
    Priyadarshini J. L. College of Engineering`;
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send-to-student/${studentId}`, { 
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                credentials: "include",  // <-- Add this line to include cookies
                body: new URLSearchParams({ subject, body })
            });
    
            if (response.ok) {
                alert("Student verified successfully, and email sent.");
                setStudents(students.map(student =>
                    student.id === studentId ? { ...student, status: "verified" } : student
                ));
            } else {
                alert("Failed to verify student.");
            }
        } catch (error) {
            console.error("Error verifying student:", error);
            alert("An error occurred.");
        }
    };
    
    const verifyTeam = async (teamId, teamLeaderName, eventName) => {
        const subject = `Confirmation of Your Successful Registration for TECHTRIX 2025`;
        const body = `Dear ${teamLeaderName},
    
    Greetings from the TECHTRIX 2025 Team!
    
    We are pleased to inform you that your team has successfully registered for ${eventName}, the National Level Technical Fest organized by the Department of Computer Science & Engineering and Artificial Intelligence, Priyadarshini J. L. College of Engineering.
    
    Further updates or changes regarding the event will be communicated via email or through our official website.
    
    For any queries, please contact:
    bitcforum2022@gmail.com
    
    We look forward to your team's enthusiastic participation!
    
    Best Regards,  
    TECHTRIX 2025 Organizing Team  
    Department of Computer Science & Engineering & AI  
    Priyadarshini J. L. College of Engineering`;
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send-to-team/${teamId}`, { 
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                credentials: "include",  // <-- Add this line to include cookies
                body: new URLSearchParams({ subject, body })
            });
    
            if (response.ok) {
                alert("Team verified successfully, and email sent.");
                setTeams(teams.map(team =>
                    team.id === teamId ? { ...team, status: "verified" } : team
                ));
            } else {
                alert("Failed to verify team.");
            }
        } catch (error) {
            console.error("Error verifying team:", error);
            alert("An error occurred.");
        }
    };
    


    const sendEmails = async () => {
        // Prevent multiple clicks while sending
        if (loading) return;
    
        setLoading(true);
        setMessage(""); // Clear any previous messages
    
        try {
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("body", body);
    
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send-to-all`, { 
                method: "POST",
                body: formData,
                credentials: "include",  // Include cookies with the request (for authentication)
            });
    
            if (response.ok) {
                setMessage("✅ Emails sent successfully!");
            } else {
                setMessage("❌ Failed to send emails.");
            }
        } catch (error) {
            console.error("Error sending emails:", error);
            setMessage("❌ An error occurred while sending emails.");
        } finally {
            setLoading(false);
        }
    };
    
    
    
    return (
        <div className="admin-dashboard">
            <h1 className="admin-heading">Admin Dashboard</h1>
            <div className="admin-buttons-bar">
            <div className="sponsor-section">
                {/*  */}
                <div className="sponsor-container">
      <button className="toggle-form-btn" onClick={() => setShowSponsorForm(true)}>
        Add Sponsors
      </button>

      {showSponsorForm && (
        <div className="modal-overlay" onClick={() => setShowSponsorForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSponsorForm(false)}>✖</button>
            
            <form onSubmit={handleSponsorSubmit} encType="multipart/form-data">
              <input type="text" name="name" value={sponsorFormData.name} onChange={handleSponsorChange} placeholder="Sponsor Name" required />
              <input type="text" name="websiteUrl" value={sponsorFormData.websiteUrl} onChange={handleSponsorChange} placeholder="Website URL" required />
              <input type="file" name="logo" onChange={handleLogoChange} accept="image/png, image/jpeg" required />

              <label>Number of Images:</label>
              <input type="number" name="imageCount" value={sponsorFormData.imageCount} onChange={handleImageCountChange} min="1" />

              {Array.from({ length: sponsorFormData.imageCount }).map((_, index) => (
                <input key={index} type="file" onChange={(e) => handleImageChange(index, e.target.files[0])} accept="image/png, image/jpeg" required />
              ))}

              <button type="submit">Add Sponsor</button>
            </form>

            <div className="sponsors-list">
              <h3>Existing Sponsors</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Logo</th>
                    <th>Website</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsors.map((sponsor) => (
                    <tr key={sponsor.id}>
                      <td>{sponsor.name}</td>
                      <td>
                        {sponsor.logo ? <img src={sponsor.logo} alt={sponsor.name} className="sponsor-logo" /> : "No Logo"}
                      </td>
                      <td>
                        <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
                          {sponsor.websiteUrl}
                        </a>
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteSponsor(sponsor.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
{/*  */}
<div className="unique-qr-app">
    <button onClick={toggleQrForm} className="add-qr-btn">
        {isFormVisible ? "Close Form" : "Add QR"}
    </button>

    {isFormVisible && (
        <div className="qr-form-container">
            {/* Cross Button */}
            <button className="close-btn" onClick={toggleQrForm}>✖</button>

            <h2 className="unique-title">Upload Unique QR Code</h2>
            <input 
                type="text" 
                placeholder="Enter UPI ID" 
                value={uniqueUpiId} 
                onChange={(e) => setUniqueUpiId(e.target.value)} 
                className="unique-qr-input"
            />
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleQrImageChange} 
                className="unique-qr-file-input"
            />
            {previewQrImage && <img src={previewQrImage} alt="QR Preview" className="unique-qr-preview" />}
            <button onClick={handleQrUpload} className="unique-qr-upload-btn">Upload</button>
        </div>
    )}
</div>

    
      
              <div style={{
                  textAlign: "center",
                  padding: "20px"
              }} >
              <button className="admin-createEvent-btn" onClick={handleOpenForm}>Create Event</button>
                </div>
                <div style={{
                  textAlign: "center",
                  padding: "20px"
              }} >
                <button className="admin-showevent-btn" onClick={() => setShowEvents(!showEvents)}>
                    {showEvents ? "Hide Events" : "Show Events"}
                </button></div>

  {/* Button to toggle the email form */}
  <div style={{
    textAlign:"center",
    padding:"20px"
  }} >
  <button className="admin-alert-btn" onClick={toggleForm}>
                {isVisible ? "Close Alert" : "Send Alert"}
            </button>
            </div>
            {/* Conditionally render the form */}
            {isVisible && (
                <div className="glass-email-container">
                    {/* Close button */}
                    <button className="close-btn" onClick={toggleForm}>✖</button>

                    <h2 className="glass-email-title">Send Email to All</h2>
                    <input
                        type="text"
                        className="glass-email-input"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                    <textarea
                        className="glass-email-textarea"
                        placeholder="Email Body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <button className="glass-email-button" onClick={sendEmails} disabled={loading}>
                        {loading ? "Sending..." : "Send Emails"}
                    </button>
                    {message && <p className="glass-email-message">{message}</p>}
                </div>
            )}
            </div>
            <div>
          
        </div>
            {showForm && (
                        <>
                            <div className="modal-overlay" onClick={handleCloseForm}></div>

                                <div className="event-form-container">
                                            <h2 className="event-form-title">{editingEvent ? "Edit Event" : "Create Event"}</h2>
                                            <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="event-form">
                                            <input
                                                type="text"
                                                name="eventName"
                                                placeholder="Event Name"
                                                value={newEvent.eventName}
                                                onChange={handleInputChange}
                                                required
                                                className="event-input"
                                            />
                                            <textarea
                                                name="description"
                                                placeholder="Event Description"
                                                value={newEvent.description}
                                                onChange={handleInputChange}
                                                required
                                                className="event-textarea"
                                            />
                                            <label className="event-label">Upload Event Image</label>
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className={`event-file-input ${imagePreview ? "file-valid" : "file-invalid"}`}
                                            />
                                            {imagePreview ? (
                                                <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" className="preview-img" />
                                                </div>
                                            ) : (
                                                <p className="file-warning">No image uploaded</p>
                                            )}

                                            <label className="event-label">Upload Rulebook (PDF)</label>
                                            <input
                                                type="file"
                                                name="rulebook"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className={`event-file-input ${pdfFileName ? "file-valid" : "file-invalid"}`}
                                            />
                                            {pdfFileName ? (
                                                <p className="file-success">Uploaded: {pdfFileName}</p>
                                            ) : (
                                                <p className="file-warning">No PDF uploaded</p>
                                            )}

                                            <label className="checkbox-label">
                                                <input
                                                type="checkbox"
                                                name="isTeamParticipation"
                                                checked={!!newEvent.isTeamParticipation}
                                                onChange={handleInputChange}
                                                />
                                                Team Participation
                                            </label>

                                            {newEvent.isTeamParticipation && (
                                            <input
                                                type="number"
                                                name="maxTeamSize"
                                                placeholder="Enter Team Size (1 to max)"
                                                value={newEvent.maxTeamSize || ""}
                                                onChange={handleInputChange}
                                                min="1"  // Ensure minimum 1 participant (leader only)
                                                className="event-input"
                                            />
                                        )}


                                            <button onClick={() => setNewEvent({ ...newEvent, registrationOpen: !newEvent.registrationOpen })} className={`toggle-btn ${newEvent.registrationOpen ? "open" : "close"}`}>
                                                {newEvent.registrationOpen ? "Close Registration" : "Open Registration"}
                                            </button>

                                            <div className="form-actions">
                                                <button type="submit" className="submit-btn">
                                                {editingEvent ? "Update Event" : "Add Event"}
                                                </button>
                                                <button type="button" onClick={handleCloseForm} className="close-btn">
                                                ✖
                                                </button>
                                            </div>
                                        </form>
                                </div>
                            </>
                        )}
            {showEvents && (
                <div className="admin-event-table">
                    

                    <table>
                        <thead>
                            <tr>
                                <th>Event Title</th>
                                <th>Description</th>
                                <th>Registration Open</th>
                                <th>Team Participation</th>
                                <th>Max Team Size</th>
                                <th>Image</th>
                                <th>Rulebook</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event.id}>
                                    <td>
                                        <button className="event-link-btn" onClick={() => fetchStudents(event)}>
                                            {event.eventName || "No Name"}
                                        </button>
                                    </td>
                                    <td>{event.description}</td>
                                    <td>{event.registrationOpen ? "Yes" : "No"}</td>
                                    <td>{event.isTeamParticipation ? "Yes" : "No"}</td>
                                    <td>{event.maxTeamSize || "N/A"}</td>
                                    
                                    {/* Image Display */}
                                    <td>
                                        {event.image ? (
                                            <img src={typeof event.image === "string" ? event.image : URL.createObjectURL(event.image)} alt="Event" className="event-thumbnail" />
                                        ) : "Image Not Uploaded"}
                                    </td>

                                    {/* Rulebook Display */}
                                    <td>
                                        {event.rulebook ? (
                                            <button onClick={() => openRulebook(typeof event.rulebook === "string" ? event.rulebook : URL.createObjectURL(event.rulebook))} className="rulebook-btn">
                                                View Rulebook
                                            </button>
                                        ) : "Rulebook Not Uploaded"}
                                    </td>
                                    {/* Actions */}
                                    <td>
                                        <button className="admin-event-btn" onClick={() => handleEditEvent(event)}>Edit</button>
                                        <button className="admin-event-del-btn" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="admin-buttons-bar">
                <button onClick={() => setFilter("verified")} className="filter-btn verified">Verified</button>
                <button onClick={() => setFilter("notVerified")} className="filter-btn not-verified">Not Verified</button>
                <button onClick={() => setFilter("all")} className="filter-btn display-all">Display All</button>
                <div style={{
                    width:"300px"
                }} >
                    <input
                        type="text"
                        placeholder="Enter student name (SOLO)"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                    />

                    <ul>
                        {filteredSoloStudents.map(student => (
                            <li key={student.id}>{student.name} - {student.status}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Enter team name or leader name (Group)"
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                    />

                    <ul>
                        {filteredTeams.map(team => (
                            <li key={team.id}>{team.teamName} - Leader: {team.leaderName}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {(soloStudents || teams) && (
                <div className="student-section">
                    <h2 className="student-subheading">Registered Teams & Students</h2>
                    <table className="student-table">
                        <thead>
                            <tr>
                                {teams.length > 0 && <th>Team Name</th>}
                                <th>Name</th>
                                <th>College</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Payment Method</th>
                                <th>UTR Number</th>
                                <th>Receipt No</th>
                                <th>Payment Image</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Solo Students */}
                            {filteredSoloStudents.map(student => (
                                <tr key={student.id} className="solo-student">
                                    {teams.length > 0 && <td></td>} 
                                    <td>{student.name}</td>
                                    <td>{student.college}</td>
                                    <td>{student.number}</td>
                                    <td>{student.email}</td>
                                    <td>{student.paymentMethod}</td>
                                    <td>{student.utrNumber || "N/A"}</td>
                                    <td>{student.receiptNumber || "N/A"}</td>
                                    <td>
                                      {student.paymentImage ? (
                                          <button onClick={() => openImage(student.paymentImage)}>
                                              View Image
                                          </button>
                                      ) : "No Image"}
                                  </td>

                                    <td>{student.status}</td>
                                    <td>
                                        {student.status !== "verified" && (
                                            <button onClick={() => verifyStudent(student.id, student.name, selectedEvent.eventName)} className="verify-btn">Verify</button>

                                        )}
                                    </td>
                                </tr>
                            ))}
                            

                            {/* Teams */}
                            {filteredTeams.map(team => (
                                <React.Fragment key={team.id}>
                                    {/* Team Leader */}
                                    <tr className="team-leader">
                                        <td>{team.teamName}</td> 
                                        <td>{team.leaderName}</td>
                                        <td>{team.leaderCollege}</td>
                                        <td>{team.leaderNumber}</td>
                                        <td>{team.leaderEmail}</td>
                                        <td>{team.paymentMethod}</td>
                                        <td>{team.utrNumber || "N/A"}</td>
                                        <td>{team.receiptNumber || "N/A"}</td>
                                        <td>
                                            {team.paymentImage ? (
                                                <button onClick={() => openImage(team.paymentImage)}>
                                                    View Image
                                                </button>
                                            ) : "No Image"}
                                        </td>

                                        <td>{team.status}</td>
                                        <td>
                                            {team.status !== "verified" && (
                                                <button onClick={() => verifyTeam(team.id, team.leaderName, selectedEvent.eventName)} className="verify-btn">Verify</button>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Team Members */}
                                    {team.members.map(member => (
                                        <tr key={member.id} className="team-member-row">
                                            <td></td>
                                            <td>{member.name}</td>
                                            <td>{member.college}</td>
                                            <td>{member.number}</td>
                                            <td>{member.email}</td>
                                            <td colSpan="5" className="team-member-placeholder">Team Member</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <div className="download-buttons">
                        {soloStudents.length > 0 && teams.length === 0 && (
                            <>
                                <select onChange={handleDownloadFormat} value={downloadFormat}>
                                    <option value="pdf">Download as PDF</option>
                                    <option value="excel">Download as Excel</option>
                                </select>
                                <button onClick={downloadAllSolo} disabled={filter !== "all"}>Download All</button>
                                <button onClick={downloadVerifiedSolo} disabled={filter !== "verified"}>Download Verified</button>
                            </>
                        )}

                        {teams.length > 0 && soloStudents.length === 0 && (
                            <>
                                <select onChange={handleDownloadFormat} value={downloadFormat}>
                                    <option value="pdf">Download as PDF</option>
                                    <option value="excel">Download as Excel</option>
                                </select>
                                <button onClick={downloadAllTeams} disabled={filter !== "all"}>Download All</button>
                                <button onClick={downloadVerifiedTeams} disabled={filter !== "verified"}>Download Verified</button>
                            </>
                        )}
                    </div>


                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
