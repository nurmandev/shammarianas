import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db } from "../../firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  collection,
  addDoc
} from "firebase/firestore";
import { useUser } from "../Context/UserProvider";
import PropTypes from "prop-types";

// Load Stripe.js
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PKEY);

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
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ethRate, setEthRate] = useState(null);

  // Load cart items from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart items:", e);
        setCartItems([]);
      }
    }
  }, []);

  // Fetch ETH exchange rate
  useEffect(() => {
    const fetchEthRate = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await response.json();
        setEthRate(data.ethereum.usd);
      } catch (error) {
        console.error("Failed to fetch ETH rate:", error);
        setEthRate(3500); // Fallback rate
      }
    };

    fetchEthRate();
  }, []);

  // Calculate total price
  const calculateTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + (item.price - (item.price * (item.discount || 0)) / 100),
      0
    );
  }, [cartItems]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validate form data
  const validateForm = () => {
    const requiredFields = [
      "firstName", 
      "lastName", 
      "email", 
      "region", 
      "state", 
      "address", 
      "city", 
      "zip"
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setPaymentError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setPaymentError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  // Handle payment with Stripe
  const handleStripePayment = async (stripe, elements) => {
    if (!stripe || !elements || !currentUser || !validateForm()) {
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zip,
            country: formData.region,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create payment intent on backend
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: Math.round(calculateTotal() * 1.03 * 100), // In cents
          currency: "usd",
          items: cartItems.map(item => item.id)
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Payment failed");
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        result.clientSecret
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Record purchase
      await recordPurchase();
      setPaymentSuccess(true);
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Record purchase in Firestore
  const recordPurchase = async () => {
    if (!currentUser) return;

    try {
      const purchaseData = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          discount: item.discount,
          purchasedAt: new Date()
        })),
        total: calculateTotal() * 1.03,
        purchasedAt: new Date(),
        billingDetails: formData
      };

      // Add to user's purchase history
      const userRef = doc(db, "Profiles", currentUser.uid);
      await updateDoc(userRef, {
        purchases: arrayUnion(purchaseData)
      });

      // Record transaction
      await addDoc(collection(db, "Transactions"), {
        ...purchaseData,
        userId: currentUser.uid,
        status: "completed"
      });

      // Clear cart
      localStorage.removeItem("cart");
      setCartItems([]);
    } catch (error) {
      console.error("Error recording purchase:", error);
    }
  };

  // Handle payment with Crypto
  const payWithCrypto = async () => {
    if (!window.ethereum || !ethRate || !currentUser || !validateForm()) {
      setPaymentError("Crypto payment unavailable");
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const senderAddress = await signer.getAddress();

      // Calculate total in ETH
      const totalInUSD = calculateTotal() * 1.03;
      const totalInEth = totalInUSD / ethRate;

      // Send transaction
      const tx = await signer.sendTransaction({
        to: import.meta.env.VITE_CRYPTO_RECIPIENT,
        value: ethers.parseEther(totalInEth.toString())
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        throw new Error("Transaction failed");
      }

      // Record purchase
      await recordPurchase();
      setPaymentSuccess(true);
    } catch (error) {
      console.error("Crypto payment failed:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="page_content">
        <div className="checkout_main">
          <div className="title">
            <h1>Payment Successful!</h1>
          </div>
          <div className="success_message">
            <p>Thank you for your purchase.</p>
            <p>Your assets have been added to your library.</p>
            <Link to="/library" className="btn_primary">
              View Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page_content">
      <div className="checkout_main">
        <div className="title">
          <h1>Checkout</h1>
        </div>

        {paymentError && (
          <div className="payment_error">
            {paymentError}
          </div>
        )}

        <div className="container">
          <div className="left">
            <form>
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
                      disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
                    >
                      <option value="" disabled>Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="JP">Japan</option>
                      <option value="CN">China</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                  <div className="input_field">
                    <label htmlFor="state">State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="" disabled>Select State</option>
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
                    disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <h2 className="section_title">Payment</h2>
              <div className="section">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    amount={Math.round(calculateTotal() * 1.03 * 100)}
                    handleStripePayment={handleStripePayment}
                    loading={loading}
                  />
                </Elements>
              </div>
            </form>
          </div>

          <div className="right">
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
                        $
                        {(
                          item.price -
                          (item.price * (item.discount || 0)) / 100
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
                  <span className="value">${calculateTotal().toFixed(2)}</span>
                </div>

                <div className="item">
                  <span className="label">Taxes & Fees (3%)</span>
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

              <button 
                className="pay_with_crypto" 
                onClick={payWithCrypto}
                disabled={loading || !ethRate}
              >
                {loading ? "Processing..." : `Pay with Crypto (${ethRate ? '1 ETH = $' + ethRate.toFixed(2) : 'Loading...'})`}
              </button>
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
      <div className="input_field" style={{ display: 'block' }}>
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
            hidePostalCode: true
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          padding: "1rem",
          width: "100%",
          backgroundColor: loading ? "#ccc" : "#078CC8",
          color: "#fff",
          border: "none",
          borderRadius: ".5rem",
          cursor: loading ? "not-allowed" : "pointer",
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
  amount: PropTypes.number.isRequired,
  handleStripePayment: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Checkout;