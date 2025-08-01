import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const VideoTemplate = () => {
  return (
    <>
      <Helmet>
        <title>Video Template | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of Video Template on Shammarianas."
        />

        <meta property="og:title" content="Video's | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of Video Template on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Video Template | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of Video Template on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Video Templates" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="templates" />
        </div>
      </div>
    </>
  );
};

export default VideoTemplate;
