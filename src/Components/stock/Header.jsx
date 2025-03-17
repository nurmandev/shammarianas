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
    const allResults = [];
    querySnapshot.forEach((doc) => {
      allResults.push({ id: doc.id, ...doc.data() });
    });
    const newResults = allResults
      .filter((result) => result.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 7);
    setSearchResults(newResults);
    setLoading(false);
    setDisplayResults(searchTerm !== "");
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm !== "") {
      fetchResults();
    } else {
      setResults([]);
      setDisplayResults(false);
    }
  }, [searchTerm, fetchResults]);

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
      <div className="search-wrapper">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-container">
            {/* <i className="icon fa-solid fa-magnifying-glass"></i> */}
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
            {searchTerm ? (
              <i
                className="icon fa-solid fa-times"
                onClick={() => {
                  document.querySelector(".search-input").value = "";
                  setSearchTerm("");
                  setResults([]);
                }}
              ></i>
            ) : (
              ""
            )}
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

            {results.length === 0 && !loading && (
              <div className="no-results">
                <span>No results found</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};


const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Background image with overlay */}
      <div className="hero-background"></div>
      
      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Smarter creativity, faster designs
        </h1>
        <p className="hero-subtitle">
          Everything you need, from stock images and videos to AI-powered design tools.
        </p>
        
        {/* Search component */}
        <div className="search-container">
          <Search />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
