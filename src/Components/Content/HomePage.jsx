import Intro from "./Intro";

const HomePage = () => {
  return (
    <Intro
      title="Building Brands"
      highlightedWords={["That", "Speak."]}
      paragraphs={[
        <>
          At{" "}
          <span className="text-bold underline main-color">Sham Marianas</span>,
          we craft branding designs that go beyond just visuals – we create
          identities. Your brand is your story, and we help you tell it with
          clarity, creativity, and consistency.
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
      imageAlt="Branding Image"
    />
  );
};

export default HomePage;
