import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  ChevronDown,
  HelpCircle,
  Package,
  Store,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  User,
  Phone,
  Mail,
  LifeBuoy,
  FileQuestion,
} from "lucide-react";
import "./helpCenter.css";

export default function HelpCenter({ user }) {
  const { t } = useTranslation(["support", "translation"]);
  const navigate = useNavigate();

  // Helper function to query the dedicated support namespace
  const s = (key, fallback) => t(key, { ns: "support", defaultValue: fallback });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(null);

  // Help Categories
  const categories = [
    {
      id: "renting",
      icon: Package,
      title: s("categories.renting.title", "Renting Items"),
      desc: s(
        "categories.renting.desc",
        "Finding items, sending rental requests, delivery & pickup.",
      ),
    },
    {
      id: "listing",
      icon: Store,
      title: s("categories.listing.title", "Listing & Business Hub"),
      desc: s(
        "categories.listing.desc",
        "How to list your items, manage shop inventory, pricing & earnings.",
      ),
    },
    {
      id: "trust",
      icon: ShieldCheck,
      title: s("categories.trust.title", "Trust Score & Safety"),
      desc: s(
        "categories.trust.desc",
        "How Trust Score works, unlocking rental limits, verification & reviews.",
      ),
    },
    {
      id: "payments",
      icon: CreditCard,
      title: s("categories.payments.title", "Payments & Cash Points"),
      desc: s(
        "categories.payments.desc",
        "Using Cash Points, card checkout, cash on pickup & security deposits.",
      ),
    },
    {
      id: "returns",
      icon: RotateCcw,
      title: s("categories.returns.title", "Returns & Verification"),
      desc: s(
        "categories.returns.desc",
        "Ending rentals, condition inspections, return acceptance & dispute handling.",
      ),
    },
    {
      id: "account",
      icon: User,
      title: s("categories.account.title", "Account & Settings"),
      desc: s(
        "categories.account.desc",
        "Profile management, notification preferences, password reset & security.",
      ),
    },
  ];

  // Comprehensive FAQ list
  const faqs = [
    {
      id: 1,
      category: "renting",
      question: s(
        "faqs.faq1.question",
        "How do I rent an item on RentHub?",
      ),
      answer: s(
        "faqs.faq1.answer",
        "Browse items from the Home page or Search bar. Select the item you need, choose your desired rental start and end dates and quantity, and click 'Rent Now'. Alternatively, you can add multiple items to your Rent Cart and request them together. Once the owner approves your request, you can arrange pickup or delivery.",
      ),
    },
    {
      id: 2,
      category: "renting",
      question: s(
        "faqs.faq2.question",
        "What is the Multi-Cart feature and how do I use it?",
      ),
      answer: s(
        "faqs.faq2.answer",
        "RentHub allows you to organize items into multiple named carts (e.g. 'Wedding Shoot', 'Weekend Trip', 'Tools'). On any item page, click the dropdown arrow next to the 'Add to Rent Cart' button to select which cart to add the item into, or create a new cart right away. In your Rent Cart tab, you can easily switch between your carts and request items per project.",
      ),
    },
    {
      id: 3,
      category: "trust",
      question: s(
        "faqs.faq3.question",
        "What is Trust Score and how does it determine my rental limit?",
      ),
      answer: s(
        "faqs.faq3.answer",
        "RentHub uses an intelligent Trust Score system (0 to 100) to protect the community. Every new member starts with a base Trust Score (50) and a base rental limit (e.g. LKR 10,000). Every time you safely rent, pay on time, and return items in good condition, your Trust Score increases and your rental limit expands to unlock high-value items.",
      ),
    },
    {
      id: 4,
      category: "listing",
      question: s(
        "faqs.faq4.question",
        "How can I list my own items to earn rental income?",
      ),
      answer: s(
        "faqs.faq4.answer",
        "Click '+ Add Item' in the navigation bar or visit your Business Hub. Fill in your item's title, category, high-quality photos, daily or monthly rental rate, and nearest city. Once submitted, your listing is immediately discoverable by nearby renters across Sri Lanka.",
      ),
    },
    {
      id: 5,
      category: "payments",
      question: s(
        "faqs.faq5.question",
        "What payment options are available on RentHub?",
      ),
      answer: s(
        "faqs.faq5.answer",
        "RentHub supports three convenient payment methods: 1) Cash Points (in-app wallet points for instant zero-fee checkout), 2) Debit/Credit Cards (Visa, MasterCard via secure gateway), and 3) Cash on Pickup directly to the owner upon handover.",
      ),
    },
    {
      id: 6,
      category: "payments",
      question: s(
        "faqs.faq6.question",
        "How do I top up my Cash Points wallet?",
      ),
      answer: s(
        "faqs.faq6.answer",
        "Navigate to your Profile or click on your Cash Points balance. Click 'Top Up Points', select a package or enter an amount (1 Point = 1 LKR), and pay securely using your card. Your wallet balance updates instantly.",
      ),
    },
    {
      id: 7,
      category: "returns",
      question: s(
        "faqs.faq7.question",
        "How does the rental return and acceptance process work?",
      ),
      answer: s(
        "faqs.faq7.answer",
        "When your rental period ends, return the item to the owner in the agreed condition. The owner clicks 'Accept Return' in their Inventory/Requests tab, confirms item condition, and both parties leave reviews to finalize the transaction. Safe returns automatically boost your Trust Score!",
      ),
    },
    {
      id: 8,
      category: "returns",
      question: s(
        "faqs.faq8.question",
        "What happens if an item is damaged or returned late?",
      ),
      answer: s(
        "faqs.faq8.answer",
        "If an item is damaged or late, the owner can flag an issue during return inspection or contact RentHub Support. Late returns incur standard daily rental fees, and failure to return items damages the renter's Trust Score and may lead to account suspension.",
      ),
    },
    {
      id: 9,
      category: "account",
      question: s(
        "faqs.faq9.question",
        "How do I update my profile, address, or map location?",
      ),
      answer: s(
        "faqs.faq9.answer",
        "Go to your Profile and click 'Edit Profile'. Here you can update your profile photo, phone number, bio, nearest city, and pin your exact location on Google Maps so buyers and renters can accurately calculate distance to your shop.",
      ),
    },
    {
      id: 10,
      category: "renting",
      question: s(
        "faqs.faq10.question",
        "Can I message the owner before requesting an item?",
      ),
      answer: s(
        "faqs.faq10.answer",
        "Yes! On any item details page, click the message button next to 'Add to Rent Cart' to start a direct in-app chat with the owner to inquire about availability, specifications, or pickup arrangements.",
      ),
    },
  ];

  // Filter FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="help-center-page">
      {/* Breadcrumb */}
      <div className="help-breadcrumb">
        <Link to="/">{s("breadcrumb", "Home")}</Link>
        <span>/</span>
        <span className="current">{s("title", "Help Center")}</span>
      </div>

      {/* Hero Section */}
      <section className="help-hero-section">
        <div className="help-hero-badge">
          <LifeBuoy size={14} />
          <span>{s("supportPortal", "RentHub Support Portal")}</span>
        </div>
        <h1 className="help-hero-title">
          {s("heroHeading", "How can we help you today?")}
        </h1>
        <p className="help-hero-subtitle">
          {s(
            "heroSubheading",
            "Find quick answers, learn how RentHub works, explore rental guides, or get in touch with our 24/7 customer support team.",
          )}
        </p>

        {/* Real-time Search Box */}
        <div className="help-search-box-wrapper">
          <Search size={19} className="help-search-icon" />
          <input
            type="text"
            className="help-search-input"
            placeholder={s(
              "searchPlaceholder",
              "Search help topics, questions, policies...",
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="help-search-clear-btn"
              onClick={() => setSearchQuery("")}
              title={s("clearSearch", "Clear search")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Browse by Categories */}
      <section className="help-categories-section">
        <div className="help-section-heading">
          <h3>{s("browseCategories", "Browse by Topics")}</h3>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--primary)",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {s("viewAllTopics", "View All Topics")}
            </button>
          )}
        </div>

        <div className="help-categories-grid">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`help-category-card ${isActive ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(isActive ? "all" : cat.id);
                  setSearchQuery("");
                }}
              >
                <div className="help-category-icon-wrap">
                  <Icon size={22} />
                </div>
                <h4 className="help-category-title">{cat.title}</h4>
                <p className="help-category-desc">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="help-faq-container">
        <div className="help-section-heading">
          <h3>
            {s("faqTitle", "Frequently Asked Questions")}
            {searchQuery && ` (${s("resultsFor", "Results for")} "${searchQuery}")`}
          </h3>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {filteredFaqs.length}{" "}
            {filteredFaqs.length === 1
              ? s("article", "article")
              : s("articles", "articles")}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="help-faq-filter-tabs">
          <button
            type="button"
            className={`help-faq-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            {s("allQuestions", "All Questions")}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`help-faq-filter-btn ${selectedCategory === c.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.title}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="help-faq-empty">
            <FileQuestion size={40} color="var(--text-muted)" />
            <h4>{s("noMatchingQuestions", "No matching questions found")}</h4>
            <p>
              {s(
                "tryDifferentKeywords",
                "Try searching with different keywords, or message our support team directly below!",
              )}
            </p>
            <button
              type="button"
              className="help-faq-filter-btn active"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              style={{ marginTop: "12px" }}
            >
              {s("resetFilters", "Reset Filters")}
            </button>
          </div>
        ) : (
          <div className="help-faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`help-faq-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="help-faq-question"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={18} className="help-faq-chevron" />
                  </button>
                  {isOpen && (
                    <div className="help-faq-answer">
                      <p style={{ margin: 0 }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Contact & Support Section */}
      <section className="help-contact-section">
        <div className="help-contact-header">
          <h3>{s("stillNeedHelp", "Still need assistance?")}</h3>
          <p>
            {s(
              "contactSubtitle",
              "Our Sri Lankan customer support team is available every day to assist you.",
            )}
          </p>
        </div>

        <div className="help-contact-grid">
          {/* Phone Hotline */}
          <a href="tel:+94772048701" className="help-contact-card">
            <div className="help-contact-icon">
              <Phone size={20} />
            </div>
            <div className="help-contact-info">
              <h4>{s("hotlineTitle", "Customer Support Hotline")}</h4>
              <p>{s("hotlinePhone", "+94 772 048 701")}</p>
              <span className="help-contact-action">{s("hotlineHours", "Call 8 AM - 10 PM →")}</span>
            </div>
          </a>

          {/* Email Support */}
          <a href="mailto:support@renthub.lk" className="help-contact-card">
            <div className="help-contact-icon">
              <Mail size={20} />
            </div>
            <div className="help-contact-info">
              <h4>{s("emailTitle", "Email Support")}</h4>
              <p>{s("emailAddress", "support@renthub.lk")}</p>
              <span className="help-contact-action">{s("emailAction", "Send an Email →")}</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
