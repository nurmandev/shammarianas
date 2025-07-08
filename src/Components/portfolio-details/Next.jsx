"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

function Next() {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsData);
        const index = projectsData.findIndex((project) => project.id === id);
        setCurrentIndex(index);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [id]);

  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <section className="next-project sub-bg">
      <div className="container-fluid rest">
        <div className="row">
          <div className="col-md-6 rest">
            <div
              className="text-left box bg-img"
              style={
                prevProject && prevProject.coverImgUrl
                  ? {
                      backgroundImage: `url(${prevProject.coverImgUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }>
              <div className="cont d-flex align-items-center">
                <div>
                  {prevProject ? (
                    <Link to={`/project-details/${prevProject.id}`}>
                      <span className="mr-30 fz-30 ti-arrow-left"></span>
                    </Link>
                  ) : (
                    <span className="mr-30 fz-30 ti-arrow-left"></span>
                  )}
                </div>
                <div>
                  <h6 className="sub-title fz-16 mb-5">Prev Project</h6>
                  {prevProject ? (
                    <Link to={`/project-details/${prevProject.id}`} className="fz-40 fw-600 stroke">
                      {prevProject.title}
                    </Link>
                  ) : (
                    <span className="fz-40 fw-600 stroke">No Previous Project</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 rest">
            <div
              className="text-right d-flex box bg-img"
              style={
                nextProject && nextProject.coverImgUrl
                  ? {
                      backgroundImage: `url(${nextProject.coverImgUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }>
              <div className="ml-auto">
                <div className="cont d-flex align-items-center">
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Next Project</h6>
                    {nextProject ? (
                      <Link to={`/project-details/${nextProject.id}`} className="fz-40 fw-600 stroke">
                        {nextProject.title}
                      </Link>
                    ) : (
                      <span className="fz-40 fw-600 stroke">No Next Project</span>
                    )}
                  </div>
                  <div>
                    {nextProject ? (
                      <Link to={`/project-details/${nextProject.id}`}>
                        <span className="ml-30 fz-30 ti-arrow-right"></span>
                      </Link>
                    ) : (
                      <span className="ml-30 fz-30 ti-arrow-right"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link to="/portfolio" className="all-works-butn text-center">
          <span className="ti-view-grid fz-24 mb-10"></span>
          <span className="d-block fz-12 text-u ls1">all Projects</span>
        </Link>
      </div>
    </section>
  );
}

export default Next;
