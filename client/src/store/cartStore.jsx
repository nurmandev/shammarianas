import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

const cartStore = create((set) => ({
  // **************************** Fetch categories ****************************
  cartList: [],
  bill: "",

  getCartItems: async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/cart/${id}`,
        {
          headers: {
            "content-type": "application/json",
            Authorization: Cookies.get("token"),
          },
          withCredentials: true,
        }
      );
      set({
        cartList: response.data.cart.items,
        bill: response.data.cart.bill,
      });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },

  itemAdded: false,
  closeItemAdded: () => {
    set({ itemAdded: false });
  },
  addToCart: async (itemId, customerId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/cart/${customerId}`,
        { itemId },
        {
          headers: {
            "content-type": "application/json",
            Authorization: Cookies.get("token"),
          },
          withCredentials: true,
        }
      );

      set({
        cartList: response.data.items,
        bill: response.data.bill,
        itemAdded: true,
      });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },

  removeFromCart: async (itemId, customerId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/cart/${customerId}`,
        {
          data: { itemId },
          headers: {
            "content-type": "application/json",
            Authorization: Cookies.get("token"),
          },
          withCredentials: true,
        }
      );
      set({
        cartList: response.data.items,
        bill: response.data.bill,
      });
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },

  // **************************** Download product ****************************
  downloadProduct: async () => {
    try {
      const { cartList } = cartStore.getState();
      let files = [];
      cartList.map((item) =>
        files.push(item.files.length === 1 ? item.files[0] : item.files[1])
      );
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/download-product`,
        {
          filenames: files,
        },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "markstone-files.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  },

  transformCartData: (customerId, cartData) => {
    const transformedData = {
      userId: customerId,
      cartItems: cartData.map((item) => ({
        name: item.name,
        id: item.itemId,
        price: item.price,
        cartQuantity: item.quantity,
      })),
    };

    return transformedData;
  },

  paymentUrl: "",
  payed: false,
  checkout: async (customerId) => {
    const { transformCartData, cartList } = cartStore.getState();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/create-checkout-session`,
        transformCartData(customerId, cartList),
        {
          headers: {
            "content-type": "application/json",
            Authorization: Cookies.get("token"),
          },
          withCredentials: true,
        }
      );
      set({
        paymentUrl: response.data.url,
      });
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
}));

export default cartStore;
