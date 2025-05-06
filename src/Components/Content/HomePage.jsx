import React from "react";
import HeaderSection from "../ServicesDetails/HeaderSection";
import IntroSection from "../ServicesDetails/IntroSection";
import MainPage from "../ServicesDetails/MainPage";

const BrandingPage = () => {
  return (
    <>
      <HeaderSection
        title="UI/UX"
        highlightedText="Design"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />

      <IntroSection
        title="Empowering Experiences Through"
        highlightedWords={["Smart", "Design"]}
        paragraphs={[
          <>
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>
            delivers smart, user-focused UI/UX design that combines beauty and
            usability. We craft intuitive digital experiences that elevate your
            brand. From startups to enterprises, we turn ideas into powerful,
            engaging interfaces.
          </>,
          "Whether you're a startup or an established business, our branding design services ensure that your logo, color scheme, typography, and messaging all align to leave a strong and lasting impression.",
        ]}
        listItems={[
          "Logo Creation",
          "Brand Identity Design",
          "Visual Style Guides",
          "Typography and Color Palette",
          "Social Media Branding",
          "Brand Strategy & Messaging",
        ]}
        imageSrc="/assets/imgs/intro/2.jpg"
        imageAlt="Intro branding"
      />

      <MainPage />
    </>
  );
};

export default BrandingPage;
