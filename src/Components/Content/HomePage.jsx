import React from "react";
import HeaderSection from "../ServicesDetails/HeaderSection";
import IntroSection from "../ServicesDetails/IntroSection";
import MainPage from "../ServicesDetails/MainPage";

const BrandingPage = () => {
  return (
    <>
      <HeaderSection
        title="Branding"
        highlightedText="Design"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />

      <IntroSection
        title="Building Brands"
        highlightedWords={["That", "Speak"]}
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>
            , we craft branding and designs that go beyond just visuals — we
            create identities. Your brand is your story, and we help you tell it
            with clarity, creativity, and consistency.
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
