import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const VideoTemplate = () => {
  return (
    <>
      <Helmet>
        <title>Video Templates | Shammarianas</title>
        <meta
          name="description"
          content="Browse professional video templates for After Effects, Premiere Pro, and other editing software on Shammarianas."
        />

        <meta property="og:title" content="Video Templates | Shammarianas" />
        <meta
          property="og:description"
          content="Download premium video templates for your projects"
        />
        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Video Templates | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse our collection of video templates for broadcast packages, openers, and more"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Video Templates" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="video-templates" />
        </div>
      </div>
    </>
  );
};

export default VideoTemplate;