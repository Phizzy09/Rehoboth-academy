/**
 * PaystackButton — reusable Paystack inline payment trigger.
 *
 * Props:
 *   email      {string}   – payer's email address
 *   amountKobo {number}   – amount in kobo (₦1 = 100 kobo)
 *   reference  {string}   – unique transaction reference
 *   metadata   {object}   – optional extra data passed to Paystack
 *   label      {string}   – button label text (default "Pay with Paystack")
 *   disabled   {boolean}  – disables the button
 *   className  {string}   – extra CSS class names
 *   style      {object}   – inline styles to merge
 *   onSuccess  {function} – called with (response) on successful payment
 *   onClose    {function} – called when the popup is dismissed without paying
 */
import { useEffect, useRef, useState } from "react";

const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

function ensureScript(cb) {
  if (window.PaystackPop) { cb(); return; }
  const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`);
  if (existing) {
    existing.addEventListener("load", cb);
    return;
  }
  const s = document.createElement("script");
  s.src = PAYSTACK_SCRIPT_SRC;
  s.async = true;
  s.onload = cb;
  document.head.appendChild(s);
}

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
  const [scriptReady, setScriptReady] = useState(!!window.PaystackPop);

  useEffect(() => {
    if (!scriptReady) {
      ensureScript(() => setScriptReady(true));
    }
  }, []);

  const handlePay = () => {
    if (!scriptReady) return;
    if (!email) { alert("Email address is required for Paystack payment."); return; }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amountKobo), // must be integer kobo
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

  const isDisabled = disabled || !scriptReady;

  return (
    <button
      type="button"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style,
      }}
      disabled={isDisabled}
      onClick={handlePay}
      title={isDisabled && !disabled ? "Loading payment system…" : undefined}
    >
      {/* Paystack logo mark */}
      <svg width="18" height="18" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="36" height="36" rx="8" fill="currentColor" fillOpacity="0.12"/>
        <path d="M7 14h22v3H7zM7 19h22v3H7z" fill="currentColor"/>
      </svg>
      {!scriptReady ? "Loading…" : label}
    </button>
  );
}
