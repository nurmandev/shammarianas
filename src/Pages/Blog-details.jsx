"use client";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import loadBackgroudImages from "../common/loadBackgroudImages";

function Blogs() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackgroudImages();
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
          console.log({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such blog!");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found</div>;

  return (
    <>
      <div className="blog-details-container">
        <article className="blog-article">
          <h1>{blog.title}</h1>

          <div className="blog-meta">
            <span className="blog-date">
              {new Date(blog.createdAt?.toDate()).toLocaleDateString()}
            </span>
            <span className="blog-category">{blog.category}</span>
          </div>

          {blog.imageUrl && (
            <div className="blog-featured-image">
              <img src={blog.imageUrl} alt={blog.title} />
            </div>
          )}

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </>
  );
}

export default Blogs;
