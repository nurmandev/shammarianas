import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
import Error from "../../components/Error";
import PaymentSuccess from "../../customer/pages/payment/PaymentSuccess";
import PaymentFailed from "../../customer/pages/payment/PaymentFailed";
import Blogs from "../../customer/pages/Blogs";
import Details from "../../customer/pages/Blogs/Detail";

// Lazy-loaded components
const ClientNavbar = lazy(() =>
  import("../../customer/components/navbar/Navbar")
);
const LandingPage = lazy(() =>
  import("../../customer/pages/landing-page/LandingPage")
);
const HowItWorks = lazy(() =>
  import("../../customer/pages/how-it-works/HowItWorks")
);
const AboutUs = lazy(() => import("../../customer/pages/AboutUs"));
const ContactUs = lazy(() => import("../../customer/pages/ContactUs"));
const SignUp = lazy(() => import("../../customer/pages/authentication/SignUp"));
const AccountVerification = lazy(() =>
  import("../../customer/pages/authentication/AccountVerification")
);
const Login = lazy(() => import("../../customer/pages/authentication/Login"));
const ResetPassword = lazy(() =>
  import("../../customer/pages/authentication/ResetPassword")
);
const ResetPasswordVerification = lazy(() =>
  import("../../customer/pages/authentication/ResetPasswordVerification")
);

// Component for handling routes for the customer side
function ClientRoutes() {
  return (
    <>
      {/* Navbar for the customer side */}
      <ClientNavbar />

      {/* Routes for the customer side */}
      <Routes>
        {/* Generic error route */}
        <Route path="*" element={<Error />} />

        {/* Landing page route */}
        <Route path="/" element={<LandingPage />} />

        {/* How It Works page route */}
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* About Us page route */}
        <Route path="/about-us" element={<AboutUs />} />

        {/* Blogs route */}
        <Route path="/blog" element={<Blogs />} />
        <Route path="/blog/:id" element={<Details />} />

        {/* Contact Us page route */}
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Sign-up page route */}
        <Route path="/sign-up" element={<SignUp />} />

        {/* Email verification page route */}
        <Route path="/email-verification" element={<AccountVerification />} />

        {/* Login page route */}
        <Route path="/login" element={<Login />} />

        {/* Reset Password Verification page route */}
        <Route
          path="/reset-password-verify"
          element={<ResetPasswordVerification />}
        />

        {/* Reset Password page route */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Checkout Success page route */}
        <Route path="/checkout-success" element={<PaymentSuccess />} />

        {/* Checkout Failed page route */}
        <Route path="/checkout-failed" element={<PaymentFailed />} />
      </Routes>
    </>
  );
}

export default ClientRoutes;
