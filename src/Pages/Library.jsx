import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import PageTitle from "../Components/UI/PageTitle";
import { useUser } from "../Context/UserProvider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const Library = () => {
  const { currentUser } = useUser();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    
    const fetchPurchasedAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get purchases from subcollection
        const purchasesRef = collection(db, `Profiles/${currentUser.uid}/purchases`);
        const purchasesSnapshot = await getDocs(purchasesRef);
        
        if (purchasesSnapshot.empty) {
          setAssets([]);
          setLoading(false);
          return;
        }
        
        // Fetch actual asset data for each purchase reference
        const purchasedAssets = [];
        
        for (const purchaseDoc of purchasesSnapshot.docs) {
          try {
            const assetRef = doc(db, "Assets", purchaseDoc.id);
            const assetSnapshot = await getDoc(assetRef);
            
            if (assetSnapshot.exists()) {
              purchasedAssets.push({
                id: purchaseDoc.id,
                ...assetSnapshot.data(),
                // Include purchase-specific data if needed
                purchaseDate: purchaseDoc.data().purchaseDate 
              });
            }
          } catch (err) {
            console.error(`Error fetching asset ${purchaseDoc.id}:`, err);
          }
        }
        
        if (isMounted) {
          setAssets(purchasedAssets);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching purchased assets:", error);
        if (isMounted) {
          setError("Failed to load your library");
          setLoading(false);
        }
      }
    };

    fetchPurchasedAssets();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const calculatePrice = (asset) => {
    const price = parseFloat(asset.price) || 0;
    const discount = parseFloat(asset.discount) || 0;
    
    if (price === 0) return "Free";
    
    const discountedPrice = price - (price * discount) / 100;
    return discountedPrice === 0 
      ? "Free" 
      : `$${discountedPrice.toFixed(2)}`;
  };

  return (
    <>
      <Helmet>
        <title>
          Your library - {currentUser ? currentUser.displayName : "User"}
        </title>
      </Helmet>
      <div className="page_content">
        <PageTitle title="Your Library" />
        <div className="item_listing">
          {loading ? (
            <div className="loading">Loading your library...</div>
          ) : error ? (
            <div className="error">
              <span>{error}</span>
              <button onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="no_items">
              <span>Your library is empty.</span>
              <Link to="/Browse">Browse Assets</Link>
            </div>
          ) : (
            assets.map((asset) => (
              <Link to={`/View/${asset.id}`} key={asset.id}>
                <div className="item_card">
                  <div className="card_image">
                    {asset.discount > 0 && (
                      <div className="discount_card">
                        <span>
                          <strong>-{asset.discount}%</strong>
                        </span>
                      </div>
                    )}
                    {asset.thumbnail ? (
                      <img 
                        src={asset.thumbnail} 
                        alt={asset.title} 
                        loading="lazy"
                      />
                    ) : (
                      <div className="thumbnail_placeholder" />
                    )}
                  </div>

                  <div className="card_content">
                    <span className="title">
                      {asset.title}
                      {asset.userName && (
                        <span className="publisher">
                          by {asset.userName}
                        </span>
                      )}
                    </span>
                    <div className="details">
                      <span className="price">
                        <strong>
                          {calculatePrice(asset)}
                        </strong>
                        {asset.discount > 0 && (
                          <span className="original_price">
                            ${parseFloat(asset.price).toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Library;