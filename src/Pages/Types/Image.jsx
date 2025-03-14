import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Images = () => {
  return (
    <>
      <Helmet>
        <title>Images | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of 3D Images on Shammarianas."
        />

        <meta property="og:title" content="Images | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of 3D Images on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Images | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of 3D Images on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Images" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="images" />
        </div>
      </div>
    </>
  );
};

export default Images;
