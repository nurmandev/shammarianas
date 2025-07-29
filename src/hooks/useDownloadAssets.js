import { useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";

const useSaveDownloadAsset = () => {
  const { currentUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveDownloadDetails = async (assetId) => {
    if (!currentUser) {
      setError("User not logged in.");
      return false;
    }

    if (!assetId) {
      setError("Invalid asset ID");
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 1. Create download record
      const downloadRef = doc(db, `Profiles/${currentUser.uid}/downloads/${assetId}`);
      await setDoc(downloadRef, {
        assetId,
        downloadedAt: new Date(),
        userId: currentUser.uid
      });

      // 2. Update asset download count
      const assetRef = doc(db, "Assets", assetId);
      await updateDoc(assetRef, {
        downloadCount: increment(1)
      });

      return true;
    } catch (error) {
      console.error("Error saving download details:", error);
      setError("Failed to save download details. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveDownloadDetails, isSaving, error };
};

export default useSaveDownloadAsset;