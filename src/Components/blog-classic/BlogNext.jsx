"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";

function BlogNext() {
  const { id } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogs(blogsData);
        const index = blogsData.findIndex((blog) => blog.id === id);
        setCurrentIndex(index);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, [id]);

  const prevBlog = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const nextBlog = currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

  return (
    <section className="next-project sub-bg">
      <div className="container-fluid rest">
        <div className="row">
          <div className="col-md-6 rest">
            <div
              className="text-left box bg-img"
              style={
                prevBlog && prevBlog.imageUrl
                  ? {
                      backgroundImage: `url(${prevBlog.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }>
              <div className="cont d-flex align-items-center">
                <div>
                  {prevBlog ? (
                    <Link to={`/blog-details/${prevBlog.id}`}>
                      <span className="mr-30 fz-30 ti-arrow-left"></span>
                    </Link>
                  ) : (
                    <span className="mr-30 fz-30 ti-arrow-left"></span>
                  )}
                </div>
                <div>
                  <h6 className="sub-title fz-16 mb-5">Prev Blog</h6>
                  {prevBlog ? (
                    <Link to={`/blog-details/${prevBlog.id}`} className="fz-40 fw-600 stroke">
                      {prevBlog.title}
                    </Link>
                  ) : (
                    <span className="fz-40 fw-600 stroke">No Previous Blog</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 rest">
            <div
              className="text-right d-flex box bg-img"
              style={
                nextBlog && nextBlog.imageUrl
                  ? {
                      backgroundImage: `url(${nextBlog.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }>
              <div className="ml-auto">
                <div className="cont d-flex align-items-center">
                  <div>
                    <h6 className="sub-title fz-16 mb-5">Next Blog</h6>
                    {nextBlog ? (
                      <Link to={`/blog-details/${nextBlog.id}`} className="fz-40 fw-600 stroke">
                        {nextBlog.title}
                      </Link>
                    ) : (
                      <span className="fz-40 fw-600 stroke">No Next Blog</span>
                    )}
                  </div>
                  <div>
                    {nextBlog ? (
                      <Link to={`/blog-details/${nextBlog.id}`}>
                        <span className="ml-30 fz-30 ti-arrow-right"></span>
                      </Link>
                    ) : (
                      <span className="ml-30 fz-30 ti-arrow-right"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link to="/blogs" className="all-works-butn text-center">
          <span className="ti-view-grid fz-24 mb-10"></span>
          <span className="d-block fz-12 text-u ls1">all Blogs</span>
        </Link>
      </div>
    </section>
  );
}

export default BlogNext;
