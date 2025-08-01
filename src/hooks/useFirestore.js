/* eslint-disable react-hooks/rules-of-hooks */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";

export default function useFirestore() {
  const getAllDocuments = (
    collectionName,
    _q = null,
    search = null,
    field = "created_at",
    order = "desc"
  ) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const qRef = useRef(_q).current;

    useEffect(() => {
      setLoading(true);
      let ref = collection(db, collectionName);
      let queries = [];

      if (qRef) {
        queries.push(where(...qRef));
      }
      queries.push(orderBy(field, order));
      let q = query(ref, ...queries);

      const unsubscribe = onSnapshot(
        q,
        (snapShot) => {
          if (snapShot.empty) {
            setData([]);
            setLoading(false);
            if (collectionName === "books") setError("No Blogs(s) Found.");
            if (collectionName === "comments")
              setError("No Comment(s) Found. Be the first to comment.");
            if (collectionName === "notifications")
              setError("You have no notifications.");
            return;
          }

          let collectionDatas = [];
          snapShot.forEach((doc) => {
            let document = { ...doc.data(), id: doc.id };
            doc.data().created_at && collectionDatas.push(document);
          });

          //$ Apply search filter
          let filteredData = collectionDatas;
          if (search?.field && search?.value) {
            const searchNormalized = search.value
              .replace(/\s+/g, "")
              .toLowerCase();
            filteredData = filteredData.filter((doc) => {
              const titleNormalized = doc[search.field]
                .replace(/\s+/g, "")
                .toLowerCase();
              const userNameNormalized = doc["userName"]
                .replace(/\s+/g, "")
                .toLowerCase();

              return (
                titleNormalized.includes(searchNormalized) ||
                userNameNormalized.includes(searchNormalized)
              );
            });
          }

          // Apply category filter
          if (search?.filter && search.filter !== "All") {
            // console.log("Filtering with:", search.filter);
            filteredData = filteredData.filter((doc) =>
              doc?.categories.includes(search.filter)
            );
          }

          setData(filteredData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          setLoading(false);
          setError(error.message);
        }
      );

      return () => unsubscribe();
    }, [
      collectionName,
      qRef,
      search?.field,
      search?.value,
      search?.filter,
      field,
      order,
    ]);

    return { data, error, loading };
  };

  const getDocumentById = (collectionName, id) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      let ref = doc(db, collectionName, id);
      const unsubscribe = onSnapshot(
        ref,
        (doc) => {
          if (doc.exists()) {
            let document = { ...doc.data(), id: doc.id };
            setData(document);
            setLoading(false);
            setError(null);
          } else {
            setData(null);
            setLoading(false);
            setError("Something went wrong.!");
          }
        },
        (error) => {
          setLoading(false);
          setError(error.message);
        }
      );

      return () => unsubscribe();
    }, [collectionName, id]);

    return { data, setData, error, loading };
  };

  const addDocument = (collectionName, data) => {
    data.created_at = serverTimestamp();
    let ref = collection(db, collectionName);
    return addDoc(ref, data);
  };

  const updateDocument = (collectionName, id, data, updateDate = true) => {
    if (updateDate) data.created_at = serverTimestamp();
    let ref = doc(db, collectionName, id);
    return updateDoc(ref, data);
  };

  const deleteDocument = async (collectionName, id) => {
    let ref = doc(db, collectionName, id);
    await deleteDoc(ref);
  };

  return {
    getAllDocuments,
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
