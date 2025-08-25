// import React from "react";
// import { useState } from "react";
// import { useCallback } from "react";
// import { ethers } from "ethers";
// import { Link } from "react-router-dom";
// import CheckoutForm from "../Components/CheckoutForm";
// import { useUser } from "../Context/UserProvider";
// import { parseEther } from "ethers";
// import { db } from "../../firebase";
// const Checkout = () => {
//   const { currentUser } = useUser();
//   const [formData, setFormData] = useState("");

//   const [cardType, setCardType] = useState("");

//   const [cartItems, setCartItems] = useState(() => {
//     // Initialize state with local storage
//     const savedCart = localStorage.getItem("cart");
//     return savedCart ? JSON.parse(savedCart) : [];
//   });

//   const calculateTotal = useCallback(() => {
//     return cartItems
//       .reduce(
//         (total, item) =>
//           total + (item.price - (item.price * item.discount) / 100),
//         0
//       )
//       .toFixed(2);
//   }, [cartItems]);

//   const payWithCrypto = async () => {
//     if (!window.ethereum) {
//       alert(
//         "No Ethereum wallet detected. Please install an Ethereum wallet to proceed."
//       );
//       return;
//     }

//     try {
//       console.log("Requesting account access...");
//       await window.ethereum.request({ method: "eth_requestAccounts" });
//       console.log("Account access granted.");

//       // Initialize ethers provider
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       // Fetch current exchange rate (INR to ETH) - replace with real-time fetch
//       const ethToInrRate = 120000; // Example: 1 ETH = 1,20,000 INR (you would fetch this in real-time)

//       // Calculate total in INR
//       const totalInInr = (calculateTotal() * 1.03).toFixed(2);
//       console.log("Total in INR:", totalInInr);

//       // Convert INR to ETH
//       const totalInEth = (totalInInr / ethToInrRate).toFixed(6);
//       console.log("Total in ETH:", totalInEth);

//       // Define the transaction parameters
//       const transactionParameters = {
//         to: "0x3349CfAcd34b41D2Db7Cc88B9038aD0c5f9D6888", // Recipient address
//         value: ethers.parseEther(totalInEth.toString()), // Amount to send (in wei)
//         gasLimit: 21000, // Set the gas limit directly as a number
//       };

//       console.log("Transaction parameters defined:", transactionParameters);

//       // Send the transaction
//       const tx = await signer.sendTransaction(transactionParameters);
//       console.log("Transaction sent:", tx);

//       // Wait for the transaction to be mined
//       const receipt = await tx.wait();
//       console.log("Transaction mined:", receipt);

//       // add the purchased items in owneditems in firebase

//       const userRef = db.collection("users").doc(currentUser.uid);

//       const userDoc = await userRef.get();

//       if (userDoc.exists) {
//         const userOwnedItems = userDoc.data().ownedItems;

//         const updatedOwnedItems = [...userOwnedItems, ...cartItems];

//         await userRef.update({
//           ownedItems: updatedOwnedItems,
//         });

//         // if successful, clear the cart

//         localStorage.removeItem("cart");

//         setCartItems([]);
//       }

//       alert("Payment successful!");
//     } catch (error) {
//       console.error("Payment failed:", error);
//       alert("Payment failed. Please try again.");
//     }
//   };

//   return (
//     <div className="page_content">
//       <div className="checkout_main">
//         <div className="title">
//           <h1>Checkout</h1>
//         </div>

//         <div className="container">
//           <div className="left">
//             <form action="">
//               <h2 className="section_title">Personal Details</h2>

//               <div className="section">
//                 <div className="group">
//                   <div className="input_field">
//                     <label htmlFor="">First Name</label>
//                     <input type="text" name="first_name" />
//                   </div>

//                   <div className="input_field">
//                     <label htmlFor="">Last Name</label>
//                     <input type="text" name="last_name" />
//                   </div>
//                 </div>
//                 <div className="input_field">
//                   <label htmlFor="">Email</label>
//                   <input type="email" name="email" />{" "}
//                 </div>{" "}
//               </div>

//               <h2 className="section_title">Billing Address</h2>

//               <div className="section">
//                 <div className="group">
//                   <div className="input_field">
//                     <label htmlFor="">Region</label>
//                     <select name="region" id="Region">
//                       <option value="" disabled selected="selected">
//                         Select Country
//                       </option>
//                       <option value="USA">USA</option>
//                       <option value="Canada">Canada</option>
//                       <option value="UK">UK</option>
//                       <option value="Australia">Australia</option>
//                       <option value="Japan">Japan</option>
//                       <option value="China">China</option>
//                       <option value="India">India</option>
//                     </select>
//                   </div>
//                   <div className="input_field">
//                     <label htmlFor="">State</label>

//                     <select name="state" id="State">
//                       <option value="" disabled selected="selected">
//                         Select State
//                       </option>
//                       <option value="NY">New York</option>
//                       <option value="CA">California</option>
//                       <option value="TX">Texas</option>
//                       <option value="FL">Florida</option>
//                       <option value="IL">Illinois</option>
//                       <option value="PA">Pennsylvania</option>
//                       <option value="OH">Ohio</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="input_field">
//                   <label htmlFor="">Address</label>
//                   <input type="text" name="address" />
//                 </div>

//                 <div className="group">
//                   <div className="input_field">
//                     <label htmlFor="">City</label>
//                     <input type="text" name="city" />
//                   </div>

//                   <div className="input_field">
//                     <label htmlFor="">Zip Code</label>
//                     <input type="text" name="zip" />
//                   </div>
//                 </div>
//               </div>

//               <h2 className="section_title">Payment</h2>

//               <div className="section">
//                 <div className="input_field">
//                   <label htmlFor="">Card Number</label>
//                   <div className="card_input">
//                     <input
//                       type="text"
//                       name="card_number"
//                       onChange={(e) => {
//                         let value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
//                         let formattedValue = "";

//                         // Detect card type based on the prefix
//                         if (value.startsWith("34") || value.startsWith("37")) {
//                           // AMEX (15 digits): Format as 4-6-5

//                           setCardType("amex");

//                           formattedValue = value
//                             .replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3")
//                             .trim();
//                         } else if (value.startsWith("4")) {
//                           setCardType("visa");
//                           // Visa (16 digits): Format as 4-4-4-4
//                           formattedValue = value
//                             .replace(/(\d{4})(?=\d)/g, "$1 ")
//                             .trim();
//                         } else if (
//                           /^5[1-5]/.test(value) ||
//                           /^22[2-9]\d|^2[3-7]\d{2}/.test(value)
//                         ) {
//                           setCardType("mastercard");
//                           // Mastercard (16 digits): Format as 4-4-4-4
//                           formattedValue = value
//                             .replace(/(\d{4})(?=\d)/g, "$1 ")
//                             .trim();
//                         } else {
//                           // Default case (treat as 16 digits): Format as 4-4-4-4

//                           setCardType("");
//                           formattedValue = value
//                             .replace(/(\d{4})(?=\d)/g, "$1 ")
//                             .trim();
//                         }

//                         // Limit the input to the card's max length (16 for Visa/Mastercard, 15 for AMEX)
//                         if (value.startsWith("34") || value.startsWith("37")) {
//                           formattedValue = formattedValue.slice(0, 17); // AMEX allows up to 15 digits + spaces (17 chars)
//                         } else {
//                           formattedValue = formattedValue.slice(0, 19); // Visa/Mastercard allows up to 16 digits + spaces (19 chars)
//                         }

//                         // Set the formatted value
//                         e.target.value = formattedValue;
//                       }}
//                     />

//                     <div className="card_icon">
//                       {cardType === "visa" && (
//                         <img src="https://img.icons8.com/color/48/000000/visa.png" />
//                       )}
//                       {cardType === "mastercard" && (
//                         <img src="https://img.icons8.com/color/48/000000/mastercard.png" />
//                       )}
//                       {cardType === "amex" && (
//                         <img src="https://img.icons8.com/color/48/000000/amex.png" />
//                       )}
//                       {cardType === "" && <></>}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="group">
//                   <div className="input_field">
//                     <label htmlFor="">Expiry Date</label>
//                     <input
//                       placeholder="MM/YY"
//                       type="text"
//                       name="expiry_date"
//                       onChange={(e) => {
//                         let value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
//                         let formattedValue = value
//                           .replace(/(\d{2})(?=\d)/g, "$1 / ") // Add a slash after the first two digits
//                           .trim();

//                         // Limit the input to 5 characters
//                         formattedValue = formattedValue.slice(0, 7);

//                         // Set the formatted value
//                         e.target.value = formattedValue;
//                       }}
//                     />
//                   </div>

//                   <div className="input_field">
//                     <label htmlFor="">CVV</label>
//                     <input
//                       type="password"
//                       name="cvv"
//                       onChange={(e) => {
//                         let value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters

//                         if (cardType === "amex") {
//                           // AMEX: 4 digits
//                           value = value.slice(0, 4);
//                         } else {
//                           // Other cards: 3 digits
//                           value = value.slice(0, 3);
//                         }

//                         // Set the formatted value
//                         e.target.value = value;
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </div>
//           <div className="right">
//             <div className="order_items">
//               <h2 className="section_title">Order Summary</h2>

//               <div className="items">
//                 {cartItems.map((item) => (
//                   <div className="item" key={item.id}>
//                     <div className="image">
//                       <img src={item.thumbnail} alt="item" />
//                     </div>
//                     <div className="item_details">
//                       <div className="item_title">{item.title}</div>
//                       <div className="price">
//                         $
//                         {(
//                           item.price -
//                           (item.price * item.discount) / 100
//                         ).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="total">
//                 <div className="title">
//                   <span>Total</span>
//                 </div>

//                 <div className="item">
//                   <span className="label">Subtotal</span>
//                   <span className="value">${calculateTotal()}</span>
//                 </div>

//                 <div className="item">
//                   <span className="label">Taxes & Fees</span>
//                   <span className="value">
//                     ${(calculateTotal() * 0.03).toFixed(2)}
//                   </span>
//                 </div>

//                 <div className="item">
//                   <span className="label">Total</span>
//                   <span className="value">
//                     ${(calculateTotal() * 1.03).toFixed(2)}
//                   </span>
//                 </div>

//                 <div className="total_payable">
//                   <span>Total Payable</span>
//                   <span>${(calculateTotal() * 1.03).toFixed(2)}</span>
//                 </div>
//               </div>

//               <div className="coupon">
//                 <h3 className="section_title">Apply Code</h3>
//                 <div className="input_field">
//                   <input type="text" name="coupon" />
//                   <button className="apply_btn">Apply</button>
//                 </div>
//               </div>

//               <button className="pay_with_crypto" onClick={payWithCrypto}>
//                 Pay with Crypto
//               </button>

//               <CheckoutForm
//                 amount={(calculateTotal() * 1.03).toFixed(2) * 100}
//                 prefill_name={currentUser ? currentUser.displayName : ""}
//                 prefill_email={currentUser ? currentUser.email : ""}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;

import { useState, useEffect, useCallback, createRef } from "react";
import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import PropTypes from "prop-types";

// Load Stripe.js
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PKEY,
  //  { stripeAccount: '' } 
);

const Checkout = () => {
  const { currentUser } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    region: "",
    state: "",
    address: "",
    city: "",
    zip: "",
  });
  // const [cardType, setCardType] = useState("");
  const [loading, setLoading] = useState(false);

  // Load cart items from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Calculate total price
  const calculateTotal = useCallback(() => {
    return cartItems
      .reduce((total, item) => total + (item.price - (item.price * item.discount) / 100), 0)
      .toFixed(2);
  }, [cartItems]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle card number input for card type detection
  // const handleCardNumberChange = (e) => {
  //   const value = e.target.value.replace(/\D/g, "");
  //   let type = "";

  //   if (/^4/.test(value)) {
  //     type = "visa";
  //   } else if (/^5[1-5]/.test(value)) {
  //     type = "mastercard";
  //   } else if (/^3[47]/.test(value)) {
  //     type = "amex";
  //   }

  //   setCardType(type);
  //   e.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim(); // Format card number
  // };

  // Handle payment with Stripe
  const handleStripePayment = async (stripe, elements) => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error("Stripe error:", error);
      alert(`Payment failed: ${error.message}`);
      setLoading(false);
      return;
    }

    // Send paymentMethod.id to your backend for payment processing
    try {
      const response = await fetch("/your-backend-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: (calculateTotal() * 1.03).toFixed(2) * 100, // Convert to cents
          currency: "usd",
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update Firebase with purchased items
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userOwnedItems = userDoc.data().ownedItems || [];
          const updatedOwnedItems = [...userOwnedItems, ...cartItems];

          await updateDoc(userRef, { ownedItems: updatedOwnedItems });
        }

        // Clear cart
        localStorage.removeItem("cart");
        setCartItems([]);
        alert("Payment successful!");
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle payment with Crypto
  const payWithCrypto = async () => {
    if (!window.ethereum) {
      alert("No Ethereum wallet detected. Please install an Ethereum wallet to proceed.");
      return;
    }

    setLoading(true);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Fetch real-time ETH to INR rate (replace with actual API call)
      const ethToInrRate = 120000; // Example: 1 ETH = 1,20,000 INR

      // Calculate total in INR and convert to ETH
      const totalInInr = (calculateTotal() * 1.03).toFixed(2);
      const totalInEth = (totalInInr / ethToInrRate).toFixed(6);

      // Send Ethereum transaction
      const tx = await signer.sendTransaction({
        to: "0x3349CfAcd34b41D2Db7Cc88B9038aD0c5f9D6888", // Recipient address
        value: ethers.parseEther(totalInEth.toString()),
        gasLimit: 21000,
      });

      await tx.wait();

      // Update Firebase with purchased items
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userOwnedItems = userDoc.data().ownedItems || [];
        const updatedOwnedItems = [...userOwnedItems, ...cartItems];

        await updateDoc(userRef, { ownedItems: updatedOwnedItems });
      }

      // Clear cart
      localStorage.removeItem("cart");
      setCartItems([]);
      alert("Payment successful!");
    } catch (error) {
      console.error("Crypto payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stripeFormRef = createRef()


  return (
    <div className="page_content">
      <div className="checkout_main">
        <div className="title">
          <h1>Checkout</h1>
        </div>

        <div className="container">
          <div className="left">
            <form ref={stripeFormRef}  >
              <h2 className="section_title">Personal Details</h2>
              <div className="section">
                <div className="group">
                  <div className="input_field">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input_field">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input_field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <h2 className="section_title">Billing Address</h2>
              <div className="section">
                <div className="group">
                  <div className="input_field">
                    <label htmlFor="region">Region</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Country
                      </option>
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">UK</option>
                      <option value="Australia">Australia</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                  <div className="input_field">
                    <label htmlFor="state">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select State
                      </option>
                      <option value="NY">New York</option>
                      <option value="CA">California</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      <option value="IL">Illinois</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="OH">Ohio</option>
                    </select>
                  </div>
                </div>
                <div className="input_field">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="group">
                  <div className="input_field">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input_field">
                    <label htmlFor="zip">Zip Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <h2 className="section_title">Payment</h2>
              <div className="section">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    amount={(calculateTotal() * 1.03).toFixed(2) * 100}
                    handleStripePayment={handleStripePayment}
                    loading={loading}
                  />
                </Elements>
              </div>
            </form>
          </div>

          {/* <div className="right">
            <div className="order_items">
              <h2 className="section_title">Order Summary</h2>
              <div className="items">
                {cartItems.map((item) => (
                  <div className="item" key={item.id}>
                    <div className="image">
                      <img src={item.thumbnail} alt={item.title} />
                    </div>
                    <div className="item_details">
                      <div className="item_title">{item.title}</div>
                      <div className="price">
                        ${(item.price - (item.price * item.discount) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total">
                <div className="item">
                  <span className="label">Subtotal</span>
                  <span className="value">${calculateTotal()}</span>
                </div>
                <div className="item">
                  <span className="label">Taxes & Fees</span>
                  <span className="value">${(calculateTotal() * 0.03).toFixed(2)}</span>
                </div>
                <div className="item">
                  <span className="label">Total</span>
                  <span className="value">${(calculateTotal() * 1.03).toFixed(2)}</span>
                </div>
              </div>

              <button className="pay_with_crypto" onClick={payWithCrypto} disabled={loading}>
                {loading ? "Processing..." : "Pay with Crypto"}
              </button>
            </div>
          </div> */}
          <div className="right">
            <div className="order_items">
              <h2 className="section_title">Order Summary</h2>

              <div className="items">
                {cartItems.map((item) => (
                  <div className="item" key={item.id}>
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
                  </div>
                ))}
              </div>

              <div className="total">
                <div className="title">
                  <span>Total</span>
                </div>

                <div className="item">
                  <span className="label">Subtotal</span>
                  <span className="value">${calculateTotal()}</span>
                </div>

                <div className="item">
                  <span className="label">Taxes & Fees</span>
                  <span className="value">
                    ${(calculateTotal() * 0.03).toFixed(2)}
                  </span>
                </div>

                <div className="item">
                  <span className="label">Total</span>
                  <span className="value">
                    ${(calculateTotal() * 1.03).toFixed(2)}
                  </span>
                </div>

                <div className="total_payable">
                  <span>Total Payable</span>
                  <span>${(calculateTotal() * 1.03).toFixed(2)}</span>
                </div>
              </div>

              <div className="coupon">
                <h3 className="section_title">Apply Code</h3>
                <div className="input_field">
                  <input type="text" name="coupon" />
                  <button className="apply_btn">Apply</button>
                </div>
              </div>

              <button className="pay_with_crypto" onClick={payWithCrypto}>
                Pay with Crypto
              </button>

              {/* <CheckoutForm
                amount={(calculateTotal() * 1.03).toFixed(2) * 100}
                prefill_name={currentUser ? currentUser.displayName : ""}
                prefill_email={currentUser ? currentUser.email : ""}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stripe Payment Form Component
const StripePaymentForm = ({ amount, handleStripePayment, loading }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleStripePayment(stripe, elements);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input_field" style={{display: 'block'}}>
        <label htmlFor="card">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
       type="submit" 
       disabled={!stripe || loading}
       style={{
                  padding: "1rem",
                  width: "100%",
                  backgroundColor: "#078CC8",
                  color: "#fff",
                  border: "none",
                  borderRadius: ".5rem",
                  cursor: "pointer",
                  fontSize: "16px",
                  marginTop: "5px",
                  fontWeight: "600",
                }}
       >
        {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
};

StripePaymentForm.propTypes = {
  amount: PropTypes.func.isRequired,
  handleStripePayment: PropTypes.func.isRequired,
  loading: PropTypes.func.isRequired,
};

export default Checkout;
