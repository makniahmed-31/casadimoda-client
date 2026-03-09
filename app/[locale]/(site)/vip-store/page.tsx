"use client";

import { useState } from "react";
import { Crown, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function VipStorePage() {
  const t = useTranslations("vip");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderType: "existing",
    productName: "",
    quantity: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        orderType: "existing",
        productName: "",
        quantity: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent via-accent/90 to-primary  p-8 md:p-12 mb-12 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white  flex items-center justify-center flex-shrink-0">
            <Crown size={32} className="text-accent" />
          </div>
          <div className="flex-grow">
            <h2 className="text-white/80 font-bold uppercase tracking-[0.3em] text-xs mb-3">
              {t("exclusiveExperience")}
            </h2>
            <h1 className="text-3xl md:text-4xl md:text-5xl font-black tracking-tight mb-6">
              {t("title")}
            </h1>
            <p className="text-white/90 max-w-2xl text-sm leading-relaxed mb-6">
              {t("welcome")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm  p-4 border border-white/20">
                <p className="text-white/80 font-black text-xs uppercase tracking-widest mb-2">
                  {t("personalConcierge")}
                </p>
                <p className="text-lg font-black">{t("support247")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm  p-4 border border-white/20">
                <p className="text-white/80 font-black text-xs uppercase tracking-widest mb-2">
                  {t("customOrders")}
                </p>
                <p className="text-lg font-black">{t("tailoredForYou")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm  p-4 border border-white/20">
                <p className="text-white/80 font-black text-xs uppercase tracking-widest mb-2">
                  {t("priorityService")}
                </p>
                <p className="text-lg font-black">{t("expressHandling")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white  p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-primary mb-6">
            {t("contactTeam")}
          </h2>

          {submitStatus === "success" && (
            <div className="mb-6 bg-green-50 border border-green-200  p-4">
              <p className="text-green-800 font-bold text-sm">
                {t("thankYou")}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("fullName")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder={t("fullNamePlaceholder")}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder={t("emailPlaceholder")}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("phone")}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder={t("phonePlaceholder")}
              />
            </div>

            {/* Order Type */}
            <div>
              <label
                htmlFor="orderType"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("orderType")}
              </label>
              <select
                id="orderType"
                name="orderType"
                required
                value={formData.orderType}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
              >
                <option value="existing">{t("existingProduct")}</option>
                <option value="custom">{t("customOrder")}</option>
                <option value="inquiry">{t("generalInquiry")}</option>
                <option value="support">{t("customerSupport")}</option>
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label
                htmlFor="productName"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("productName")}
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder={t("productNamePlaceholder")}
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("quantity")}
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="1"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-xs font-black uppercase tracking-widest text-text-dark/70 mb-2"
              >
                {t("message")}
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3  border border-gray-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-white px-8 py-4  font-black uppercase text-xs tracking-[0.2em] hover:bg-primary transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                t("sending")
              ) : (
                <>
                  <Send size={16} />
                  {t("submitRequest")}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Why Choose VIP */}
          <div className="bg-primary  p-8 text-white">
            <h3 className="text-xl font-black mb-6">{t("whyChooseVIP")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent  flex items-center justify-center flex-shrink-0 mt-1">
                  <Crown size={16} />
                </div>
                <div>
                  <p className="font-bold mb-1">{t("priorityAccess")}</p>
                  <p className="text-sm text-white/80">
                    {t("priorityAccessDesc")}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent  flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="font-bold mb-1">{t("personalConsultation")}</p>
                  <p className="text-sm text-white/80">
                    {t("personalConsultationDesc")}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent  flex items-center justify-center flex-shrink-0 mt-1">
                  <Send size={16} />
                </div>
                <div>
                  <p className="font-bold mb-1">{t("customSolutions")}</p>
                  <p className="text-sm text-white/80">
                    {t("customSolutionsDesc")}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="bg-secondary  p-8">
            <h3 className="text-xl font-black text-primary mb-6">
              {t("directContact")}
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:vip@casadimoda.com"
                className="flex items-center gap-3 p-4 bg-white  hover:bg-accent hover:text-white transition-all group"
              >
                <div className="w-10 h-10 bg-accent group-hover:bg-white  flex items-center justify-center">
                  <Mail
                    size={20}
                    className="text-white group-hover:text-accent"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-dark/50 group-hover:text-white/70">
                    {t("emailLabel")}
                  </p>
                  <p className="font-black">{t("emailValue")}</p>
                </div>
              </a>

              <a
                href="tel:+15550001234"
                className="flex items-center gap-3 p-4 bg-white  hover:bg-accent hover:text-white transition-all group"
              >
                <div className="w-10 h-10 bg-accent group-hover:bg-white  flex items-center justify-center">
                  <Phone
                    size={20}
                    className="text-white group-hover:text-accent"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-dark/50 group-hover:text-white/70">
                    {t("phoneLabel")}
                  </p>
                  <p className="font-black">{t("phoneValue")}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white  p-8 border border-gray-100">
            <h3 className="text-xl font-black text-primary mb-6">
              {t("serviceHours")}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-dark/60">{t("mondayFriday")}</span>
                <span className="font-black text-primary">
                  {t("mondayFridayHours")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dark/60">{t("saturday")}</span>
                <span className="font-black text-primary">
                  {t("saturdayHours")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dark/60">{t("sunday")}</span>
                <span className="font-black text-primary">
                  {t("sundayHours")}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-text-dark/50">
                  {t("emergencySupport")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
