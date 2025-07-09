import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import Marq2 from "../Components/marq2";
import Next from "../Components/portfolio-details/Next";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such project!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <p className="text-lg text-white">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="error-container text-center py-20">
        <p className="text-lg text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .header-project {
          min-height: 600px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .header-project .caption {
          padding-bottom: 2rem;
        }
        .header-project h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FFFFFF;
        }
        .section-padding {
          padding: 80px 0;
        }
        .bord-thin-bottom {
          border-bottom: 1px solid #2D2D2D;
        }
        .info .item {
          margin-bottom: 1.5rem;
        }
        .info .item span.opacity-8 {
          opacity: 0.8;
          color: #D1D5DB;
          font-size: 0.9rem;
        }
        .info .item h6 {
          font-size: 1.1rem;
          margin: 0.5rem 0 0;
          color: #FFFFFF;
        }
        .project-section {
          margin-bottom: 4rem;
        }
        .project-section .content {
          display: flex;
          flex-direction: column;
          align-items: center; 
          gap: 1rem;
        }
        .project-section h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 1rem 0; 
          text-align: center; 
        }
        .project-description {
          font-size: 1rem;
          line-height: 1.6;
          color: #D1D5DB;
          max-width: 100%; 
          margin: 0 0 2rem 0; 
          text-align: left; 
        }
        .text-gray-500 {
          color: #6B7280; 
          font-style: italic;
          text-align: left; 
        }
        .image-gallery {
          display: flex;
          flex-direction: column; 
          gap: 0; 
          margin-top: 2rem;
          justify-content: center; 
          align-items: center; 
        }
        .image-gallery img {
          width: 80rem;
          object-fit: cover;
          max-width: 100%; 
          margin: 0; 
        }
        .image-gallery img.fallback {
          background: #2D2D2D;
        }
        body {
          background: #000000;
          color: #FFFFFF;
        }
        @media (max-width: 768px) {
          .header-project {
            min-height: 200px;
          }
          .header-project h1 {
            font-size: 1.5rem;
          }
          .section-padding {
            padding: 40px 0;
          }
          .project-section .content {
            flex-direction: column; 
            gap: 1rem;
            align-items: center;
          }
          .project-section h2 {
            margin: 0 0 1rem 0;
            text-align: center; 
          }
          .project-description {
            max-width: 100%;
            margin: 0 0 1rem 0;
            text-align: left; 
          }
          .text-gray-500 {
            text-align: left; 
          }
          .image-gallery {
            flex-direction: column; 
            gap: 0; 
            justify-content: center;
            align-items: center;
          }
          .image-gallery img {
            width: 20rem; 
            height: 20rem;
            max-width: 100%;
            margin: 0; 
          }
        }
      `}</style>
      <Cursor />
      <ProgressScroll />
      <header className="header-project bg-img d-flex align-items-end" data-background="/assets/imgs/background/bg4.jpg" data-overlay-dark="9">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="caption">
                <h1>{project.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="section-padding">
        <div className="container">
          <div className="info mb-80 pb-20 bord-thin-bottom">
            <div className="row">
              <div className="col-md-6 col-lg-3">
                <div className="item">
                  <span className="opacity-8 mb-5">Category:</span>
                  <h6>{project.category.charAt(0).toUpperCase() + project.category.slice(1)}</h6>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="item">
                  <span className="opacity-8 mb-5">Client:</span>
                  <h6>{project.client}</h6>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="item">
                  <span className="opacity-8 mb-5">Start Date:</span>
                  <h6>{project.createdAt && typeof project.createdAt.toDate === "function" ? new Date(project.createdAt.toDate()).toLocaleDateString() : project.createdAt || "N/A"}</h6>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="item">
                  <span className="opacity-8 mb-5">Designer:</span>
                  <h6>{project.designer || "N/A"}</h6>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Section */}
          <div className="project-section">
            <div className="content">
              <h2>{project.challengeTitle || "The Challenge"}</h2>
              {project.challengeDescription ? <div className="project-description">{project.challengeDescription}</div> : <p className="text-gray-500 italic">No challenge description provided.</p>}
            </div>
            <div className="image-gallery challenge">
              {project.descriptionImgUrls && project.descriptionImgUrls.length > 0 ? (
                project.descriptionImgUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${project.title} image ${index + 1}`}
                    className="gallery-image"
                    onError={(e) => {
                      e.target.src = "/assets/imgs/works/2/1.jpg";
                      e.target.className = "gallery-image fallback";
                    }}
                  />
                ))
              ) : (
                <img src="/assets/imgs/works/2/1.jpg" alt={`${project.title} fallback`} className="gallery-image fallback" />
              )}
            </div>
          </div>
        </div>
      </section>

      <Next />
      <Marq2 />
    </>
  );
}
