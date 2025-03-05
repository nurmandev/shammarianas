import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Shaders = () => {
  return (
    <>
      <Helmet>
        <title>Shaders | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of shaders on Shammarianas."
        />

        <meta property="og:title" content="Shaders | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of shaders on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Shaders | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of shaders on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Shaders" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="shaders" />
        </div>
      </div>
    </>
  );
};

export default Shaders;
