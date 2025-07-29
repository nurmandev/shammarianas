import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  startAfter,
  writeBatch
} from "firebase/firestore";
import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "../../firebase";

export default function useFirestore() {
  const getAllDocuments = (
    collectionName,
    filters = [],
    sortOptions = { field: "created_at", order: "desc" },
    pagination = { limit: 10 }
  ) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const lastDocRef = useRef(null);
    const isMounted = useRef(true);
    const unsubscribeRef = useRef(null);

    // Create query constraints
    const buildQuery = useCallback((startAfterDoc = null) => {
      const constraints = [];
      
      // Apply filters
      filters.forEach(filter => {
        if (Array.isArray(filter) && filter.length === 3) {
          constraints.push(where(...filter));
        }
      });
      
      // Apply sorting
      if (sortOptions.field) {
        constraints.push(orderBy(sortOptions.field, sortOptions.order || "desc"));
      }
      
      // Apply pagination
      if (pagination.limit) {
        constraints.push(limit(pagination.limit));
      }
      
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }
      
      return query(collection(db, collectionName), ...constraints);
    }, [collectionName, filters, sortOptions, pagination.limit]);

    // Fetch documents
    const fetchData = useCallback(async () => {
      if (!isMounted.current) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const q = buildQuery(lastDocRef.current);
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          if (data.length === 0) setData([]);
          return;
        }
        
        const newDocuments = [];
        querySnapshot.forEach(doc => {
          newDocuments.push({ id: doc.id, ...doc.data() });
        });
        
        // Update last document reference
        lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        setHasMore(newDocuments.length === pagination.limit);
        
        setData(prev => 
          lastDocRef.current && prev.length > 0 
            ? [...prev, ...newDocuments] 
            : newDocuments
        );
      } catch (err) {
        setError(err.message || "Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    }, [buildQuery, pagination.limit, data.length]);

    // Real-time updates
    useEffect(() => {
      if (!isMounted.current) return;
      
      const q = buildQuery();
      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted.current) return;
          
          const updatedDocs = [];
          snapshot.docChanges().forEach(change => {
            // Only process changes for the first page
            if (change.type === "added" && lastDocRef.current) {
              // Skip if document comes after our last fetched doc
              if (change.doc.data().created_at.toMillis() < 
                  lastDocRef.current.data().created_at.toMillis()) {
                return;
              }
            }
            
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
                } else if (!lastDocRef.current || lastDocRef.current === null) {
                  // Only add to beginning if we're on first page
                  merged.unshift(updatedDoc);
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
      
      // Initial fetch
      fetchData();
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, [buildQuery, fetchData]);

    // Load more function
    const loadMore = useCallback(() => {
      if (hasMore && !loading) {
        fetchData();
      }
    }, [hasMore, loading, fetchData]);

    // Reset when dependencies change
    useEffect(() => {
      lastDocRef.current = null;
      setData([]);
      setHasMore(true);
      fetchData();
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, [collectionName, JSON.stringify(filters), sortOptions.field, sortOptions.order]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        isMounted.current = false;
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, []);

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
    const unsubscribeRef = useRef(null);
    const isMounted = useRef(true);

    const fetchDocument = useCallback(async () => {
      if (!isMounted.current) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Document not found");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch document");
      } finally {
        setLoading(false);
      }
    }, [collectionName, id]);

    // Real-time subscription
    useEffect(() => {
      if (!id) return;
      
      const docRef = doc(db, collectionName, id);
      unsubscribeRef.current = onSnapshot(
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
      
      // Initial fetch
      fetchDocument();
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, [collectionName, id, fetchDocument]);

    // Cleanup
    useEffect(() => {
      return () => {
        isMounted.current = false;
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, []);

    return { 
      data, 
      error, 
      loading, 
      refetch: fetchDocument,
      updateDocument: async (newData) => {
        try {
          const docRef = doc(db, collectionName, id);
          await updateDoc(docRef, {
            ...newData,
            updated_at: serverTimestamp()
          });
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
      return { error: err.message, success: false };
    }
  };

  const deleteDocument = async (collectionName, id) => {
    try {
      const ref = doc(db, collectionName, id);
      await deleteDoc(ref);
      return { success: true };
    } catch (err) {
      return { error: err.message, success: false };
    }
  };

  const batchUpdate = async (operations) => {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(op => {
        if (op.type === 'update') {
          const ref = doc(db, op.collection, op.id);
          batch.update(ref, op.data);
        } else if (op.type === 'delete') {
          const ref = doc(db, op.collection, op.id);
          batch.delete(ref);
        } else if (op.type === 'create') {
          const ref = doc(collection(db, op.collection));
          batch.set(ref, {
            ...op.data,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          });
        }
      });
      
      await batch.commit();
      return { success: true };
    } catch (err) {
      return { error: err.message, success: false };
    }
  };

  return {
    getAllDocuments,
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    batchUpdate
  };
}