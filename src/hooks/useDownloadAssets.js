import { useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";

const useSaveDownloadAsset = () => {
  const { currentUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveDownloadDetails = async (assetId, assetData = null) => {
    if (!currentUser) {
      setError("User not logged in.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const downloadDocRef = doc(db, `Profiles/${currentUser.uid}/downloads/${assetId}`);
      
      // Check if assetData looks like an event object
      let dataToStore = null;
      
      // If assetData is provided but looks like an event object, ignore it
      if (assetData && (assetData.nativeEvent || assetData.target || assetData.currentTarget)) {
        console.log("Event object detected, not using it as asset data");
        dataToStore = null;
      } else {
        dataToStore = assetData;
      }
      
      if (!dataToStore) {
        // If no valid data was provided, fetch it from the Assets collection
        const assetDocRef = doc(db, "Assets", assetId);
        const assetDoc = await getDoc(assetDocRef);
        
        if (!assetDoc.exists()) {
          throw new Error("Asset not found");
        }
        
        dataToStore = assetDoc.data();
      }
      
      // Clean any non-serializable fields before storing
      const cleanData = {};
      
      // Only keep serializable data types that Firestore supports
      Object.keys(dataToStore).forEach(key => {
        const value = dataToStore[key];
        const type = typeof value;
        
        // Skip functions, complex objects, and null values
        if (
          value === null || 
          value === undefined || 
          type === 'function' || 
          (type === 'object' && value.constructor !== Array && value.constructor !== Object && !(value instanceof Date))
        ) {
          return;
        }
        
        cleanData[key] = value;
      });
      
      // Store the asset data in the downloads subcollection
      await setDoc(downloadDocRef, {
        ...cleanData,
        downloaded_at: new Date()
      });

      console.log("Download details saved successfully:", assetId);
    } catch (error) {
      console.error("Error saving download details:", error);
      setError("Failed to save download details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return { saveDownloadDetails, isSaving, error };
};

export default useSaveDownloadAsset;