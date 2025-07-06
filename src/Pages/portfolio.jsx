"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import { Link } from "react-router-dom";
import loadBackgroudImages from "../common/loadBackgroudImages";
import Marq2 from "../Components/marq2";

const Slideshow = ({ imageUrls, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (!imageUrls || imageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [imageUrls]);

  return (
    <div className="img-gallery relative">
      {imageUrls && imageUrls.length > 0 ? (
        <img
          src={imageUrls[currentImageIndex] || "/assets/imgs/works/2/1.jpg"}
          alt={`${title} ${currentImageIndex + 1}`}
          className="gallery-image w-full h-[200px] object-cover rounded-lg transition-opacity duration-500"
        />
      ) : (
        <img src="/assets/imgs/works/2/1.jpg" alt={title} className="gallery-image w-full h-[200px] object-cover rounded-lg" />
      )}
    </div>
  );
};

function Header() {
  const [projects, setProjects] = useState([]);
  const [_, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState("*");

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

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

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
                    <Slideshow imageUrls={project.imageUrls} title={project.title} />
                    <div className="cont d-flex align-items-end mt-30">
                      <div>
                        <span className="p-color mb-5 sub-title">{project.category.charAt(0).toUpperCase() + project.category.slice(1)}</span>
                        <h6>{project.title}</h6>
                      </div>
                      <div className="ml-auto d-flex align-items-center">
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
