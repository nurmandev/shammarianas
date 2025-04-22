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
  const [projects, setProjects] = useState([]);
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

  return (
    <>
      <body>
        <Cursor />
        <ProgressScroll />

        <Header />
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
