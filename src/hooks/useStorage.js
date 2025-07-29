import { useState } from "react";
import {
  deleteObject,
  getBlob,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes,
  uploadBytesResumable,
  listAll,
} from "firebase/storage";
import { storage } from "../../firebase";

export default function useStorage() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFileToStorage = async (
    path,
    file,
    metadata = {},
    onProgress = null
  ) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const storageRef = ref(storage, path);
      
      // Use resumable upload for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        ...metadata,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
            onProgress && onProgress(progress);
          },
          (error) => {
            setIsLoading(false);
            setError(error.message || "Upload failed");
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsLoading(false);
              setProgress(100);
              resolve({
                downloadURL,
                metadata: uploadTask.snapshot.metadata,
                ref: uploadTask.snapshot.ref,
              });
            } catch (error) {
              setIsLoading(false);
              setError(error.message || "Failed to get download URL");
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Upload failed");
      throw error;
    }
  };

  const deleteFileFromStorage = async (path) => {
    setIsLoading(true);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Deletion failed");
      throw error;
    }
  };

  const getFileMetadata = async (path) => {
    setIsLoading(true);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);
      setIsLoading(false);
      return metadata;
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Failed to get metadata");
      throw error;
    }
  };

  const downloadFileAsBlob = async (path) => {
    setIsLoading(true);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      const blob = await getBlob(storageRef);
      setIsLoading(false);
      return blob;
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Download failed");
      throw error;
    }
  };

  const listFilesInDirectory = async (path) => {
    setIsLoading(true);
    setError(null);

    try {
      const listRef = ref(storage, path);
      const res = await listAll(listRef);
      setIsLoading(false);
      
      // Get download URLs for all items
      const items = await Promise.all(
        res.items.map(async (itemRef) => ({
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url: await getDownloadURL(itemRef),
          metadata: await getMetadata(itemRef),
        }))
      );
      
      return {
        items,
        prefixes: res.prefixes,
      };
    } catch (error) {
      setIsLoading(false);
      setError(error.message || "Failed to list files");
      throw error;
    }
  };

  return {
    uploadFileToStorage,
    deleteFileFromStorage,
    getFileMetadata,
    downloadFileAsBlob,
    listFilesInDirectory,
    progress,
    isLoading,
    error,
    reset: () => setError(null),
  };
}