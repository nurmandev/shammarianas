import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Marq2 from "../Components/marq2";
import Next from "../Components/portfolio-details/Next";
import Wroks2 from "../Components/portfolio-details/Wroks2";
import Solution from "../Components/portfolio-details/Solution";
import Works from "../Components/portfolio-details/Works";
import Challenge from "../Components/portfolio-details/Challenge";
import Header from "../Components/portfolio-details/Header";
import { db } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";
export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProjects({ id: docSnap.id, ...docSnap.data() });
          console.log({ ...docSnap.data() });
        } else {
          console.log("No such Portfolio!");
        }
      } catch (error) {
        console.error("Error fetching Portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);
  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Portfolio not found</p>;

  return (
    <>
      <body>
        <Cursor />
        <ProgressScroll />
        {/* <Header /> */}
        <header
          className=" header-project bg-img d-flex align-items-end"
          style={{ backgroundImage: `url(${project.imageUrl})` }}
          data-overlay-dark="9"
        >
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
        <div className="p-4 shadow rounded bg-white">
          <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
          {/* <div className="w-[200px]">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-auto rounded mb-4"
            />
          </div> */}
          <p className="text-gray-600 mb-2">
            <strong>Category:</strong> {project.category}
          </p>
          <p className="text-gray-800">{project.description}</p>
        </div>

        <h1>{project.description}</h1>

        <section className="section-padding">
          <div className="container">
            <div className="info mb-80 pb-20 bord-thin-bottom">
              <div className="row">
                <div className="col-md-6 col-lg-3">
                  <div className="item mb-30">
                    <span className="opacity-8 mb-5">Category :</span>
                    <h6> {project.category}</h6>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="item mb-30">
                    <span className="opacity-8 mb-5">Start Date :</span>
                    <h6>
                      {new Date(
                        project.createdAt?.toDate()
                      ).toLocaleDateString()}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="row justify-content-center">
              <div className="col-lg-11">
                <div className="row">
                  <div className="col-lg-5">
                    <h4 className="mb-50">01 . The Challenge</h4>
                  </div>
                  <div className="col-lg-7">
                    <div className="text">
                      <h5 className="mb-30 fw-400 line-height-40">
                        The goal is there are many variations of passages of
                        Lorem Ipsum available, but the majority have suffered
                        alteration in some form, by injected humour, or
                        randomised words which don&lsquo;t look even slightly
                        believable.
                      </h5>
                      <p className="fz-18">
                        There are many variations of passages of Lorem Ipsum
                        available, but the majority have suffered alteration in
                        some form, by injected humour, or randomised words which
                        don&lsquo;t look even slightly believable. If you are
                        going to use a passage of Lorem Ipsum, you need to be
                        sure there isn&lsquo;t anything embarrassing hidden in
                        the middle of text.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </section>
        {/* <Challenge /> */}
        {/* <Works /> */}
        {/* <Solution /> */}
        {/* <Wroks2 /> */}
        <Next />
        <Marq2 />
      </body>
    </>
  );
}
