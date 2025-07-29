import { useState, useEffect, useCallback } from "react";
import { db } from "../../firebase";
import { doc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const useSaveToDownloads = (assetId) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check download status
  useEffect(() => {
    if (!currentUser || !assetId) return;

    const checkDownloadStatus = async () => {
      try {
        const downloadRef = doc(
          db,
          `Profiles/${currentUser.uid}/downloads/${assetId}`
        );
        const downloadSnap = await getDoc(downloadRef);
        setIsDownloaded(downloadSnap.exists());
      } catch (err) {
        console.error("Download check error:", err);
        setError("Failed to check download status");
      }
    };

    checkDownloadStatus();
  }, [currentUser, assetId]);

  const addToDownloads = useCallback(async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: window.location.pathname } });
      return false;
    }

    if (!assetId) {
      setError("Missing asset ID");
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Verify asset exists
      const assetRef = doc(db, "Assets", assetId);
      const assetSnap = await getDoc(assetRef);
      
      if (!assetSnap.exists()) {
        throw new Error("Asset not found");
      }

      // Create download reference
      const downloadRef = doc(
        db,
        `Profiles/${currentUser.uid}/downloads/${assetId}`
      );

      // Store minimal download data
      await setDoc(downloadRef, {
        assetId,
        downloadedAt: new Date(),
        userId: currentUser.uid
      });

      // Update asset download count
      await setDoc(assetRef, {
        downloadCount: (assetSnap.data().downloadCount || 0) + 1
      }, { merge: true });

      setIsDownloaded(true);
      return true;
    } catch (err) {
      console.error("Download save error:", err);
      setError(err.message || "Failed to save download");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, assetId, navigate]);

  const removeFromDownloads = useCallback(async () => {
    if (!currentUser || !assetId) return false;

    setIsSaving(true);
    setError(null);

    try {
      const downloadRef = doc(
        db,
        `Profiles/${currentUser.uid}/downloads/${assetId}`
      );
      
      await deleteDoc(downloadRef);
      setIsDownloaded(false);
      return true;
    } catch (err) {
      console.error("Download removal error:", err);
      setError(err.message || "Failed to remove download");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, assetId]);

  return { 
    isDownloaded, 
    addToDownloads, 
    removeFromDownloads, 
    isSaving, 
    error 
  };
};

export default useSaveToDownloads;