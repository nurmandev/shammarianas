import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Models = () => {
  return (
    <>
      <Helmet>
        <title>Models | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of 3D models on Shammarianas."
        />

        <meta property="og:title" content="Models | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of 3D models on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Models | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of 3D models on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Models" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="models" />
        </div>
      </div>
    </>
  );
};

export default Models;
