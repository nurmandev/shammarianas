import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Scripts = () => {
  return (
    <>
      <Helmet>
        <title>Scripts | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of scripts on Shammarianas."
        />

        <meta property="og:title" content="Scripts | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of scripts on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Scripts | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of scripts on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Scripts" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="scripts" />
        </div>
      </div>
    </>
  );
};

export default Scripts;
