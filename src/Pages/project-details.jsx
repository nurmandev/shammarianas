import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";

import Marq2 from "../Components/marq2";
import Next from "../Components/portfolio-details/Next";
import Wroks2 from "../Components/portfolio-details/Wroks2";
import Solution from "../Components/portfolio-details/Solution";
import Works from "../Components/portfolio-details/Works";
import Challenge from "../Components/portfolio-details/Challenge";
import Header from "../Components/portfolio-details/Header";

export default function ProjectDetails() {
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
