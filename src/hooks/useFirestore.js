import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  QueryConstraint,
  startAfter,
  limit as firestoreLimit
} from "firebase/firestore";
import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "../../firebase";

export default function useFirestore() {
  const getAllDocuments = (
    collectionName,
    filters = [],
    sortOptions = { field: "created_at", order: "desc" },
    pagination = { limit: 10, startAfter: null }
  ) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const lastDocRef = useRef(null);
    const isInitialLoad = useRef(true);

    const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        let ref = collection(db, collectionName);
        let queryConstraints = [];
        
        // Apply filters
        filters.forEach(filter => {
          if (Array.isArray(filter) && filter.length === 3) {
            queryConstraints.push(where(...filter));
          }
        });
        
        // Apply sorting
        if (sortOptions.field) {
          queryConstraints.push(orderBy(sortOptions.field, sortOptions.order || "desc"));
        }
        
        // Apply pagination
        if (pagination.limit) {
          queryConstraints.push(firestoreLimit(pagination.limit));
        }
        if (pagination.startAfter) {
          queryConstraints.push(startAfter(pagination.startAfter));
        }
        
        const q = query(ref, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setData([]);
          setHasMore(false);
          return;
        }
        
        const documents = [];
        querySnapshot.forEach(doc => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        
        // Update last document reference for pagination
        lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        setHasMore(querySnapshot.docs.length === pagination.limit);
        
        setData(prev => isInitialLoad.current ? 
          documents : 
          [...prev, ...documents]
        );
        
        isInitialLoad.current = false;
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err.message || "Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    }, [collectionName, filters, sortOptions, pagination]);

    const loadMore = useCallback(() => {
      if (lastDocRef.current && hasMore) {
        fetchData({ 
          ...pagination, 
          startAfter: lastDocRef.current 
        });
      }
    }, [fetchData, hasMore, pagination]);

    // Real-time updates
    useEffect(() => {
      if (isInitialLoad.current) {
        fetchData();
        return;
      }
      
      let ref = collection(db, collectionName);
      let queryConstraints = [];
      
      // Apply filters for real-time
      filters.forEach(filter => {
        if (Array.isArray(filter) && filter.length === 3) {
          queryConstraints.push(where(...filter));
        }
      });
      
      // Apply sorting for real-time
      if (sortOptions.field) {
        queryConstraints.push(orderBy(sortOptions.field, sortOptions.order || "desc"));
      }
      
      const q = query(ref, ...queryConstraints);
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const updatedDocs = [];
          snapshot.docChanges().forEach(change => {
            if (change.type === "added" || change.type === "modified") {
              updatedDocs.push({ id: change.doc.id, ...change.doc.data() });
            } else if (change.type === "removed") {
              setData(prev => prev.filter(doc => doc.id !== change.doc.id));
            }
          });
          
          if (updatedDocs.length > 0) {
            setData(prev => {
              // Merge updates with existing data
              const merged = [...prev];
              updatedDocs.forEach(updatedDoc => {
                const index = merged.findIndex(doc => doc.id === updatedDoc.id);
                if (index >= 0) {
                  merged[index] = updatedDoc;
                } else {
                  merged.push(updatedDoc);
                }
              });
              return merged;
            });
          }
        },
        (err) => {
          setError(err.message || "Real-time update error");
        }
      );
      
      return unsubscribe;
    }, [collectionName, filters, sortOptions]);

    return { 
      data, 
      error, 
      loading, 
      hasMore, 
      loadMore,
      refetch: fetchData
    };
  };

  const getDocumentById = (collectionName, id) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribers, setSubscribers] = useState([]);

    const fetchDocument = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDocs(docRef);
        
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Document not found");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(err.message || "Failed to fetch document");
      } finally {
        setLoading(false);
      }
    }, [collectionName, id]);

    // Real-time subscription
    useEffect(() => {
      if (!id) return;
      
      const docRef = doc(db, collectionName, id);
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            setData({ id: doc.id, ...doc.data() });
          } else {
            setError("Document has been deleted");
          }
        },
        (err) => {
          setError(err.message || "Real-time update error");
        }
      );
      
      setSubscribers(prev => [...prev, unsubscribe]);
      
      return () => unsubscribe();
    }, [collectionName, id]);

    // Cleanup all subscriptions
    useEffect(() => {
      return () => {
        subscribers.forEach(unsub => unsub());
      };
    }, [subscribers]);

    return { 
      data, 
      error, 
      loading, 
      refetch: fetchDocument,
      updateDocument: async (newData) => {
        try {
          const docRef = doc(db, collectionName, id);
          await updateDoc(docRef, newData);
          return true;
        } catch (err) {
          setError(err.message || "Failed to update document");
          return false;
        }
      }
    };
  };

  const addDocument = async (collectionName, data) => {
    try {
      const ref = collection(db, collectionName);
      const docRef = await addDoc(ref, {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, success: true };
    } catch (err) {
      console.error("Error adding document:", err);
      return { error: err.message, success: false };
    }
  };

  const updateDocument = async (collectionName, id, data) => {
    try {
      const ref = doc(db, collectionName, id);
      await updateDoc(ref, {
        ...data,
        updated_at: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error("Error updating document:", err);
      return { error: err.message, success: false };
    }
  };

  const deleteDocument = async (collectionName, id) => {
    try {
      const ref = doc(db, collectionName, id);
      await deleteDoc(ref);
      return { success: true };
    } catch (err) {
      console.error("Error deleting document:", err);
      return { error: err.message, success: false };
    }
  };

  return {
    getAllDocuments,
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}