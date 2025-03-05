import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Printables = () => {
  return (
    <>
      <Helmet>
        <title>Printables | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of printables on Shammarianas."
        />

        <meta property="og:title" content="Printables | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of printables on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Printables | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of printables on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Printables" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="printables" />
        </div>
      </div>
    </>
  );
};

export default Printables;
