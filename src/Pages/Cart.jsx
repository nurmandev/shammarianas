import  { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useUser } from "../Context/UserProvider";

const Cart = () => {
  const { currentUser } = useUser();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    // Component mounted
  }, [])

  useEffect(() => {
    const fetchCartItems = () => {
      const savedCart = localStorage.getItem("cart");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    fetchCartItems();

    const handleStorageChange = () => {
      fetchCartItems();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const removeItemFromCart = useCallback(
    (id) => {
      const newCartItems = cartItems.filter((cartItem) => cartItem.id !== id);
      setCartItems(newCartItems);
      localStorage.setItem("cart", JSON.stringify(newCartItems));
    },
    [cartItems]
  );

  const calculateTotal = useCallback(() => {
    return cartItems
      .reduce(
        (total, item) =>
          total + (item.price - (item.price * item.discount) / 100),
        0
      )
      .toFixed(2);
  }, [cartItems]);


  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          cartItems, 
          userId: currentUser?.uid 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
  
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Show error to user
      alert("Error during checkout. Please try again.");
    }
  };


  return (
    <>
      <Helmet>
        <title>Cart | Shammarianas</title>
        <meta
          name="description"
          content="View your cart items and proceed to checkout."
        />
        <meta property="og:title" content="Cart | Shammarianas" />
        <meta
          property="og:description"
          content="View your cart items and proceed to checkout."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="page_content">
        <div className="cart_main">
          <div className="title">
            <h1>Cart</h1>
          </div>

          {cartItems.length > 0 ? (
            <>
              <div className="cart_items">
                {cartItems.map((item) => (
                  <div className="cart_item" key={item.id}>
                    <Link to={`/View/${item.id}`} key={item.id}>
                      <div className="image">
                        <img src={item.thumbnail} alt="item" />
                      </div>
                      <div className="item_details">
                        <div className="item_title">{item.title}</div>
                        <div className="price">
                          $
                          {(
                            item.price -
                            (item.price * item.discount) / 100
                          ).toFixed(2)}
                        </div>
                      </div>
                    </Link>

                    <button
                      className="remove_btn"
                      onClick={() => removeItemFromCart(item.id)}
                    >
                      <i className="fas fa-x"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="total">
                Total: <span className="value">${calculateTotal()}</span>
              </div>

              <div className="checkout">
                  <button
                  onClick={handleCheckout}
                  >
                    Checkout
                  </button>
              </div>
            </>
          ) : (
            <span className="no_items">No items in the cart.</span>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;


// import { useState, useEffect, useCallback } from "react";
// import { Helmet } from "react-helmet";
// import { Link } from "react-router-dom";
// import { loadStripe } from '@stripe/stripe-js';
// // import { Elements } from '@stripe/react-stripe-js';
// import { useUser } from "../Context/UserProvider";

// // Load Stripe outside of components
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const Cart = () => {
//   const { currentUser } = useUser();

//   const [cartItems, setCartItems] = useState(() => {
//     const savedCart = localStorage.getItem("cart");
//     return savedCart ? JSON.parse(savedCart) : [];
//   });

//   useEffect(() => {
//     const fetchCartItems = () => {
//       const savedCart = localStorage.getItem("cart");
//       setCartItems(savedCart ? JSON.parse(savedCart) : []);
//     };

//     fetchCartItems();

//     const handleStorageChange = () => {
//       fetchCartItems();
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   const removeItemFromCart = useCallback(
//     (id) => {
//       const newCartItems = cartItems.filter((cartItem) => cartItem.id !== id);
//       setCartItems(newCartItems);
//       localStorage.setItem("cart", JSON.stringify(newCartItems));
//     },
//     [cartItems]
//   );

//   const calculateTotal = useCallback(() => {
//     return cartItems
//       .reduce(
//         (total, item) =>
//           total + (item.price - (item.price * item.discount) / 100),
//         0
//       )
//       .toFixed(2);
//   }, [cartItems]);

//   const handleCheckout = async () => {
//     console.log({ cartItems, userId: currentUser?.uid })
//     try {
//       const response = await fetch("/api/checkout", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ cartItems, userId: currentUser?.uid }),
//       });
  
//       const { id } = await response.json();
//       if (id) {
//         window.location.href = `https://checkout.stripe.com/pay/${id}`;
//       }
//     } catch (error) {
//       console.error("Checkout error:", error);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Cart | Shammarianas</title>
//         <meta
//           name="description"
//           content="View your cart items and proceed to checkout."
//         />
//         <meta property="og:title" content="Cart | Shammarianas" />
//         <meta
//           property="og:description"
//           content="View your cart items and proceed to checkout."
//         />
//         <meta property="og:type" content="website" />
//       </Helmet>
//       <div className="page_content">
//         <div className="cart_main">
//           <div className="title">
//             <h1>Cart</h1>
//           </div>

//           {cartItems.length > 0 ? (
//             <>
//               <div className="cart_items">
//                 {cartItems.map((item) => (
//                   <div className="cart_item" key={item.id}>
//                     <Link to={`/View/${item.id}`} key={item.id}>
//                       <div className="image">
//                         <img src={item.thumbnail} alt="item" />
//                       </div>
//                       <div className="item_details">
//                         <div className="item_title">{item.title}</div>
//                         <div className="price">
//                           $
//                           {(
//                             item.price -
//                             (item.price * item.discount) / 100
//                           ).toFixed(2)}
//                         </div>
//                       </div>
//                     </Link>

//                     <button
//                       className="remove_btn"
//                       onClick={() => removeItemFromCart(item.id)}
//                     >
//                       <i className="fas fa-x"></i>
//                     </button>
//                   </div>
//                 ))}
//               </div>
//               <div className="total">
//                 Total: <span className="value">${calculateTotal()}</span>
//               </div>

//               <div className="checkout">
//                 <button onClick={handleCheckout}>
//                   Checkout
//                 </button>
//               </div>
//             </>
//           ) : (
//             <span className="no_items">No items in the cart.</span>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;
