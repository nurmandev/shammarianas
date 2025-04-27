"use client";
import loadBackgroudImages from "../../common/loadBackgroudImages";
import React, { useEffect } from "react";

function Next() {
  useEffect(() => {
    loadBackgroudImages();
  }, []);
  return (
    <section className="next-project sub-bg">
      <div className="container-fluid rest">
        <div className="row">
          <div className="col-md-6 rest">
            <div
              className="text-left box bg-img"
              style={{ backgroundImage: `url(${project.prevImageUrl})` }}
            >
              <div className="cont d-flex align-items-center">
                <div>
                  <span className="mr-30 fz-30 ti-arrow-left"></span>
                </div>
                <div>
                  <h6 className="sub-title fz-16 mb-5">Prev Project</h6>
                  <a
                    href={`/project-details/${project.prevId}`}
                    className="fz-40 fw-600 stroke"
                  >
                    {project.prevTitle}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 rest">
            <div
              className="text-right d-flex box bg-img"
              style={{ backgroundImage: `url(${project.nextImageUrl})` }}
            >
              <div className="ml-auto">
                <div className="cont d-flex align-items-center">
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Next Project</h6>
                    <a
                      href={`/project-details/${project.nextId}`}
                      className="fz-40 fw-600 stroke"
                    >
                      {project.nextTitle}
                    </a>
                  </div>
                  <div>
                    <span className="ml-30 fz-30 ti-arrow-right"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <a href="/projects" className="all-works-butn text-center">
          <span className="ti-view-grid fz-24 mb-10"></span>
          <span className="d-block fz-12 text-u ls1">All Projects</span>
        </a>
      </div>
    </section>
  );
}

export default Next;
