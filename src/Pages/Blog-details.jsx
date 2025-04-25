"use client";
import React, { useEffect, useState } from "react";
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading blog...
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-500">
        Blog not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
      <article className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>

        <div className="flex flex-wrap items-center justify-between mb-6 text-sm text-gray-500">
          <span>{new Date(blog.createdAt?.toDate()).toLocaleDateString()}</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium uppercase">
            {blog.category}
          </span>
        </div>

        {blog.imageUrl && (
          <div className="mb-6">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full rounded-xl object-cover max-h-[500px]"
            />
          </div>
        )}

        <div
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>
    </div>
  );
}

export default Blogs;
