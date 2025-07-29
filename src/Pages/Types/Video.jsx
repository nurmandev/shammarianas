import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Video = () => {
  return (
    <>
      <Helmet>
        <title>Stock Videos | Shammarianas</title>
        <meta 
          name="description" 
          content="Download premium stock footage in HD, 4K, and slow motion. Find videos for business, nature, technology, and more." 
        />

        <meta property="og:title" content="Stock Video Library | Shammarianas" />
        <meta 
          property="og:description" 
          content="Browse our collection of royalty-free stock videos for your creative projects" 
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Stock Videos | Shammarianas" />
        <meta 
          name="twitter:description" 
          content="Find HD and 4K stock footage for commercials, presentations, and social media" 
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Stock Videos" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="videos" />
        </div>
      </div>
    </>
  );
};

export default Video;