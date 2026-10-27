/**
 * PaystackButton — reusable Paystack inline payment trigger.
 *
 * The Paystack SDK (inline.js) is loaded globally in index.html,
 * so window.PaystackPop is always available by the time this component mounts.
 *
 * Props:
 *   email      {string}   – payer's email address (required by Paystack)
 *   amountKobo {number}   – amount in KOBO (₦1 = 100 kobo, so ₦5,000 = 500000)
 *   reference  {string}   – unique transaction reference
 *   metadata   {object}   – optional extra data sent to Paystack dashboard
 *   label      {string}   – button label text
 *   disabled   {boolean}  – disables the button
 *   className  {string}   – CSS class (default "btn")
 *   style      {object}   – inline styles to merge
 *   onSuccess  {function} – called with Paystack response on successful payment
 *   onClose    {function} – called when popup is closed without paying
 */
export default function PaystackButton({
  email,
  amountKobo,
  reference,
  metadata = {},
  label = "Pay with Paystack",
  disabled = false,
  className = "btn",
  style = {},
  onSuccess = () => {},
  onClose = () => {},
}) {
  const handlePay = () => {
    // Guard: check PaystackPop is available
    if (!window.PaystackPop) {
      alert("Paystack payment system is still loading. Please wait a moment and try again.");
      return;
    }

    if (!email || !email.includes("@")) {
      alert("A valid email address is required to process your payment.");
      return;
    }

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      console.error("VITE_PAYSTACK_PUBLIC_KEY is not set in .env");
      alert("Payment configuration error. Please contact the school administrator.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key,
      email,
      amount: Math.round(amountKobo),   // must be integer kobo
      currency: "NGN",
      ref: reference || `RA-${Date.now()}`,
      metadata,
      callback(response) {
        onSuccess(response);
      },
      onClose() {
        onClose();
      },
    });

    handler.openIframe();
  };

  return (
    <button
      type="button"
      id={`paystack-btn-${reference || "default"}`}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      disabled={disabled}
      onClick={handlePay}
    >
      {/* Paystack stripe mark */}
      <svg
        width="18"
        height="12"
        viewBox="0 0 60 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <rect y="0" width="60" height="12" rx="4" fill="currentColor" fillOpacity="0.9" />
        <rect y="18" width="60" height="12" rx="4" fill="currentColor" fillOpacity="0.6" />
        <rect y="28" width="40" height="12" rx="4" fill="currentColor" fillOpacity="0.35" />
      </svg>
      {label}
    </button>
  );
}
