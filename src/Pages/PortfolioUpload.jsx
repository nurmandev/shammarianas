import React, { useState, useRef } from "react";
import { db, storage } from "../../firebase"; // Ensure Firebase is configured
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProjectModal = ({ isOpen, onClose }) => {
  const [projectData, setProjectData] = useState({
    title: "",
    category: "design",
    client: "",
    startDate: "",
    designer: "",
    challengeTitle: "The Challenge",
    challengeDescription: "",
    description: "",
    images: [],
    image: "",
    backgroundImageUrl: "",
    imageUrls: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter((file) => {
        if (file.size > 1250000) {
          alert(`Image ${file.name} must be smaller than 1.25MB`);
          return false;
        }
        return true;
      });
      setProjectData((prev) => ({
        ...prev,
        images: filesArray,
      }));
    }
  };

  const handleSingleImgChange = (e) => {
    if (e.target.files) {
      const file = e.target.files?.[0];
      if (file.size > 1250000) {
        alert(`Image ${file.name} must be smaller than 1.25MB`);
        return;
      }

      setProjectData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls = [];

      if (projectData.images.length > 0) {
        const uploadPromises = projectData.images.map(async (image) => {
          const storageRef = ref(storage, `projects/${image.name}-${Date.now()}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      let bgImgUrl = "";

      if (projectData.image) {
        const image = projectData.image;
        const storageRef = ref(storage, `projects/${image.name}-${Date.now()}`);
        await uploadBytes(storageRef, image);
        await getDownloadURL(storageRef);

        bgImgUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, "projects"), {
        title: projectData.title,
        category: projectData.category,
        client: projectData.client,
        startDate: projectData.startDate,
        designer: projectData.designer,
        challengeTitle: projectData.challengeTitle,
        challengeDescription: projectData.challengeDescription,
        description: projectData.description,
        imageUrls: imageUrls,
        backgroundImageUrl: bgImgUrl,
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
      setProjectData({
        title: "",
        category: "design",
        client: "",
        startDate: "",
        designer: "",
        challengeTitle: "The Challenge",
        challengeDescription: "",
        solutionDescription: "",
        description: "",
        images: [],
        image: "",
        backgroundImageUrl: "",
        imageUrls: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error saving project: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="project-modal-overlay">
      <style>{`
        .project-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .project-modal-container {
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .project-modal-content {
          padding: 1.5rem;
        }
        .project-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .project-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
        }
        .project-modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        .project-modal-close:hover {
          color: #374151;
        }
        .project-form-group {
          margin-bottom: 1.5rem;
        }
        .project-form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .project-form-required {
          color: #e53e3e;
        }
        .project-form-input,
        .project-form-select,
        .project-form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .project-form-input:focus,
        .project-form-select:focus,
        .project-form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #bfdbfe;
        }
        .project-form-file {
          width: 100%;
          font-size: 0.95rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f9fafb;
        }
        .project-form-hint {
          font-size: 0.9rem;
          color: #e53e3e;
          margin-top: 0.25rem;
        }
        .project-form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }
        .project-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
        }
        .project-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .project-btn-cancel:hover {
          background: #d1d5db;
        }
        .project-btn-submit {
          background: #2563eb;
          color: #fff;
        }
        .project-btn-submit:hover {
          background: #1d4ed8;
        }
        .project-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
      <div className="project-modal-container">
        <div className="project-modal-content">
          <div className="project-modal-header">
            <h1 className="project-modal-title">Add New Project</h1>
            <button onClick={onClose} className="project-modal-close" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 24, width: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="project-form-group">
              <label className="project-form-label">
                Project Title <span className="project-form-required">*</span>
              </label>
              <input type="text" name="title" value={projectData.title} onChange={handleInputChange} required className="project-form-input" placeholder="Enter project title" />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Category <span className="project-form-required">*</span>
              </label>
              <select name="category" value={projectData.category} onChange={handleInputChange} required className="project-form-select">
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Client <span className="project-form-required">*</span>
              </label>
              <input type="text" name="client" value={projectData.client} onChange={handleInputChange} required className="project-form-input" placeholder="Enter client name" />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Start Date <span className="project-form-required">*</span>
              </label>
              <input type="date" name="startDate" value={projectData.startDate} onChange={handleInputChange} required className="project-form-input" />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Designer <span className="project-form-required">*</span>
              </label>
              <input type="text" name="designer" value={projectData.designer} onChange={handleInputChange} required className="project-form-input" placeholder="Enter designer name" />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Challenge Title <span className="project-form-required">*</span>
              </label>
              <input type="text" name="challengeTitle" value={projectData.challengeTitle} onChange={handleInputChange} required className="project-form-input" placeholder="Enter challenge title" />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Challenge Description <span className="project-form-required">*</span>
              </label>
              <textarea
                name="challengeDescription"
                value={projectData.challengeDescription}
                onChange={handleInputChange}
                required
                className="project-form-textarea"
                placeholder="Enter challenge description"
                rows="4"
              />
            </div>

            <div className="project-form-group">
              <label className="project-form-label">
                Project Image <span className="project-form-required">*</span>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleSingleImgChange} accept="image/*" required className="project-form-file" />

              <p className="project-form-hint">* Only images below 1.25MB can be uploaded.</p>

              {projectData.image && <p className="mt-2 text-sm text-gray-600">Selected file: {projectData.image.name}</p>}
            </div>
            <div className="project-form-group">
              <label className="project-form-label">
                Project Images (Multiple) <span className="project-form-required">*</span>
              </label>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple required className="project-form-file" />
              <p className="project-form-hint">* Only images below 1.25MB can be uploaded.</p>
              {projectData.images.length > 0 && <p className="mt-2 text-sm text-gray-600">Selected files: {projectData.images.length}</p>}
            </div>

            <div className="project-form-buttons">
              <button type="button" onClick={onClose} className="project-btn project-btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="project-btn project-btn-submit">
                {isSubmitting ? "Saving..." : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
