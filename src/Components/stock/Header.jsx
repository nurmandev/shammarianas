import Search from '../Search';

const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Background image with overlay */}
      <div className="hero-background"></div>
      
      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Smarter creativity, faster designs
        </h1>
        <p className="hero-subtitle">
          Everything you need, from stock images and videos to AI-powered design tools.
        </p>
        
        {/* Search component */}
        <div className="search-container">
          <Search />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;