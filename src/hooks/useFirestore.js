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

    const buildQuery = useCallback((startAfterDoc = null) => {
      let queryConstraints = [];

      // Apply filters
      filters.forEach(filter => {
        if (Array.isArray(filter) && filter.length === 3) {
          queryConstraints.push(where(...filter));
        }
      });

      // Apply sorting
      if (sortOptions?.field) {
        queryConstraints.push(
          orderBy(sortOptions.field, sortOptions.order || "desc")
        );
      }

      // Apply pagination
      if (pagination?.limit) {
        queryConstraints.push(limit(pagination.limit));
      }

      if (startAfterDoc) {
        queryConstraints.push(startAfter(startAfterDoc));
      }

      return query(collection(db, collectionName), ...queryConstraints);
    }, [collectionName, JSON.stringify(filters), JSON.stringify(sortOptions), pagination?.limit]);

    const fetchData = useCallback(async (isInitialLoad = false) => {
      if (!isMounted.current) return;

      setLoading(true);
      setError(null);

      try {
        const q = buildQuery(isInitialLoad ? null : lastDocRef.current);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setHasMore(false);
          if (isInitialLoad) setData([]);
          return;
        }

        const newDocuments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
        setHasMore(newDocuments.length === pagination.limit);

        setData(prev => {
          if (isInitialLoad) return newDocuments;
          
          // Merge new documents with existing data
          const merged = [...prev];
          newDocuments.forEach(newDoc => {
            if (!merged.some(doc => doc.id === newDoc.id)) {
              merged.push(newDoc);
            }
          });
          return merged;
        });
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "Failed to fetch documents");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }, [buildQuery, pagination.limit]);

    useEffect(() => {
      if (!isMounted.current) return;

      const q = buildQuery();
      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted.current) return;

          snapshot.docChanges().forEach(change => {
            const changedDoc = { id: change.doc.id, ...change.doc.data() };

            setData(prev => {
              // Handle document changes
              switch (change.type) {
                case "added":
                  // Only add if not already present and matches current filters
                  if (!prev.some(doc => doc.id === changedDoc.id)) {
                    return [changedDoc, ...prev];
                  }
                  break;
                case "modified":
                  return prev.map(doc => 
                    doc.id === changedDoc.id ? changedDoc : doc
                  );
                case "removed":
                  return prev.filter(doc => doc.id !== changedDoc.id);
                default:
                  break;
              }
              return prev;
            });
          });
        },
        (err) => {
          if (isMounted.current) {
            setError(err.message || "Real-time update error");
          }
        }
      );

      // Initial fetch
      fetchData(true);

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }, [buildQuery, fetchData]);

    const loadMore = useCallback(() => {
      if (hasMore && !loading) {
        fetchData();
      }
    }, [hasMore, loading, fetchData]);

    const reset = useCallback(() => {
      lastDocRef.current = null;
      setData([]);
      setHasMore(true);
      fetchData(true);
    }, [fetchData]);

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
      reset,
      refetch: () => fetchData(true)
    };
  };

  const getDocumentById = (collectionName, id) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef(null);
    const isMounted = useRef(true);

    const fetchDocument = useCallback(async () => {
      if (!isMounted.current || !id) return;

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Document not found");
          setData(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "Failed to fetch document");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }, [collectionName, id]);

    useEffect(() => {
      if (!id) return;

      const docRef = doc(db, collectionName, id);
      unsubscribeRef.current = onSnapshot(
        docRef,
        (doc) => {
          if (!isMounted.current) return;

          if (doc.exists()) {
            setData({ id: doc.id, ...doc.data() });
            setError(null);
          } else {
            setError("Document has been deleted");
            setData(null);
          }
        },
        (err) => {
          if (isMounted.current) {
            setError(err.message || "Real-time update error");
          }
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
          if (isMounted.current) {
            setError(err.message || "Failed to update document");
          }
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
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
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
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
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
          batch.update(ref, {
            ...op.data,
            updated_at: serverTimestamp()
          });
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