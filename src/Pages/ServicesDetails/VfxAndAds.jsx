"use client";
import React from "react";
import HeaderSection from "../../Components/ServicesDetails/HeaderSection";
import IntroSection from "../../Components/ServicesDetails/IntroSection";
import BrandingContentSection from "../../Components/ServicesDetails/ContentSection";
import FAQAccordion from "../../Components/ServicesDetails/FAQAccordion";

const VfxAndAdsPage = () => {
  const sectionOne = {
    title: "From Lens to Legacy Visuals That Resonate",
    paragraphs: [
      "Our photography & video production services go far beyond the lens. We don’t just point and shoot — we tell your brand’s story frame by frame. Whether it’s bold product photography, cinematic brand videos, or crisp lifestyle visuals, we create content that stops the scroll, sparks curiosity, and drives action. Every image we capture is built to speak your message — loud, clear, and beautifully.",

      "From creative planning to final edit, we deliver full-scale visual production tailored for digital impact. Think scroll-stopping social media clips, polished promo videos, striking product shots, and branded storytelling — all crafted with pro-level lighting, styling, direction, and editing. If your brand needs to be seen and felt, we’re here to bring that vision to life — one unforgettable visual at a time.",
    ],
    image: "/assets/imgs/Asset_img.png",
  };

  const sectionTwo = {
    title:
      "Framing Brands with Purpose — Photography & Video Production That Converts",
    paragraphs: [
      <>
        At <span className="text-bold underline main-color">Sham Marianas</span>
        , it’s more than just visuals — it’s about crafting high-impact photo
        and video content that tells your story, connects with your audience,
        and fuels business growth. Our photography & video production services
        are built to elevate your brand through clear, compelling, and
        conversion-driven visuals.
      </>,
      "Whether it’s fashion campaigns, product photography, behind-the-scenes content, or cinematic brand videos, we align each frame with your vision and marketing goals. From creative direction to post-production, we deliver polished, platform-ready content that not only looks stunning but also drives real engagement and results.",
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
