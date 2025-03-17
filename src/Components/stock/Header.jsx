import { useState, useEffect, useCallback } from "react";
import { getDocs, collection, query } from "firebase/firestore";
import { db } from "../../../firebase";
import { Link } from "react-router-dom";
// import ListedItemCard from "./UI/ListedItemCard";
import ListedItemCard from "../UI/ListedItemCard";
import PageTitle from "../UI/PageTitle";

const HeroSection = () => {
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [displayResults, setDisplayResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);

  // Assets State
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [error, setError] = useState(null);

  // Debounce Function
  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fetch Search Results
  const fetchSearchResults = useCallback(async () => {
    if (searchTerm.trim() === "") return;
    setLoading(true);
    const q = query(collection(db, "Assets"));
    const querySnapshot = await getDocs(q);
    const allResults = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const newResults = allResults
      .filter((result) => result.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 7);
    setSearchResults(newResults);
    setLoading(false);
    setDisplayResults(searchTerm !== "");
  }, [searchTerm]);

  // Fetch All Assets
  const fetchAssets = useCallback(async () => {
    try {
      const q = query(collection(db, "Assets"));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
      setFilteredAssets(assetsData); // Initialize filtered assets
    } catch (error) {
      setError(error.message);
    }
  }, []);

  // Handle Search Input Change
  const handleSearchChange = debounce((e) => {
    setSearchTerm(e.target.value);
  }, 1000);

  // Handle Search Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSearchResults();
  };

  // Filter Assets by Category
  const filterAssetsByCategory = (category) => {
    return assets.filter((asset) => asset.type === category);
  };

  // Effects
  useEffect(() => {
    if (searchTerm !== "") {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setDisplayResults(false);
    }
  }, [searchTerm, fetchSearchResults]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <>
      {/* Overlay */}
      {overlay && (
        <div
          className="search_overlay"
          onClick={() => {
            const overlay = document.querySelector(".search_overlay");
            overlay.classList.add("fade");
            setTimeout(() => setOverlay(false), 190);
          }}
        ></div>
      )}

      {/* Hero Section */}
      <div className="hero-container">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Smarter creativity, faster designs</h1>
          <p className="hero-subtitle">
            Everything you need, from stock images and videos to AI-powered design tools.
          </p>

          {/* Search Component */}
          <div className="search-container">
            <div className="search-wrapper">
              <form onSubmit={handleSubmit} className="search-form">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search all assets"
                    className="search-input search-hero-input"
                    onChange={handleSearchChange}
                    onClick={() => {
                      setDisplayResults(false);
                      overlay ? "" : setOverlay(true);
                    }}
                  />
                  {/* {searchTerm && (
                    <i
                      className="icon fa-solid fa-times"
                      onClick={() => {
                        document.querySelector(".search-input").value = "";
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    ></i>
                  )} */}
                </div>
                <button type="submit" className="search-button">
                  Search
                </button>
              </form>

              {/* Search Results */}
              {displayResults && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <Link
                      to={`/View/${result.id}`}
                      key={result.id}
                      onClick={() => {
                        setDisplayResults(false);
                        setSearchTerm("");
                        setOverlay(false);
                      }}
                    >
                      <div className="result">
                        <div className="image">
                          <img src={result.thumbnail} alt={result.title} />
                        </div>
                        <div className="details">
                          <h3 className="title">{result.title}</h3>
                          <p className="type">{result.type}</p>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {loading && (
                    <div className="loading">
                      <span>Loading...</span>
                    </div>
                  )}

                  {searchResults.length === 0 && !loading && (
                    <div className="no-results">
                      <span>No results found</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product List Section */}
      {
      !displayResults && (
      <section className="services-inline2 section-padding sub-bg bord-bottom-grd bord-top-grd">
        <div className="container ontop">
          <div className="sec-head mb-80">
            <div className="d-flex align-items-center">
              <div>
                <span className="sub-title main-color mb-5">Our Stocks</span>
                <h3 className="fw-600 fz-50 text-u d-rotate wow">
                  <span className="rotate-text">
                    Trending <span className="fw-200">Stock.</span>
                  </span>
                </h3>
              </div>
              <div className="ml-auto vi-more">
                <a href="#Hot" className="butn butn-sm butn-bord radius-30">
                  <span>View All</span>
                </a>
                <span className="icon ti-arrow-top-right"></span>
              </div>
            </div>
          </div>

          {/* Hot Assets */}
          <div className="page_content">
            <PageTitle title="Hot" />
            <div className="listing_section">
              <div className="item_listing">
              {filterAssetsByCategory("Hot").length === 0 ? <div className="loading">Loading...</div> : null}
              {/* {filterAssetsByCategory("Hot").length === "no_item" && (
                <div className="no_items">
                  <span>{`It's so empty here. How about you fill it up💦`}</span>
                  <Link to="/upload">
                    <button>Upload</button>
                  </Link>
                </div>
              )} */}
                {filterAssetsByCategory("hot").map((item) => (
                  <ListedItemCard key={item.id} id={item.id} data={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="page_content">
            <PageTitle title="Models" />
            <div className="listing_section">
              <div className="item_listing">
                  {filterAssetsByCategory("models").length === 0 ? <div className="loading">Loading...</div> : null}
                  {/* {filterAssetsByCategory("models").length === 0 && (
                    <div className="no_items">
                      <span>{`It's so empty here. How about you fill it up💦`}</span>
                      <Link to="/upload">
                        <button>Upload</button>
                      </Link>
                    </div>
                  )} */}
                {filterAssetsByCategory("models").map((item) => (
                  <ListedItemCard key={item.id} id={item.id} data={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="page_content">
            <PageTitle title="Images" />
            <div className="listing_section">
              <div className="item_listing">
              {filterAssetsByCategory("Images").length === 0 ? <div className="loading">Loading...</div> : null}
              {/* {filterAssetsByCategory("Images").length === "no_item" && (
                <div className="no_items">
                  <span>{`It's so empty here. How about you fill it up💦`}</span>
                  <Link to="/upload">
                    <button>Upload</button>
                  </Link>
                </div>
              )} */}
                {filterAssetsByCategory("images").map((item) => (
                  <ListedItemCard key={item.id} id={item.id} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
        )
      }
    </>
  );
};

export default HeroSection;