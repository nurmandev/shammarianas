import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "../../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit,
  orderBy
} from "firebase/firestore";
import { useFilters } from "../Context/FilterContext";
import { Link } from "react-router-dom";
import useSearchStore from "../store/searchStore";
import ListedItemCard from "./UI/ListedItemCard";

// Helper function for text normalization
const normalizeText = (text) => 
  text ? text.trim().toLowerCase() : "";

const ItemsListing = (props) => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filters = useFilters().filters;
  const { searchTerm } = useSearchStore();
  const asset_type = props.category || "models";

  // Memoized normalized search term
  const normalizedSearchTerm = useMemo(
    () => normalizeText(searchTerm),
    [searchTerm]
  );

  // Fetch items from Firestore
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query constraints
        const constraints = [
          where("type", "==", asset_type)
        ];

        // Add user filter if provided
        if (props.userId) {
          constraints.push(where("userId", "==", props.userId));
        }

        // Add limit if provided
        if (props.limit) {
          constraints.push(limit(props.limit));
        }

        // Add ordering
        constraints.push(orderBy("date", "desc"));

        // Create query
        const itemsQuery = query(
          collection(db, "Assets"),
          ...constraints
        );

        const snapshot = await getDocs(itemsQuery);
        
        if (snapshot.empty) {
          setAllItems([]);
          setLoading("no_items");
          return;
        }

        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAllItems(itemsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items");
        setLoading(false);
      }
    };

    fetchItems();
  }, [props.userId, props.limit, asset_type]);

  // Calculate discounted price for an item
  const calculateDiscountedPrice = useCallback((item) => {
    return item.price - (item.price * (item.discount || 0)) / 100;
  }, []);

  // Filter items based on search term and filters
  const filteredItems = useMemo(() => {
    if (!allItems.length) return [];

    return allItems.filter(item => {
      // Apply search term filter
      if (normalizedSearchTerm) {
        const inTitle = normalizeText(item.title).includes(normalizedSearchTerm);
        const inTags = Array.isArray(item.tags) 
          ? item.tags.some(tag => normalizeText(tag).includes(normalizedSearchTerm))
          : false;
          
        if (!inTitle && !inTags) return false;
      }

      // Apply category filter
      if (filters?.categories?.length) {
        if (!filters.categories.includes(item.category)) return false;
      }

      // Apply price filter
      if (filters?.price) {
        const discountedPrice = calculateDiscountedPrice(item);
        if (discountedPrice > filters.price) return false;
      }

      // Apply discount filter
      if (filters?.discounts?.length) {
        const minDiscount = Math.min(...filters.discounts);
        if ((item.discount || 0) < minDiscount) return false;
      }

      return true;
    });
  }, [allItems, normalizedSearchTerm, filters, calculateDiscountedPrice]);

  // Loading and empty states
  if (loading === true) {
    return (
      <div className="item_listing">
        <div className="loading">Loading items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item_listing">
        <div className="error">
          {error}
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (loading === "no_items") {
    return (
      <div className="item_listing">
        <div className="no_items">
          <span>It's so empty here. How about you fill it up💦</span>
          <Link to="/upload">
            <button>Upload</button>
          </Link>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="item_listing">
        <div className="no_matches">
          <span>No items match your search and filters</span>
          <button onClick={() => useSearchStore.getState().setSearchTerm("")}>
            Clear Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="item_listing">
      {filteredItems.map(item => (
        <ListedItemCard key={item.id} id={item.id} data={item} />
      ))}
    </div>
  );
};

export default ItemsListing;