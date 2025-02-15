import Footer from "../components/Footer";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTranslation } from "react-i18next";
import Intro from "./landing-page/about-us/Introl";
import Header from "./landing-page/about-us/firstPage";
import Numbers from "./landing-page/about-us/Numbers";
import Services from "./landing-page/about-us/Services";
import Team from "./landing-page/about-us/Team";
import Clients from "./landing-page/about-us/Clients";
import Blog from "./landing-page/about-us/Blog";
import Marq2 from "./landing-page/marq/marq2";
// import Testimonials from "./landing-page/about-us/Testimonials";

// Functional component for the About Us page
function AboutUs() {
  // Destructuring the translation function from react-i18next
  const { t } = useTranslation();

  // URLs for cover and team images
  const coverImage =
    "https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
  const teamImage =
    "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

  return (
    <>
      <Header />
      <Intro />
      <Numbers />
      <Services />
      <Team />

      {/* <Testimonials/> */}

      <Clients />

      <Blog />

      <Marq2 />
      {/* Footer component */}
      <Footer />
    </>
  );
}

export default AboutUs;
