import React, { useEffect, useRef } from "react";
import AOS from "aos"; // Import AOS (Animate On Scroll) library
import "aos/dist/aos.css"; // Import AOS styles

import Cursor from "../../common/cusor";
import ProgressScroll from "../../common/ProgressScroll";
import Lines from "../../Components/Lines";
import Marq2 from "../../Components/marq2";
import Intro from "../../Components/services-details/Intro";
import Header from "../../Components/services-details/Header";
import UiUx from "../../Components/services/UiUx";

export default function PageServicesDetails() {
  const main = useRef();

  return (
    <>
      <body>
        <Cursor />
        <ProgressScroll />
        <Lines />
        <Header />
        <Intro />
        <UiUx/>
        {/* <Feat /> */}
        <Marq2 />
      </body>
    </>
  );
}
