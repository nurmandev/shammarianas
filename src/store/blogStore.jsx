import { create } from "zustand";
import axios from "axios";

const blogStore = create((set, get) => ({
  // **************************** Blog List ****************************
  blogList: [],
  blogError: false,
  loading: false,

  // Pagination
  page: 1,
  limit: 10,
  totalPage: 0,
  setPage: (currentPage) => set({ page: currentPage }),

  // **************************** Fetch Blogs ****************************
  getBlogs: async (search) => {
    try {
      set({ loading: true, blogList: [] });
      const { page, limit } = get();
      const response = await axios.get(
        `/api/blogs?search=${search}&page=${page}&limit=${limit}`
      );

      set({
        blogList: response.data.blogs,
        totalPage: Math.ceil(response.data.count / limit),
        loading: false,
        blogError: false,
      });
    } catch (error) {
      set({ loading: false, blogError: "Failed to fetch blogs" });
      return Promise.reject(error);
    }
  },

  // **************************** Fetch Blog by ID or Slug ****************************
  blogData: null,
  getBlog: async (identifier) => {
    try {
      set({ loading: true });
      const response = await axios.get(`/api/blogs/${identifier}`);
      set({ blogData: response.data, loading: false });
    } catch (error) {
      set({ loading: false, blogError: "Blog not found" });
      return Promise.reject(error);
    }
  },

  // **************************** Update Blog ****************************
  updateBlog: async (blogId, updatedData) => {
    try {
      set({ loading: true });
      const response = await axios.put(`/api/blogs/${blogId}`, updatedData);

      set((state) => ({
        blogList: state.blogList.map((blog) =>
          blog._id === blogId ? response.data : blog
        ),
        blogData: response.data,
        loading: false,
      }));

      return response.data;
    } catch (error) {
      set({ loading: false, blogError: "Failed to update blog" });
      return Promise.reject(error);
    }
  },

  // **************************** Delete Blog ****************************
  deleteBlog: async (blogId) => {
    try {
      set({ loading: true });
      await axios.delete(`/api/blogs/${blogId}`);

      set((state) => ({
        blogList: state.blogList.filter((blog) => blog._id !== blogId),
        blogData: null,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false, blogError: "Failed to delete blog" });
      return Promise.reject(error);
    }
  },
}));

export default blogStore;
