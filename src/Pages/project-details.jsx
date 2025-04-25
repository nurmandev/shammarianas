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
        <Header />
        <div className="p-4 shadow rounded bg-white">
          <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
          <div className="w-[200px]">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-auto rounded mb-4"
            />
          </div>
          <p className="text-gray-600 mb-2">
            <strong>Category:</strong> {project.category}
          </p>
          <p className="text-gray-800">{project.description}</p>
        </div>
        <Challenge />
        <Works />
        <Solution />
        <Wroks2 />
        <Next />
        <Marq2 />
      </body>
    </>
  );
}
