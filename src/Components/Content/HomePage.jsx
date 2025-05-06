import React from "react";
import HeaderSection from "../ServicesDetails/HeaderSection";
import IntroSection from "../ServicesDetails/IntroSection";
import BrandingContentSection from "../ServicesDetails/ContentSection";

const BrandingPage = () => {
  const sectionOne = {
    title: "The Power of UI/UX Design",
    paragraphs: [
      "A user-friendly interface and intuitive design captivate users, boosting user engagement and driving higher conversion rates. A seamless UI/UX experience not only enhances user satisfaction but also builds brand trust and loyalty, ensuring repeat visits and long-term engagement with your brand.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const sectionTwo = {
    title: "Why Do You Need UI/UX Services in Today’s Digital World?",
    paragraphs: [
      <>
        To make an impact on a wider audience, it’s essential to cater to
        different user preferences. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        our tailored UI/UX solutions are designed to provide personalized
        experiences that meet diverse needs.
      </>,
      <>
        In the fast-paced digital landscape, staying up-to-date is key. What’s
        trendy today may be outdated tomorrow. Regularly updating your UI/UX
        design ensures your platform remains fresh, relevant, and engaging. . At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we ensure your brand evolves with the digital trends, keeping it fresh
        and engaging.
      </>,
      "In short, effective branding design is key to staying ahead in the competitive digital landscape, building relationships with customers, and driving success.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

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
              Sham Marianas{" "}
            </span>
            delivers smart, user-focused UI/UX design that combines beauty and
            usability. We craft intuitive digital experiences that elevate your
            brand. From startups to enterprises, we turn ideas into powerful,
            engaging interfaces.
          </>,
          "Whether you're a startup or an established business, our branding design services ensure that your logo, color scheme, typography, and messaging all align to leave a strong and lasting impression.",
        ]}
        listItems={[
          "Dynamic Design Elements",
          "Layout Design",
          "Usability Check",
          "Drafting",
          "Audience Research and Insights",
          "Mobile UI/UX Creation",
          "Designing Looks",
        ]}
        imageSrc="/assets/imgs/intro/2.jpg"
        imageAlt="Intro branding"
      />

      <BrandingContentSection sectionOne={sectionOne} sectionTwo={sectionTwo} />
    </>
  );
};

export default BrandingPage;
