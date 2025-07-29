import React from "react";
import PageTitle from "../../Components/UI/PageTitle";
import ItemsListing from "../../Components/ItemsListing";
import ListingSidebar from "../../Components/ListingSidebar";
import { Helmet } from "react-helmet";

const Hot = () => {
  const pageTitle = "Trending Assets";
  const pageDescription = "Discover the most popular and trending digital assets on Shammarianas. Find what other creators are downloading right now!";

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Shammarianas</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:title" content={`${pageTitle} | Shammarianas`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />

        <meta name="twitter:title" content={`${pageTitle} | Shammarianas`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="page_content">
        <PageTitle title={pageTitle} />
        <div className="listing_section">
          <ListingSidebar />
          <ItemsListing 
            sort="trending" 
            showCategoryFilter={true}
          />
        </div>
      </div>
    </>
  );
};

export default Hot;