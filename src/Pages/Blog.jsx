import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import loadBackgroudImages from "../common/loadBackgroudImages";
import Marq2 from "../Components/marq2";
import ProgressScroll from "../common/ProgressScroll";
import Cursor from "../common/cusor";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("*");

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
    loadBackgroudImages();
  }, []);

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase())).filter((blog) => filter === "*" || blog.category === filter);

  if (loading) return <div className="blog-loading-screen">Loading...</div>;

  return (
    <>
      <Cursor />
      <ProgressScroll />
      <header
        className="page-header items-center"
        style={{
          backgroundImage: "url(/assets/imgs/background/bg4.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
        <div className="text-center">
          <h1 className="text-7xl md:text-8xl uppercase tracking-wider text-white">
            Blog <span className="font-light"></span>
          </h1>
        </div>
      </header>

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
                          <div className="post-date">{new Date(blog.createdAt?.toDate()).toLocaleDateString()}</div>
                          <div className="commt opacity-7 fz-13">
                            <span className="ti-comment-alt mr-10"></span>
                            {blog.commentsCount || 0} Comments
                          </div>
                        </div>

                        <h3 className="mb-15">
                          <Link to={`/blog-details/${blog.id}`}>{blog.title}</Link>
                        </h3>
                        <div
                          className="blog-post-excerpt"
                          dangerouslySetInnerHTML={{
                            __html: blog.excerpt || blog.content?.substring(0, 200) + "...",
                          }}
                        />
                        <Link to={`/blog-details/${blog.id}`} className="d-flex align-items-center main-color mt-40">
                          <span className="text mr-15">Read More</span>
                          <span className="ti-arrow-top-right"></span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="blog-no-results">No blogs match your search.</p>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="sidebar">
                <div className="widget">
                  <h6 className="title-widget">Search Here</h6>
                  <div className="search-box">
                    <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="icon pe-7s-search"></span>
                  </div>
                </div>
                <div className="widget catogry">
                  <h6 className="title-widget">Categories</h6>
                  <ul className="rest">
                    <li>
                      <span onClick={() => handleFilterChange("*")} className={filter === "*" ? "active" : ""} style={{ cursor: "pointer" }}>
                        All
                      </span>
                      <span className="ml-auto">{blogs.length}</span>
                    </li>
                    <li>
                      <span onClick={() => handleFilterChange("business")} className={filter === "business" ? "active" : ""} style={{ cursor: "pointer" }}>
                        Business
                      </span>
                      <span className="ml-auto">{blogs.filter((b) => b.category === "business").length}</span>
                    </li>
                    <li>
                      <span onClick={() => handleFilterChange("lifestyle")} className={filter === "lifestyle" ? "active" : ""} style={{ cursor: "pointer" }}>
                        Lifestyle
                      </span>
                      <span className="ml-auto">{blogs.filter((b) => b.category === "lifestyle").length}</span>
                    </li>
                    <li>
                      <span onClick={() => handleFilterChange("creative")} className={filter === "creative" ? "active" : ""} style={{ cursor: "pointer" }}>
                        Creative
                      </span>
                      <span className="ml-auto">{blogs.filter((b) => b.category === "creative").length}</span>
                    </li>
                    <li>
                      <span onClick={() => handleFilterChange("wordpress")} className={filter === "wordpress" ? "active" : ""} style={{ cursor: "pointer" }}>
                        WordPress
                      </span>
                      <span className="ml-auto">{blogs.filter((b) => b.category === "wordpress").length}</span>
                    </li>
                    <li>
                      <span onClick={() => handleFilterChange("design")} className={filter === "design" ? "active" : ""} style={{ cursor: "pointer" }}>
                        Design
                      </span>
                      <span className="ml-auto">{blogs.filter((b) => b.category === "design").length}</span>
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
                        <a href="/blog-grid-sidebar">ways to quickly increase traffic to your website</a>
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
                        <a href="/blog-grid-sidebar">breaking the rules: using sqlite to demo web</a>
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
                        <a href="/blog-grid-sidebar">building better ui designs with layout grids</a>
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
    </>
  );
}

export default Blogs;
