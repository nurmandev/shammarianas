import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useUser } from "../Context/UserProvider";
import PageTitle from "../Components/UI/PageTitle";
import plus_icon from "../assets/Icons/plus.png";
import DescriptionBox from "../Components/DescriptionBox";

const Support = () => {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    subject: "",
    file: null,
    description: "",
    issueType: "",
  });
  const [loadingState, setLoadingState] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingState("Submitting report...");

    const formDataToSend = new FormData();
    formDataToSend.append("subject", formData.subject);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("issueType", formData.issueType);
    if (formData.file) {
      formDataToSend.append("file", formData.file);
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formDataToSend,
      });
      console.log(response.url);

      const result = await response.json();
      if (response.ok) {
        alert("Thank you! Your report has been submitted.");
        setFormData({
          subject: "",
          file: null,
          description: "",
          issueType: "",
        });
      } else {
        alert("Failed to submit the report. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }

    setLoadingState("");
  };

  return (
    <>
      <Helmet>
        <title>Support | Shammarianas</title>
        <meta name="description" content="Report your Issue to Shammarianas" />
      </Helmet>

      {currentUser ? (
        <div className="page_content">
          <div className="upload_section">
            {loadingState && (
              <div className="uploading_overlay">
                <span>{loadingState}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <PageTitle title="Report an Issue" />
              <div className="content">
                <div className="left">
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                  />
                  <input type="file" name="file" onChange={handleFileChange} />
                  <label className="thumbnail_input_label">
                    {formData.file ? (
                      <div className="thumbnail_preview">
                        <img
                          className="image"
                          src={URL.createObjectURL(formData.file)}
                          alt="file preview"
                        />
                        <span className="file_name">{formData.file.name}</span>
                      </div>
                    ) : (
                      <>
                        <img className="upload_icon" src={plus_icon} alt="" />
                        <span className="placeholder">Choose Report</span>
                      </>
                    )}
                  </label>
                </div>
                <div className="right">
                  <DescriptionBox
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <select
                    name="issueType"
                    onChange={handleChange}
                    required
                    className="select_field"
                    value={formData.issueType}
                  >
                    <option value="" disabled>
                      Select Issue Type
                    </option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Issue</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>
              <button type="submit">Submit Report</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="page_content">
          <div className="not_logged_in">
            <h2>Log in to Report an Issue</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default Support;
