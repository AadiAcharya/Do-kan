import React, { useState } from "react";

const faqs = [
  {
    category: "Orders",
    items: [
      {
        q: "How do I track my order?",
        a: "Once your order is confirmed, you'll receive an order ID. Go to My Orders from your account menu to see real-time status updates including processing, shipped, and delivered.",
      },
      {
        q: "Can I cancel or change my order after placing it?",
        a: "You can cancel an order before it's marked as shipped. Go to My Orders, select the order, and choose Cancel Order. Once shipped, cancellations aren't possible — you can request a return instead.",
      },
      {
        q: "What if an item in my order is out of stock?",
        a: "If an item becomes unavailable after you order, our team will notify you and refund that item's amount to your original payment method or wallet.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "DOKAN supports Cash on Delivery, eSewa, and Khalti. You can choose your preferred method at checkout.",
      },
      {
        q: "Is it safe to pay online through DOKAN?",
        a: "Yes. All online payments are processed through secure, encrypted gateways (eSewa and Khalti). DOKAN does not store your card or wallet credentials.",
      },
      {
        q: "I was charged but my order shows as failed. What do I do?",
        a: "This can happen due to a network delay during payment confirmation. If the amount was deducted but the order wasn't placed, it will be automatically refunded within 3-5 business days. Contact support if it takes longer.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Most orders within the Kathmandu Valley are delivered within 2-4 business days. Orders to other regions may take 4-7 business days depending on location.",
      },
      {
        q: "How much is the delivery charge?",
        a: "A flat delivery fee of Rs. 99 is applied per order, shown clearly in your cart and order summary before checkout.",
      },
      {
        q: "Do you deliver outside Kathmandu Valley?",
        a: "Yes, DOKAN delivers nationwide through our logistics partners. Delivery times may vary for remote areas.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is DOKAN's return policy?",
        a: "Most items can be returned within 7 days of delivery if unused and in original packaging. Some categories like innerwear, perishables, and personal care items are not eligible for return.",
      },
      {
        q: "How do I request a return?",
        a: "Go to My Orders, select the item, and choose Request Return. Our team will arrange a pickup once the request is approved.",
      },
      {
        q: "When will I get my refund?",
        a: "Refunds are processed within 5-7 business days after the returned item passes quality inspection. The amount is credited to your original payment method or DOKAN wallet.",
      },
    ],
  },
  {
    category: "Account & Vendor",
    items: [
      {
        q: "How do I become a vendor on DOKAN?",
        a: "Click Become a Seller from the homepage, fill in your store details, and submit your KYC documents and bank details. Our admin team reviews applications within 2-3 business days.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page, click Forgot Password and follow the instructions sent to your registered email or phone number.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 text-sm transition-transform ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-8">{a}</p>
      )}
    </div>
  );
}

export default function HelpSupportPage() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  const visibleFaqs = search
    ? filteredFaqs
    : faqs.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-2">Help &amp; Support</h1>
          <p className="text-gray-300 text-sm mb-6">
            Find answers to common questions or get in touch with our team.
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help (e.g. refund, delivery, payment)"
              className="w-full px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category sidebar */}
          {!search && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                {faqs.map((section) => (
                  <button
                    key={section.category}
                    onClick={() => setActiveCategory(section.category)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                      activeCategory === section.category
                        ? "bg-primary-500 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {section.category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAQ content */}
          <div className={search ? "lg:col-span-4" : "lg:col-span-3"}>
            {visibleFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-medium">No results for &ldquo;{search}&rdquo;</p>
                <p className="text-sm mt-1">
                  Try a different keyword or contact our support team below.
                </p>
              </div>
            ) : (
              visibleFaqs.map((section) => (
                <div
                  key={section.category}
                  className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
                >
                  <h2 className="font-semibold text-gray-900 mb-2">
                    {section.category}
                  </h2>
                  <div>
                    {section.items.map((item) => (
                      <FaqItem key={item.q} q={item.q} a={item.a} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact section */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-4">
              Chat with our support team for quick help with orders and
              payments.
            </p>
            <button className="text-sm font-medium text-primary-500 hover:underline">
              Start chat →
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-2xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send us your query and we&apos;ll respond within 24 hours.
            </p>
            
              <a href="mailto:support@dokan.com"
              className="text-sm font-medium text-primary-500 hover:underline"
            >
              support@dokan.com
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-2xl mb-3">📞</div>
            <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-500 mb-4">
              Available Sunday-Friday, 9 AM - 6 PM.
            </p>
            
             <a href="tel:+9771234567"
              className="text-sm font-medium text-primary-500 hover:underline"
            >
              +977-1-234567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}