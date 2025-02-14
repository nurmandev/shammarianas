// Import necessary dependencies and components
import { useEffect } from "react";
import Footer from "../../components/Footer";
import Features from "./features/Features";
import Header from "./header/Header";
import Reviews from "./reviews/Reviews";
import Overview from "./Overview";
import QuickLinks from "../../components/quick-links/QuickLinks";
import AOS from "aos"; // Import AOS (Animate On Scroll) library
import "aos/dist/aos.css"; // Import AOS styles
import Intro from "./intro/Intro";
import FirstPage from "./firstPage/firstPage";
import Marq from "./marq/marq";
import Portfolio from "./portfolio/portfolio";
import Feat from "./Feat";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Clients from "./Clients";
import Marq2 from "./marq/marq2";
// import SearchPage from "./header/SearchPage";
// import Services from "./services/Services";

// Define the LandingPage component
function LandingPage() {
  // useEffect hook to initialize AOS and refresh it
  useEffect(() => {
    AOS.init({
      once: true, // Set animation to occur only once
      duration: 300, // Set animation duration to 300 milliseconds
    });
    AOS.refresh(); // Refresh AOS
  }, []);

  // Render the LandingPage component
  return (
    <>
      {/* Container for the entire landing page */}
      <div className="flex">
        {/* QuickLinks component for navigation */}
        <QuickLinks />
        {/* Main content area with a gradient background */}
        <div className="bg-gradient from-white dark:from-black to-light dark:tog-dark w-full flex flex-col">
          {/* Header component */}

          {/* <Header /> */}

          <FirstPage />

          {/* <SearchPage /> */}
          <Intro />
          <Marq />

          <Portfolio />

          <Feat />

          <Team />

          <Testimonials />

          <Clients />

          <Marq2 />
          {/* <Services /> */}
          {/* Reviews component */}
          {/* <Reviews /> */}
          {/* Features component */}
          {/* <Features /> */}
          {/* Overview component */}
          {/* <Overview /> */}
        </div>
      </div>
      {/* Footer component */}
      <Footer />
    </>
  );
}

// Export the LandingPage component as the default export
export default LandingPage;
