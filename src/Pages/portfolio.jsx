"use client";

import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../../firebase";
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import { Link } from "react-router-dom";
import loadBackgroudImages from "../common/loadBackgroudImages";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Marq2 from "../Components/marq2";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*"); // State to track active filter
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

    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userProfileRef = doc(db, "Profiles", currentUser.uid);
          const userDoc = await getDoc(userProfileRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchProjects();
    checkAdminStatus();
    loadBackgroudImages();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  // Filter projects based on the selected filter
  const filteredProjects = filter === "*" ? projects : projects.filter((project) => project.category === filter.slice(1));

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <header className="page-header bg-img section-padding valign" data-background="/assets/imgs/background/bg4.jpg" data-overlay-dark="8">
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Portfolio <span className="fw-200"></span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="work-grid section-padding pb-0">
        <div className="container">
          <div className="row mb-80">
            <div className="col-lg-4">
              <div className="sec-head">
                <h6 className="sub-title main-color mb-10">DISCOVER OUR CASES</h6>
                <h3>Latest Projects</h3>
              </div>
            </div>
            <div className="filtering col-lg-8 d-flex justify-content-end align-items-end">
              <div>
                <div className="filter">
                  <span data-filter="*" className={filter === "*" ? "active" : ""} data-count={projects.length} onClick={() => handleFilterChange("*")} style={{ cursor: "pointer" }}>
                    All
                  </span>
                  <span
                    data-filter=".design"
                    className={filter === ".design" ? "active" : ""}
                    data-count={projects.filter((p) => p.category === "design").length}
                    onClick={() => handleFilterChange(".design")}
                    style={{ cursor: "pointer" }}>
                    Design
                  </span>
                  <span
                    data-filter=".development"
                    className={filter === ".development" ? "active" : ""}
                    data-count={projects.filter((p) => p.category === "development").length}
                    onClick={() => handleFilterChange(".development")}
                    style={{ cursor: "pointer" }}>
                    Development
                  </span>
                  <span
                    data-filter=".marketing"
                    className={filter === ".marketing" ? "active" : ""}
                    data-count={projects.filter((p) => p.category === "marketing").length}
                    onClick={() => handleFilterChange(".marketing")}
                    style={{ cursor: "pointer" }}>
                    Marketing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="gallery row md-marg">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div key={project.id} className={`col-lg-4 col-md-6 items ${project.category}`}>
                  <div className="item mb-50">
                    <div className="img">
                      <img src={project.imageUrls?.[0] || "/assets/imgs/works/2/1.jpg"} alt={project.title} />
                    </div>
                    <div className="cont d-flex align-items-end mt-30">
                      <div>
                        <span className="p-color mb-5 sub-title">{project.category.charAt(0).toUpperCase() + project.category.slice(1)}</span>
                        <h6>{project.title}</h6>
                      </div>
                      <div className="ml-auto d-flex align-items-center">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="btn btn-sm btn-danger mr-2"
                            style={{
                              background: "#ff4d4f",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}>
                            Delete
                          </button>
                        )}
                        <Link to={`/project-details/${project.id}`}>
                          <span className="ti-arrow-top-right"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>No projects found for this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Marq2 />
    </>
  );
}

export default Header;
