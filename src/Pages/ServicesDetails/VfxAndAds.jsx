"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";

const VfxAndAdsPage = () => {
  const sectionOne = {
    title: "From Concept to Impact — Ads That Hit Different",
    paragraphs: [
      <>
        Every VFX and CGI project we create starts with purpose and ends with
        performance. At{" "}
        <span className="text-bold underline main-color">Sham Marianas</span>,
        we don’t just make things look amazing — we make them work. Each frame
        is part of a bigger plan to grab attention, spark engagement, and drive
        results.
      </>,
      "From the very first idea to the final pixel, we handle everything — concept creation, scriptwriting, storyboarding, animation, editing, and platform-specific optimization. It’s a full-circle creative process designed to deliver both visual impact and marketing value.",
      "Launching a new product? Running a bold campaign? Want your brand to shine in a sea of sameness? Our VFX and CGI-powered ads give you an undeniable edge — blending future-forward visuals with storytelling that stops the scroll and moves your audience to act.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const sectionTwo = {
    title: "From Bold Ideas to Breathtaking Visuals",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , we bring ambitious ideas to life through cinematic visuals that
        captivate, connect, and convert. Whether it's a surreal animation, a
        stylized brand story, or a hyper-real visual experience, every project
        is crafted with sharp strategy, artistic finesse, and storytelling that
        resonates.
      </>,
      "We transform animation into art — immersive visual journeys that make people stop, feel, and act. Every frame is designed to speak louder than words and leave a lasting mark.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };
  const faqs = [
    {
      question:
        "What types of photography and video production services do you offer?",
      answer:
        "We offer a wide range of visual content services, including product photography, fashion shoots, lifestyle photography, corporate headshots, behind-the-scenes content, promotional videos, brand films, and more — all tailored to your brand’s needs.",
    },
    {
      question: "Do you help with concept and creative direction?",
      answer:
        "Absolutely! From brainstorming visual ideas to storyboarding and art direction, we guide you through the entire creative process to ensure your content aligns with your brand identity and goals.",
    },
    {
      question: "Will the content be optimized for social media and websites?",
      answer:
        "Yes. All our photo and video content is formatted and optimized for platforms like Instagram, Facebook, TikTok, YouTube, and your website — ensuring high-quality visuals across every channel.",
    },
    {
      question: "How long does it take to complete a project?",
      answer:
        "Timelines depend on the scope of your project. We’ll give you a clear timeline during the planning stage and always aim for fast, high-quality delivery.",
    },
    {
      question: "Do you provide editing and post-production as well?",
      answer:
        "Yes, we handle the full production cycle — from shooting to editing, color grading, sound design, and final delivery.",
    },

    {
      question: "How do I get started?",
      answer:
        "Just reach out through our website or contact form! We’ll schedule a discovery call to understand your vision and start planning your custom visual content journey.",
    },
  ];

  return (
    <>
      <HeaderSection
        title="VFX & CGI"
        highlightedText="Ads"
        backgroundImage="/assets/imgs/background/bg4.jpg"
        overlayDark="8"
      />
      <IntroSection
        title="Creating the Unreal — "
        highlightedWords={["VFX & CGI Ads That Captivate and Convert"]}
        paragraphs={[
          <>
            At{" "}
            <span className="text-bold text-left underline main-color">
              Sham Marianas
            </span>{" "}
            we turn imagination into impact — crafting cinematic visuals that
            not only dazzle the eye but also drive real results. Our VFX (visual
            effects) and CGI (computer-generated imagery) services merge
            storytelling with next-level design to create ads that demand
            attention and inspire action.
          </>,
          "From surreal animations to lifelike 3D worlds, we breathe digital life into your ideas — building visual experiences that break boundaries, stir emotions, and amplify your brand message. Whether it’s a high-energy product ad or a futuristic brand film, we bring creativity and precision to every frame.",
        ]}
        listItems={[
          "3D Product Animations & Commercials",
          "CGI Brand Videos",
          "Motion Graphics & Visual Effects",
          "Virtual Environments & Set Extensions",
          "Animated Explainer Ads",
          "Logo Animations & Visual Intros",
          "Cinematic CGI for TVCs & Digital Ads",
          "Post-Production FX & Compositing",
          "Custom CGI for Social Media Campaigns",
        ]}
        imageSrc="/assets/imgs/intro/2.jpg"
        imageAlt="Intro branding"
      />
      <BrandingContentSection sectionOne={sectionOne} sectionTwo={sectionTwo} />
      <div className="bord-bottom-grd pb-40 pt-40 ontop"></div>
      <FAQAccordion
        title="Frequently Asked Questions"
        faqs={faqs}
        imageSrc="/assets/imgs/FAQ.png"
      />
      ;
    </>
  );
};

export default VfxAndAdsPage;
