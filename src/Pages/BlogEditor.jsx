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

function BlogEditor() {
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
      window.location.reload();
    } catch (error) {
      console.error("Error publishing blog:", error);
      alert("Error publishing blog: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 font-poppins px-4 md:px-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-10 text-center">
        Create a New Blog Post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-lg space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={blogData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter blog title"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Excerpt (Optional)
          </label>
          <textarea
            name="excerpt"
            value={blogData.excerpt}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Short description for preview"
            rows="3"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Featured Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            required
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          <p className="text-sm text-red-600 mt-1">
            * Only images below 1.25MB can be uploaded.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={blogData.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="business">Business</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={blogData.status}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <div
            value={blogData.content}
            onChange={(value) =>
              setBlogData((prev) => ({ ...prev, content: value }))
            }
            modules={modules}
            ref={quillRef}
            formats={formats}
            className="h-96 bg-white"
            theme="snow"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() =>
              window.confirm("Discard changes?") && window.history.back()
            }
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BlogEditor;
