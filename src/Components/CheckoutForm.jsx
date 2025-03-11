// import React, { useState } from "react";
// import { functions } from "../../firebase";

// const CheckoutForm = () => {
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   const handlePayment = async (props) => {
//     try {
//       const createOrder = functions.httpsCallable("createOrder");
//       const order = await createOrder({ amount: props.amount * 100 }); // Amount in paise (e.g., 1000 paise = 10 INR)

//       const options = {
//         key: "rzp_test_8rxVwtVKs8PKsY",
//         amount: order.data.amount,
//         currency: order.data.currency,
//         name: "Your Company Name",
//         description: "Test Transaction",
//         order_id: order.data.id,
//         handler: function (response) {
//           setSuccess(true);
//         },
//         prefill: {
//           name: props.prefill_name,
//           email: props.prefill_email,
//           contact: "9999999999",
//         },
//         notes: {
//           address: "Your Address",
//         },
//         theme: {
//           color: "#F37254",
//         },
//       };

//       const rzp1 = new window.Razorpay(options);
//       rzp1.open();
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handlePayment}
//         style={{
//           padding: "1rem",
//           width: "100%",
//           backgroundColor: "#078CC8",
//           color: "#fff",
//           border: "none",
//           borderRadius: ".5rem",
//           cursor: "pointer",
//           fontSize: "16px",
//           marginTop: "5px",
//           fontWeight: "600",  
//         }}
//       >
//         Pay Now
//       </button>
//       {error && <div>{error}</div>}
//       {success && <div>Payment Successful!</div>}
//     </div>
//   );
// };

// export default CheckoutForm;



import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions"; // Correct import

// Load your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PKEY); // This is correct for frontend

const StripeCheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get functions instance and create callable
      const functions = getFunctions();
      const createOrder = httpsCallable(functions, "createOrder");
      
      // Call the createOrder function
      const result = await createOrder({ amount: Math.round(props?.amount * 100) }); // Amount in cents, ensure it's an integer
      
      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        result.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: props?.prefill_name || '',
              email: props?.prefill_email || '',
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        setSuccess(true);
        // You might want to trigger a callback here
        if (props.onSuccess) props.onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
      <button
        onClick={handlePayment}
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
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: "10px" }}>Payment Successful!</div>}
    </div>
  );
};

const CheckoutForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default CheckoutForm;
