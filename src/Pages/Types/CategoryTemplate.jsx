import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

// Map URL parameters to proper asset type names
const categoryMap = {
  videos: "Videos",
  "video-templates": "Video Templates",
  images: "Images",
  graphics: "Graphic Templates",
  mockups: "Mockups",
  fonts: "Fonts",
  models: "3D Models",
  icons: "Icons",
  textures: "Textures",
  hdris: "HDRIs",
  scripts: "Scripts",
  sounds: "Sounds",
  other: "Other Assets",
  hot: "Trending Assets"
};

const getCategoryDisplayName = (category) => {
  if (!category) return "Assets";
  
  const normalized = category.toLowerCase();
  return categoryMap[normalized] || 
    normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getCategoryDescription = (category) => {
  const normalized = category ? category.toLowerCase() : "";
  
  const descriptions = {
    videos: "Browse premium stock footage in HD and 4K resolution",
    "video-templates": "Professional templates for After Effects, Premiere Pro, and other video editors",
    images: "High-quality stock photos for all your creative projects",
    graphics: "Ready-to-use graphic templates for print and digital media",
    mockups: "Product mockups for branding and presentation",
    fonts: "Unique fonts for designers and developers",
    models: "3D models for games, VR, and architectural visualization",
    icons: "Icon sets for apps, websites, and interfaces",
    textures: "Seamless textures for 3D rendering and game development",
    hdris: "High dynamic range images for realistic lighting",
    scripts: "Code scripts for automation and web development",
    sounds: "Sound effects and background music",
    other: "Miscellaneous digital assets",
    hot: "Most popular and trending assets"
  };
  
  return descriptions[normalized] || 
    `Browse through a wide range of ${getCategoryDisplayName(category)} on Shammarianas`;
};

const CategoryTemplate = () => {
  const { Category } = useParams();
  const normalizedCategory = Category ? Category.toLowerCase() : "";
  const displayName = getCategoryDisplayName(Category);
  const description = getCategoryDescription(Category);

  return (
    <>
      <Helmet>
        <title>{displayName} | Shammarianas</title>
        <meta name="description" content={description} />

        <meta property="og:title" content={`${displayName} | Shammarianas`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />

        <meta name="twitter:title" content={`${displayName} | Shammarianas`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="page_content">
        <PageTitle title={displayName} />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category={normalizedCategory === "hot" ? null : normalizedCategory} />
        </div>
      </div>
    </>
  );
};

export default CategoryTemplate;