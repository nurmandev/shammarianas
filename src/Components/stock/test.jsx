import { useState, useEffect, useCallback } from "react";
import { getDocs, collection, query } from "firebase/firestore";
import { db } from "../../../firebase";

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

  useEffect(() => {
    console.log({searchResults});
  }, [searchResults]);

  const sortedResults = searchResults.sort((a, b) => a.type.localeCompare(b.type));

  const groupedResults = sortedResults.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

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

      <div className="hero-container">
        {/* <Navbar /> */}
        <div className="hero-background">
        </div>
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
                </div>
                <button type="submit" className="search-button">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;

