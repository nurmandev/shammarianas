import { db } from "../../firebase";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";

const useAddToPurchase = () => {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToPurchase = async (asset) => {
    if (!currentUser) {
      const err = new Error("User not authenticated");
      setError(err);
      throw err;
    }

    if (!asset?.id) {
      const err = new Error("Invalid asset data");
      setError(err);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      // Reference to user's purchase history
      const userRef = doc(db, "Profiles", currentUser.uid);
      
      // Reference to specific purchase
      const purchaseRef = doc(db, 
        "Profiles", 
        currentUser.uid,
        "purchases",
        asset.id
      );

      // Create purchase record
      await setDoc(purchaseRef, {
        assetId: asset.id,
        purchasedAt: new Date(),
        pricePaid: asset.price - (asset.price * (asset.discount || 0)) / 100,
        licenseType: asset.licenseType || "Standard",
      });

      // Add to user's purchase history
      await updateDoc(userRef, {
        purchases: arrayUnion({
          assetId: asset.id,
          purchasedAt: new Date(),
        }),
      });

      // Record transaction
      const transactionRef = doc(collection(db, "Transactions"));
      await setDoc(transactionRef, {
        userId: currentUser.uid,
        assetId: asset.id,
        amount: asset.price - (asset.price * (asset.discount || 0)) / 100,
        currency: "USD",
        date: new Date(),
        status: "completed",
      });

      return true;
    } catch (err) {
      console.error("Error adding purchase:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addToPurchase, loading, error };
};

export default useAddToPurchase;