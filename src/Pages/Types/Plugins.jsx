import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ListingSidebar from "../../Components/ListingSidebar";
import ItemsListing from "../../Components/ItemsListing";
import { Helmet } from "react-helmet";

const Plugins = () => {
  return (
    <>
      <Helmet>
        <title>Plugins | Shammarianas</title>
        <meta
          name="description"
          content="Browse through a wide range of plugins on Shammarianas."
        />

        <meta property="og:title" content="Plugins | Shammarianas" />
        <meta
          property="og:description"
          content="Browse through a wide range of plugins on Shammarianas."
        />

        <meta property="og:type" content="website" />

        <meta name="twitter:title" content="Plugins | Shammarianas" />
        <meta
          name="twitter:description"
          content="Browse through a wide range of plugins on Shammarianas."
        />

        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="page_content">
        <PageTitle title="Plugins" />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing category="plugins" />
        </div>
      </div>
    </>
  );
};

export default Plugins;
