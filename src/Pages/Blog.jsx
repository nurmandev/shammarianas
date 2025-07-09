"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marq2 from "../Components/marq2";
import { db, auth } from "../../firebase";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import loadBackgroundImages from "../common/loadBackgroudImages";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

    const checkAdminStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userProfileRef = doc(db, "Profiles", currentUser.uid);
          const userDoc = await getDoc(userProfileRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchBlogs();
    checkAdminStatus();
    loadBackgroundImages();
  }, []);

  // const handleDelete = async (id) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
  //   if (!confirmDelete) return;

  //   try {
  //     await deleteDoc(doc(db, "blogs", id));
  //     setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
  //   } catch (error) {
  //     console.error("Error deleting blog:", error);
  //   }
  // };

  const handleFilterChange = (filterValue) => {
    setFilter(filterValue);
  };

  const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchTerm.toLowerCase())).filter((blog) => filter === "*" || blog.category === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-900">Loading...</div>;

  return (
    <div className="min-h-full flex flex-col font-poppins">
      <header className="page-header py-20 items-center" style={{ backgroundImage: "url(/assets/imgs/background/bg4.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container pt-20">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <h1 className="text-7xl md:text-8xl uppercase tracking-wider text-white">
                  Blog <span className="font-light"></span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="blog-main py-20 flex-grow">
        <div className="container">
          <div className="row gap-x-10 justify-around">
            <div className="col-lg-8 mb-20 lg:mb-0">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <div className="item mb-20" key={blog.id}>
                    <div className="img">
                      <img src={blog.imageUrl || "/assets/imgs/background/bg4.jpg"} alt={blog.title} className="w-full h-64 object-cover rounded-xl" />
                    </div>
                    <div className="content">
                      <div className="flex items-center mb-4">
                        <div className="post-date">{new Date(blog.createdAt?.toDate()).toLocaleDateString()}</div>
                        <div className="commt opacity-70 text-xs">
                          <span className="ti-comment-alt mr-2"></span>
                          {blog.commentsCount || 0} Comments
                        </div>
                      </div>
                      <h3 className="mb-4">
                        <Link to={`/blog-details/${blog.id}`}>{blog.title}</Link>
                      </h3>
                      <div
                        className="blog-excerpt"
                        dangerouslySetInnerHTML={{
                          __html: blog.excerpt || blog.content?.substring(0, 200) + "...",
                        }}
                      />
                      <Link to={`/blog-details/${blog.id}`} className="flex items-center text-blue-600 mt-10">
                        <span className="text mr-4">Read More</span>
                        <span className="ti-arrow-top-right"></span>
                        {/* {isAdmin && (
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
                            }}>
                            Delete
                          </button>
                        )} */}
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>No blogs match your search or category.</p>
              )}
            </div>
            <div className="col-lg-4 min-h-fit">
              <div className="sidebar sticky top-5">
                <div className="widget mb-4">
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
                  <h6 className="title-widget">Latest Posts</h6>
                  <div className="item flex items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c1.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Ways to quickly increase traffic to your website</Link>
                      </h6>
                    </div>
                  </div>
                  <div className="item flex items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c2.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Breaking the rules: Using SQLite to demo web</Link>
                      </h6>
                    </div>
                  </div>
                  <div className="item flex items-center">
                    <div>
                      <div className="img">
                        <Link to="/blogs">
                          <img src="/assets/imgs/blog/c3.jpg" alt="" />
                          <span className="date">
                            <span>
                              14 / <br /> Sep
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="cont">
                      <span className="tag">
                        <Link to="/blogs">Web Design</Link>
                      </span>
                      <h6>
                        <Link to="/blogs">Building better UI designs with layout grids</Link>
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="widget tags">
                  <h6 className="title-widget">Tags</h6>
                  <div>
                    <Link to="/blogs">Creative</Link>
                    <Link to="/blogs">Design</Link>
                    <Link to="/blogs">Dark & Light</Link>
                    <Link to="/blogs">Minimal</Link>
                    <Link to="/blogs">Infolio</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="mt-10">
        <Marq2 />
      </footer>
    </div>
  );
}

export default Blogs;
