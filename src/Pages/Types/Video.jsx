import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Video = () => {
  return (
    <>
      <Helmet>
        <title>Video's | Shammarianas</title>
        <meta name="description" content="Browse through a wide range of 3D Images on Shammarianas." />

        <meta property="og:title" content="Video's | Shammarianas" />
        <meta property="og:description" content="Browse through a wide range of Video's on Shammarianas." />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Video's | Shammarianas" />
        <meta name="twitter:description" content="Browse through a wide range of 3D Images on Shammarianas." />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Video" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="videos" />
        </div>
      </div>
    </>
  );
};

export default Video;