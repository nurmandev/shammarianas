import { useState } from "react";
import { db } from "../../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";

const useSaveDownloadAsset = () => {
  const { currentUser } = useUser();
  const [isSaving, setIsSaving] = useState(false); // Tracks if the save operation is in progress
  const [error, setError] = useState(null);

  const saveDownloadDetails = async (assetId) => {
    if (!currentUser) {
      setError("User not logged in.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Update the user's profile to add the downloaded asset ID
      const userProfileRef = doc(db, "Users", currentUser.uid);
      await updateDoc(userProfileRef, {
        downloadedItems: arrayUnion(assetId),
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

// example usage
// import React from "react";
// import useSaveDownloadAsset from "../hooks/useSaveDownloadAsset";

// const DownloadButton = ({ assetId }) => {
//   const { saveDownloadDetails, isSaving, error } = useSaveDownloadAsset();

//   const handleDownload = async () => {
//     // Trigger the actual download logic here (assumed to be already implemented)
//     console.log("Downloading asset:", assetId);

//     // Save the download details to Firestore
//     await saveDownloadDetails(assetId);
//   };

//   return (
//     <div>
//       <button onClick={handleDownload} disabled={isSaving}>
//         {isSaving ? "Saving..." : "Download"}
//       </button>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };

// export default DownloadButton;