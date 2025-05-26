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
    <>
      <div className="header blog-header section-padding">
        <div className="container mt-30">
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <div className="caption">
                <div className="sub-title fz-12 text-left">
                  <div>{blog.category}</div>
                </div>
                <h1
                  className="fz-55 mt-30 text-left"
                  style={{ maxWidth: "70%" }}
                >
                  {blog.title}
                </h1>
              </div>
              <div className="info d-flex mt-40 align-items-center">
                <div className="left-info">
                  <div className="d-flex align-items-center">
                    {/* <div className="author-info">
                      <div className="d-flex align-items-center">
                        <a href="#0" className="circle-60">
                          <img
                            src="/assets/imgs/blog/author.png"
                            alt=""
                            className="circle-img"
                          />
                        </a>
                        <a href="#0" className="ml-20">
                          <span className="opacity-7">Author</span>
                          <h6 className="fz-16">UiCamp</h6>
                        </a>
                      </div>
                    </div> */}
                    <div className="date ">
                      <a href="#0">
                        <span className="opacity-7">Published</span>
                        <h6 className="fz-16">
                          {new Date(
                            blog.createdAt?.toDate()
                          ).toLocaleDateString()}
                        </h6>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="right-info ml-auto">
                  <div>
                    <span className="pe-7s-comment fz-18 mr-10"></span>
                    <span className="opacity-7">
                      {blog.commentsCount || 0} Comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {/* Body Blog Details Section*/}

      <section className="blog section-padding">
        <div className="container">
          <div className="row xlg-marg">
            <div className="col-lg-8">
              <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-poppins">
                <article className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md">
                  <div
                    className="prose prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </article>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sidebar">
                <div className="widget">
                  <h6 className="title-widget">Search Here</h6>
                  <div className="search-box">
                    <input
                      type="text"
                      name="search-post"
                      placeholder="Search"
                    />
                    <span className="icon pe-7s-search"></span>
                  </div>
                </div>
                <div className="widget catogry">
                  <h6 className="title-widget">Categories</h6>
                  <ul className="rest">
                    <li>
                      <span>
                        <a href="/blog-grid-sidebar">Business</a>
                      </span>
                      <span className="ml-auto">33</span>
                    </li>
                    <li>
                      <span>
                        <a href="/blog-grid-sidebar">Lifestyle</a>
                      </span>
                      <span className="ml-auto">05</span>
                    </li>
                    <li>
                      <span>
                        <a href="/blog-grid-sidebar">Creative</a>
                      </span>
                      <span className="ml-auto">28</span>
                    </li>
                    <li>
                      <span>
                        <a href="/blog-grid-sidebar">WordPress</a>
                      </span>
                      <span className="ml-auto">17</span>
                    </li>
                    <li>
                      <span>
                        <a href="/blog-grid-sidebar">Design</a>
                      </span>
                      <span className="ml-auto">45</span>
                    </li>
                  </ul>
                </div>
                <div className="widget last-post-thum">
                  <h6 className="title-widget">latest Posts</h6>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <a href="/blog-grid-sidebar">
                          <img src="/assets/imgs/blog/c1.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> sep
                            </span>
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <a href="/blog-grid-sidebar">Web Design</a>
                      </span>
                      <h6>
                        <a href="/blog-grid-sidebar">
                          ways to quickly increase traffic to your website
                        </a>
                      </h6>
                    </div>
                  </div>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <a href="/blog-grid-sidebar">
                          <img src="/assets/imgs/blog/c2.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> sep
                            </span>
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <a href="/blog-grid-sidebar">Web Design</a>
                      </span>
                      <h6>
                        <a href="/blog-grid-sidebar">
                          breaking the rules: using sqlite to demo web
                        </a>
                      </h6>
                    </div>
                  </div>
                  <div className="item d-flex align-items-center">
                    <div>
                      <div className="img">
                        <a href="/blog-grid-sidebar">
                          <img src="/assets/imgs/blog/c3.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> sep
                            </span>
                          </span>
                        </a>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <a href="/blog-grid-sidebar">Web Design</a>
                      </span>
                      <h6>
                        <a href="/blog-grid-sidebar">
                          building better ui designs with layout grids
                        </a>
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="widget tags">
                  <h6 className="title-widget">Tags</h6>
                  <div>
                    <a href="/blog-grid-sidebar">Creative</a>
                    <a href="/blog-grid-sidebar">Design</a>
                    <a href="/blog-grid-sidebar">Dark & Light</a>
                    <a href="/blog-grid-sidebar">Minimal</a>
                    <a href="/blog-grid-sidebar">Infolio</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Blogs;
