"use client";

import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import { Link } from "react-router-dom";
import loadBackgroudImages from "../common/loadBackgroudImages";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Marq2 from "../Components/marq2";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);

  const [projectData, setProjectData] = useState({
    title: "",
    category: "design",
    client: "",
    startDate: "",
    designer: "",
    challengeTitle: "The Challenge",
    challengeDescription: "",
    solutionTitle: "The Solution",
    solutionDescription: "",
    description: "",
    images: [],
    imageUrls: [],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData = [];
        querySnapshot.forEach((doc) => {
          projectsData.push({ id: doc.id, ...doc.data() });
        });
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
    loadBackgroudImages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProjectData((prev) => ({
        ...prev,
        images: filesArray,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrls = [];

      if (projectData.images.length > 0) {
        const uploadPromises = projectData.images.map(async (image) => {
          const storageRef = ref(
            storage,
            `projects/${image.name}-${Date.now()}`
          );
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const docRef = await addDoc(collection(db, "projects"), {
        title: projectData.title,
        category: projectData.category,
        client: projectData.client,
        startDate: projectData.startDate,
        designer: projectData.designer,
        challengeTitle: projectData.challengeTitle,
        challengeDescription: projectData.challengeDescription,
        solutionTitle: projectData.solutionTitle,
        solutionDescription: projectData.solutionDescription,
        description: projectData.description,
        imageUrls: imageUrls,
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
      setIsModalOpen(false);
      setProjectData({
        title: "",
        category: "design",
        client: "",
        startDate: "",
        designer: "",
        challengeTitle: "The Challenge",
        challengeDescription: "",
        solutionTitle: "The Solution",
        solutionDescription: "",
        description: "",
        images: [],
        imageUrls: [],
      });

      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <header
        className="page-header bg-img section-padding valign"
        data-background="/assets/imgs/background/bg4.jpg"
        data-overlay-dark="8"
      >
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Portfolio <span className="fw-200"></span>
                </h1>

                {/* Upload portfolio */}

                {/* <div className="container text-center mt-40">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-lg btn-curve btn-lit"
                  >
                    <span>Add Project</span>
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div
          className="modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "black",
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "8px",
              width: "80%",
              maxWidth: "800px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2>Add New Project</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label>Project Title:</label>
                <input
                  type="text"
                  name="title"
                  value={projectData.title}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Category:</label>
                <select
                  name="category"
                  value={projectData.category}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "0.5rem" }}
                >
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Client:</label>
                <input
                  type="text"
                  name="client"
                  value={projectData.client}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Start Date:</label>
                <input
                  type="date"
                  name="startDate"
                  value={projectData.startDate}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Designer:</label>
                <input
                  type="text"
                  name="designer"
                  value={projectData.designer}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div
                style={{
                  marginBottom: "1rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "1rem",
                }}
              >
                <h4>Challenge Section</h4>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Challenge Title:</label>
                  <input
                    type="text"
                    name="challengeTitle"
                    value={projectData.challengeTitle}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "0.5rem" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Challenge Description:</label>
                  <textarea
                    name="challengeDescription"
                    value={projectData.challengeDescription}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      minHeight: "100px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: "1rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "1rem",
                }}
              >
                <h4>Solution Section</h4>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Solution Title:</label>
                  <input
                    type="text"
                    name="solutionTitle"
                    value={projectData.solutionTitle}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%", padding: "0.5rem" }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Solution Description:</label>
                  <textarea
                    name="solutionDescription"
                    value={projectData.solutionDescription}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      minHeight: "100px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Project Description:</label>
                <textarea
                  name="description"
                  value={projectData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    minHeight: "100px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label>Project Images (Multiple):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  style={{ width: "100%", padding: "0.5rem" }}
                />
                {projectData.images.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p>Selected files: {projectData.images.length}</p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", background: "#ccc" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#4CAF50",
                    color: "white",
                  }}
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="work-grid section-padding pb-0">
        <div className="container">
          <div className="row mb-80">
            <div className="col-lg-4">
              <div className="sec-head">
                <h6 className="sub-title main-color mb-10">
                  DISCOVER OUR CASES
                </h6>
                <h3>Latest Projects</h3>
              </div>
            </div>
            <div className="filtering col-lg-8 d-flex justify-content-end align-items-end">
              <div>
                <div className="filter">
                  <span
                    data-filter="*"
                    className="active"
                    data-count={projects.length}
                  >
                    All
                  </span>
                  <span
                    data-filter=".design"
                    data-count={
                      projects.filter((p) => p.category === "design").length
                    }
                  >
                    Design
                  </span>
                  <span
                    data-filter=".development"
                    data-count={
                      projects.filter((p) => p.category === "development")
                        .length
                    }
                  >
                    Development
                  </span>
                  <span
                    data-filter=".marketing"
                    data-count={
                      projects.filter((p) => p.category === "marketing").length
                    }
                  >
                    Marketing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="gallery row md-marg">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`col-lg-4 col-md-6 items ${project.category}`}
              >
                <div className="item mb-50">
                  <div className="img">
                    <img
                      src={
                        project.imageUrls?.[0] || "/assets/imgs/works/2/1.jpg"
                      }
                      alt={project.title}
                    />
                  </div>
                  <div className="cont d-flex align-items-end mt-30">
                    <div>
                      <span className="p-color mb-5 sub-title">
                        {project.category.charAt(0).toUpperCase() +
                          project.category.slice(1)}
                      </span>
                      <h6>{project.title}</h6>
                    </div>
                    <div className="ml-auto">
                      <Link to={`/project-details/${project.id}`}>
                        <span className="ti-arrow-top-right"></span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marq2 />
    </>
  );
}

export default Header;
