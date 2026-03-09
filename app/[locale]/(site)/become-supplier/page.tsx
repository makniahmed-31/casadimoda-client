"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  Globe,
  Upload,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { apiFetch } from "@/utils/api";

type SupplierFormData = {
  // Business Info
  businessName: string;
  businessDescription: string;
  businessLogo: string;
  // Contact Info
  contactPhone: string;
  contactEmail: string;
  // Address
  street: string;
  city: string;
  postalCode: string;
  country: string;
  // Documents
  taxId: string;
  businessLicense: string;
};

export default function BecomeSupplierPage() {
  const t = useTranslations("supplier");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");

  const steps = [
    { id: 1, name: t("businessInfo"), icon: Store },
    { id: 2, name: t("contact"), icon: Phone },
    { id: 3, name: t("address"), icon: MapPin },
    { id: 4, name: t("documents"), icon: FileText },
    { id: 5, name: t("review"), icon: CheckCircle },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    defaultValues: {
      businessName: "",
      businessDescription: "",
      businessLogo: "",
      contactPhone: "",
      contactEmail: session?.user?.email || "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
      taxId: "",
      businessLicense: "",
    },
  });

  const formData = watch();

  // Redirect if not logged in
  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-primary mb-4">
            {t("signInFirst")}
          </h2>
          <p className="text-text-dark/60 mb-6">{t("needAccount")}</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3  font-bold hover:bg-black transition-colors"
          >
            {t("createAccount")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: SupplierFormData) => {
    setError("");
    try {
      const res = await apiFetch("/api/supplier/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          businessLogo: logoUrl || data.businessLogo,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          address: {
            street: data.street,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country,
          },
          taxId: data.taxId,
          businessLicense: licenseUrl || data.businessLicense,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Registration failed");
        return;
      }

      // Redirect to success page or dashboard
      router.push("/supplier?registered=true");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "An error occurred");
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.businessName;
      case 2:
        return !!formData.contactPhone && !!formData.contactEmail;
      case 3:
        return (
          !!formData.street &&
          !!formData.city &&
          !!formData.postalCode &&
          !!formData.country
        );
      case 4:
        return true; // Documents are optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-[80vh] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-8">
          <div className="hidden lg:inline-block bg-primary p-4  mb-4 shadow-lg">
            <Logo />
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-primary tracking-tight mb-2">
            {t("becomeSupplier")}
            <span className="text-accent text-2xl lg:text-3xl md:text-4xl">
              .
            </span>
          </h1>
          <p className="text-text-dark/40 text-xs lg:text-sm font-medium uppercase tracking-widest">
            {t("joinMarketplace")}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
                      currentStep >= step.id
                        ? "text-accent"
                        : "text-text-dark/30"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step.id ? "bg-accent" : "bg-gray-100"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 ">
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white  shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Business Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-primary mb-6">
                    {t("businessInformation")}
                  </h2>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("businessName")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <Building size={18} />
                      </div>
                      <input
                        {...register("businessName", {
                          required: t("businessNameRequired"),
                        })}
                        type="text"
                        placeholder={t("businessNamePlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.businessName
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                    </div>
                    {errors.businessName && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("businessDescription")}
                    </label>
                    <textarea
                      {...register("businessDescription")}
                      placeholder={t("businessDescPlaceholder")}
                      rows={4}
                      className="w-full bg-secondary/50 border-2 border-transparent focus:border-accent  py-4 px-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("businessLogo")}
                    </label>
                    <div className="flex items-center gap-4">
                      {logoUrl && (
                        <Image
                          src={logoUrl}
                          alt="Logo preview"
                          className="w-16 h-16 object-cover  border-2 border-accent"
                          width={64}
                          height={64}
                        />
                      )}
                      <CldUploadWidget
                        uploadPreset="iqsmn6rq"
                        onSuccess={(result: unknown) => {
                          const uploadResult = result as {
                            info?: { secure_url?: string };
                          };
                          if (uploadResult.info?.secure_url) {
                            setLogoUrl(uploadResult.info.secure_url);
                            setValue(
                              "businessLogo",
                              uploadResult.info.secure_url,
                            );
                          }
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-gray-200  text-sm font-bold text-primary transition-colors"
                          >
                            <Upload size={18} />
                            {t("uploadLogo")}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-primary mb-6">
                    {t("contactInformation")}
                  </h2>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("phoneNumber")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <Phone size={18} />
                      </div>
                      <input
                        {...register("contactPhone", {
                          required: t("phoneRequired"),
                        })}
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.contactPhone
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                    </div>
                    {errors.contactPhone && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                        {errors.contactPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("businessEmail")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        {...register("contactEmail", {
                          required: t("emailRequired"),
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: t("invalidEmail"),
                          },
                        })}
                        type="email"
                        placeholder={t("businessEmailPlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.contactEmail
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                    </div>
                    {errors.contactEmail && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                        {errors.contactEmail.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-primary mb-6">
                    {t("businessAddress")}
                  </h2>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("streetAddress")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <MapPin size={18} />
                      </div>
                      <input
                        {...register("street", {
                          required: t("streetRequired"),
                        })}
                        type="text"
                        placeholder={t("streetPlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.street
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                    </div>
                    {errors.street && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                        {t("city")}
                      </label>
                      <input
                        {...register("city", { required: t("cityRequired") })}
                        type="text"
                        placeholder={t("cityPlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.city
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 px-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                      {errors.city && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                        {t("postalCode")}
                      </label>
                      <input
                        {...register("postalCode", {
                          required: t("postalRequired"),
                        })}
                        type="text"
                        placeholder={t("postalPlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.postalCode
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 px-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                      {errors.postalCode && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("country")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <Globe size={18} />
                      </div>
                      <input
                        {...register("country", {
                          required: t("countryRequired"),
                        })}
                        type="text"
                        placeholder={t("countryPlaceholder")}
                        className={`w-full bg-secondary/50 border-2 ${
                          errors.country
                            ? "border-red-500/50"
                            : "border-transparent focus:border-accent"
                        }  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all`}
                      />
                    </div>
                    {errors.country && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-primary mb-6">
                    {t("businessDocuments")}
                  </h2>
                  <p className="text-sm text-text-dark/60 -mt-4 mb-6">
                    {t("optionalDocs")}
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("taxId")}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                        <FileText size={18} />
                      </div>
                      <input
                        {...register("taxId")}
                        type="text"
                        placeholder={t("taxIdPlaceholder")}
                        className="w-full bg-secondary/50 border-2 border-transparent focus:border-accent  py-4 pl-12 pr-4 text-primary font-bold placeholder:text-gray-300 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-1">
                      {t("businessLicense")}
                    </label>
                    <div className="flex items-center gap-4">
                      {licenseUrl && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 ">
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-xs font-bold text-green-700">
                            {t("uploaded")}
                          </span>
                        </div>
                      )}
                      <CldUploadWidget
                        uploadPreset="iqsmn6rq"
                        onSuccess={(result: unknown) => {
                          const uploadResult = result as {
                            info?: { secure_url?: string };
                          };
                          if (uploadResult.info?.secure_url) {
                            setLicenseUrl(uploadResult.info.secure_url);
                            setValue(
                              "businessLicense",
                              uploadResult.info.secure_url,
                            );
                          }
                        }}
                      >
                        {({ open }) => (
                          <button
                            type="button"
                            onClick={() => open()}
                            className="flex items-center gap-2 px-4 py-3 bg-secondary hover:bg-gray-200  text-sm font-bold text-primary transition-colors"
                          >
                            <Upload size={18} />
                            {t("uploadLicense")}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-primary mb-6">
                    {t("reviewApplication")}
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 ">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 mb-2">
                        {t("businessInformation")}
                      </h3>
                      <p className="font-bold text-primary">
                        {formData.businessName}
                      </p>
                      {formData.businessDescription && (
                        <p className="text-sm text-text-dark/60 mt-1">
                          {formData.businessDescription}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-secondary/50 ">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 mb-2">
                        {t("contactInformation")}
                      </h3>
                      <p className="font-bold text-primary">
                        {formData.contactPhone}
                      </p>
                      <p className="text-sm text-text-dark/60">
                        {formData.contactEmail}
                      </p>
                    </div>

                    <div className="p-4 bg-secondary/50 ">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 mb-2">
                        {t("businessAddress")}
                      </h3>
                      <p className="font-bold text-primary">
                        {formData.street}
                      </p>
                      <p className="text-sm text-text-dark/60">
                        {formData.city}, {formData.postalCode}
                      </p>
                      <p className="text-sm text-text-dark/60">
                        {formData.country}
                      </p>
                    </div>

                    {(formData.taxId || licenseUrl) && (
                      <div className="p-4 bg-secondary/50 ">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 mb-2">
                          {t("documents")}
                        </h3>
                        {formData.taxId && (
                          <p className="text-sm text-text-dark/60">
                            {t("taxIdLabel")} {formData.taxId}
                          </p>
                        )}
                        {licenseUrl && (
                          <p className="text-sm text-green-600 font-bold">
                            {t("licenseUploaded")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-accent/10  border border-accent/20">
                    <p className="text-sm text-primary">
                      {t("agreeTerms")}{" "}
                      <Link href="#" className="text-accent font-bold">
                        {t("termsOfService")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link href="#" className="text-accent font-bold">
                        {t("supplierAgreement")}
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-gray-200  font-bold text-primary transition-colors"
                  >
                    <ArrowLeft size={18} />
                    {t("back")}
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-black text-white  font-bold transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {t("next")}
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-white  font-bold transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {t("submitApplication")}
                        <CheckCircle size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-dark/40">
            {t("needHelp")}{" "}
            <Link href="#" className="text-accent font-bold hover:underline">
              {t("contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
