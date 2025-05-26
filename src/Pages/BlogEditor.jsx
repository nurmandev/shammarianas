import React, { useState, useRef } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useQuill } from "react-quilljs";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
    ["link", "image", "video"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "script",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
  "code-block",
  "direction",
];

function BlogEditorModal({ isOpen, onClose }) {
  const { quillRef } = useQuill({});

  const [blogData, setBlogData] = useState({
    title: "",
    slug: "",
    category: "business",
    excerpt: "",
    status: "DRAFT",
    image: null,
    imageUrl: "",
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 1250000) {
        alert("Image must be smaller than 1.25MB");
        return;
      }
      setBlogData((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const content = quillRef?.current?.innerHTML || "";
    try {
      const slug = generateSlug(blogData.title);

      let imageUrl = "";
      if (blogData.image) {
        const storageRef = ref(
          storage,
          `blogs/${Date.now()}_${blogData.image.name}`
        );
        await uploadBytes(storageRef, blogData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, "blogs"), {
        title: blogData.title,
        slug: slug,
        category: blogData.category,
        excerpt: blogData.excerpt || blogData.content.substring(0, 160) + "...",
        content: content,
        imageUrl: imageUrl,
        status: blogData.status,
        author: "Admin",
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        commentsCount: 0,
        views: 0,
      });

      alert("Blog published successfully!");
      setBlogData({
        title: "",
        slug: "",
        category: "business",
        excerpt: "",
        status: "DRAFT",
        image: null,
        imageUrl: "",
        content: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Error publishing blog: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blog-modal-overlay">
      <style>{`
        .blog-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .blog-modal-container {
          background: #fff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .blog-modal-content {
          padding: 1.5rem;
        }
        .blog-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .blog-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
        }
        .blog-modal-close {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        .blog-modal-close:hover {
          color: #374151;
        }
        .blog-form-group {
          margin-bottom: 1.5rem;
        }
        .blog-form-label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .blog-form-required {
          color: #e53e3e;
        }
        .blog-form-input,
        .blog-form-select,
        .blog-form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .blog-form-input:focus,
        .blog-form-select:focus,
        .blog-form-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px #bfdbfe;
        }
        .blog-form-file {
          width: 100%;
          font-size: 0.95rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f9fafb;
        }
        .blog-form-hint {
          font-size: 0.9rem;
          color: #e53e3e;
          margin-top: 0.25rem;
        }
        .blog-form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
        }
        .blog-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
        }
        .blog-btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .blog-btn-cancel:hover {
          background: #d1d5db;
        }
        .blog-btn-submit {
          background: #2563eb;
          color: #fff;
        }
        .blog-btn-submit:hover {
          background: #1d4ed8;
        }
        .blog-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .blog-quill-editor {
          min-height: 24rem;
          background: #fff;
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          margin-bottom: 0.5rem;
        }
      `}</style>
      <div className="blog-modal-container">
        <div className="blog-modal-content">
          <div className="blog-modal-header">
            <h1 className="blog-modal-title">Create a New Blog Post</h1>
            <button
              onClick={onClose}
              className="blog-modal-close"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ height: 24, width: 24 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Title <span className="blog-form-required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={blogData.title}
                onChange={handleInputChange}
                required
                className="blog-form-input"
                placeholder="Enter blog title"
              />
            </div>

            {/* Excerpt */}
            <div className="blog-form-group">
              <label className="blog-form-label">Excerpt (Optional)</label>
              <textarea
                name="excerpt"
                value={blogData.excerpt}
                onChange={handleInputChange}
                className="blog-form-textarea"
                placeholder="Short description for preview"
                rows="3"
              />
            </div>

            {/* Featured Image */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Featured Image <span className="blog-form-required">*</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                required
                className="blog-form-file"
              />
              <p className="blog-form-hint">
                * Only images below 1.25MB can be uploaded.
              </p>
            </div>

            {/* Category */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Category <span className="blog-form-required">*</span>
              </label>
              <select
                name="category"
                value={blogData.category}
                onChange={handleInputChange}
                required
                className="blog-form-select"
              >
                <option value="business">Business</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Status */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Status <span className="blog-form-required">*</span>
              </label>
              <select
                name="status"
                value={blogData.status}
                onChange={handleInputChange}
                required
                className="blog-form-select"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Content */}
            <div className="blog-form-group">
              <label className="blog-form-label">
                Content <span className="blog-form-required">*</span>
              </label>
              <div
                value={blogData.content}
                onChange={(value) =>
                  setBlogData((prev) => ({ ...prev, content: value }))
                }
                modules={modules}
                ref={quillRef}
                formats={formats}
                className="blog-quill-editor"
                theme="snow"
              />
            </div>

            {/* Buttons */}
            <div className="blog-form-buttons">
              <button
                type="button"
                onClick={onClose}
                className="blog-btn blog-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="blog-btn blog-btn-submit"
              >
                {isSubmitting ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BlogEditorModal;
