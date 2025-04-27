import "../../public/assets/css/style.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import Marq2 from "../Components/marq2";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import BlogEditor from "./BlogEditor";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blogs"));
        const blogsData = [];
        querySnapshot.forEach((doc) => {
          blogsData.push({ id: doc.id, ...doc.data() });
        });
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "blogs", id));
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="main-bg">Loading...</div>;

  return (
    <div className="main-bg">
      <header
        className="page-header bg-img section-padding valign"
        data-background="/assets/imgs/background/bg4.jpg"
        data-overlay-dark="8"
      >
        <div className="container pt-80">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-u ls1 fz-80">
                  Blog <span className="fw-200"> Standard</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* <BlogEditor /> */}

      <section className="blog-main section-padding">
        <div className="container">
          <div className="row lg-marg justify-content-around">
            <div className="col-lg-8">
              <div className="md-mb80">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <div className="item mb-80" key={blog.id}>
                      {blog.imageUrl && (
                        <div className="img">
                          <img src={blog.imageUrl} alt={blog.title} />
                        </div>
                      )}
                      <div className="content">
                        <div className="d-flex align-items-center mb-15">
                          <div className="post-date">
                            {new Date(
                              blog.createdAt?.toDate()
                            ).toLocaleDateString()}
                          </div>
                          <div className="commt opacity-7 fz-13">
                            <span className="ti-comment-alt mr-10"></span>
                            {blog.commentsCount || 0} Comments
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="btn btn-sm btn-danger ml-auto"
                          style={{
                            background: "#ff4d4f",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                        <h3 className="mb-15">
                          <Link to={`/blog-details/${blog.id}`}>
                            {blog.title}
                          </Link>
                        </h3>
                        <div
                          className="blog-excerpt"
                          dangerouslySetInnerHTML={{
                            __html:
                              blog.excerpt ||
                              blog.content?.substring(0, 200) + "...",
                          }}
                        />
                        <Link
                          to={`/blog-details/${blog.id}`}
                          className="d-flex align-items-center main-color mt-40"
                        >
                          <span className="text mr-15">Read More</span>
                          <span className="ti-arrow-top-right"></span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No blogs match your search.</p>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="sidebar">
                <div className="widget mb-4">
                  <h6 className="title-widget">Search Here</h6>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="icon pe-7s-search"></span>
                  </div>
                </div>
                {/* <div className="widget">
                  <h6 className="title-widget">Search Here</h6>
                  <div className="search-box">
                    <input
                      type="text"
                      name="search-post"
                      placeholder="Search"
                    />
                    <span className="icon pe-7s-search"></span>
                  </div>
                </div> */}
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

      <Marq2 />
      <Footer />
    </div>
  );
}

export default Blogs;
