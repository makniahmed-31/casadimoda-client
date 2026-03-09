"use client";

import { useEffect, useState } from "react";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/utils/api";

interface TransporterCompany {
  _id: string;
  companyName?: string;
  companySlug?: string;
  description?: string;
  phone?: string;
  contactEmail?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  coverageAreas?: string[];
  logo?: string;
  website?: string;
  trackingUrl?: string;
  status?: string;
}

interface Transporter {
  _id: string;
  name?: string;
  email?: string;
  company?: TransporterCompany | null;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  companyName: "",
  description: "",
  logo: "",
  phone: "",
  contactEmail: "",
  website: "",
  trackingUrl: "",
  street: "",
  city: "",
  postalCode: "",
  country: "Tunisie",
  coverageAreas: "",
};

type FormState = typeof EMPTY_FORM;

export default function AdminTransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // company._id
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const fetchTransporters = () => {
    setLoading(true);
    apiFetch("/api/admin/transporters")
      .then((r) => r.json())
      .then((data) => setTransporters(Array.isArray(data) ? data : []))
      .catch((err) => console.error("transporters fetch:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (tr: Transporter) => {
    const c = tr.company;
    setForm({
      name: tr.name || "",
      email: tr.email || "",
      password: "",
      companyName: c?.companyName || "",
      description: c?.description || "",
      logo: c?.logo || "",
      phone: c?.phone || "",
      contactEmail: c?.contactEmail || "",
      website: c?.website || "",
      trackingUrl: c?.trackingUrl || "",
      street: c?.address?.street || "",
      city: c?.address?.city || "",
      postalCode: c?.address?.postalCode || "",
      country: c?.address?.country || "Tunisie",
      coverageAreas: (c?.coverageAreas || []).join(", "),
    });
    setEditingId(c?._id || null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!form.companyName || !form.phone) {
      setError("Nom de société et téléphone sont requis.");
      return;
    }
    if (!editingId && (!form.name || !form.email || !form.password)) {
      setError("Nom, email et mot de passe sont requis.");
      return;
    }

    setSaving(true);
    try {
      const coverageAreas = form.coverageAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingId) {
        const res = await apiFetch(`/api/admin/transporters/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            companyName: form.companyName,
            description: form.description,
            logo: form.logo,
            phone: form.phone,
            contactEmail: form.contactEmail,
            website: form.website,
            trackingUrl: form.trackingUrl,
            address: {
              street: form.street,
              city: form.city,
              postalCode: form.postalCode,
              country: form.country,
            },
            coverageAreas,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Erreur");
          return;
        }
      } else {
        const res = await apiFetch("/api/admin/transporters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            companyName: form.companyName,
            description: form.description,
            logo: form.logo,
            phone: form.phone,
            contactEmail: form.contactEmail,
            website: form.website,
            trackingUrl: form.trackingUrl,
            address: {
              street: form.street,
              city: form.city,
              postalCode: form.postalCode,
              country: form.country,
            },
            coverageAreas,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Erreur");
          return;
        }
      }

      closeForm();
      fetchTransporters();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (companyId: string) => {
    setDeletingId(companyId);
    try {
      await apiFetch(`/api/admin/transporters/${companyId}`, {
        method: "DELETE",
      });
      fetchTransporters();
    } finally {
      setDeletingId(null);
    }
  };

  const f = (key: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const inputCls =
    "w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 px-3 text-sm text-white outline-none transition-all placeholder:text-white/20";
  const labelCls =
    "block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Livraison
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {transporters.length} société{transporters.length !== 1 ? "s" : ""}{" "}
            de transport
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-accent text-primary text-[10px] font-black uppercase tracking-widest px-5 py-3 hover:bg-accent/90 transition-all cursor-pointer"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="bg-white/5 border border-accent/30 p-6 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              {editingId
                ? "Modifier la société"
                : "Nouvelle société de transport"}
            </h2>
            <button
              onClick={closeForm}
              className="text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <p className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2">
              {error}
            </p>
          )}

          {/* Account (create only) */}
          {!editingId && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-3">
                Compte de connexion
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Nom complet</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => f("name", e.target.value)}
                    placeholder="Karim Transporteur"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email de connexion</label>
                  <input
                    className={inputCls}
                    type="email"
                    value={form.email}
                    onChange={(e) => f("email", e.target.value)}
                    placeholder="contact@societe.tn"
                  />
                </div>
                <div>
                  <label className={labelCls}>Mot de passe</label>
                  <input
                    className={inputCls}
                    type="password"
                    value={form.password}
                    onChange={(e) => f("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company info */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-3">
              Informations société
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nom de la société *</label>
                <input
                  className={inputCls}
                  value={form.companyName}
                  onChange={(e) => f("companyName", e.target.value)}
                  placeholder="DHL Express Tunisia"
                />
              </div>
              <div>
                <label className={labelCls}>Téléphone *</label>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => f("phone", e.target.value)}
                  placeholder="+216 71 000 000"
                />
              </div>
              <div>
                <label className={labelCls}>Email de contact</label>
                <input
                  className={inputCls}
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => f("contactEmail", e.target.value)}
                  placeholder="info@societe.tn"
                />
              </div>
              <div>
                <label className={labelCls}>URL du logo</label>
                <input
                  className={inputCls}
                  value={form.logo}
                  onChange={(e) => f("logo", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className={labelCls}>Site web</label>
                <input
                  className={inputCls}
                  value={form.website}
                  onChange={(e) => f("website", e.target.value)}
                  placeholder="https://www.societe.tn"
                />
              </div>
              <div>
                <label className={labelCls}>URL de suivi colis</label>
                <input
                  className={inputCls}
                  value={form.trackingUrl}
                  onChange={(e) => f("trackingUrl", e.target.value)}
                  placeholder="https://www.societe.tn/suivi"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  placeholder="Description de la société..."
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-3">
              Adresse
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className={labelCls}>Rue</label>
                <input
                  className={inputCls}
                  value={form.street}
                  onChange={(e) => f("street", e.target.value)}
                  placeholder="12 Rue de la Paix"
                />
              </div>
              <div>
                <label className={labelCls}>Ville</label>
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => f("city", e.target.value)}
                  placeholder="Tunis"
                />
              </div>
              <div>
                <label className={labelCls}>Code postal</label>
                <input
                  className={inputCls}
                  value={form.postalCode}
                  onChange={(e) => f("postalCode", e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className={labelCls}>Pays</label>
                <input
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => f("country", e.target.value)}
                  placeholder="Tunisie"
                />
              </div>
              <div className="md:col-span-3">
                <label className={labelCls}>
                  Zones couvertes (séparées par virgule)
                </label>
                <input
                  className={inputCls}
                  value={form.coverageAreas}
                  onChange={(e) => f("coverageAreas", e.target.value)}
                  placeholder="Tunis, Sfax, Sousse, Bizerte"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent text-primary text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={closeForm}
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white px-4 py-3 transition-all cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : transporters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Truck size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
            Aucun transporteur
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {transporters.map((tr) => {
            const c = tr.company;
            return (
              <div
                key={tr._id}
                className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors p-6 space-y-4"
              >
                {/* Logo + Name + Actions */}
                <div className="flex items-start gap-4">
                  {c?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.logo}
                      alt={c.companyName}
                      className="w-14 h-14 object-contain bg-white p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-white/10 flex items-center justify-center shrink-0">
                      <Truck size={24} className="text-accent" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-black text-white leading-tight">
                      {c?.companyName || tr.name}
                    </h2>
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">
                      {tr.email}
                    </p>
                    {c?.status && (
                      <span
                        className={`inline-block mt-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 ${c.status === "active" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30"}`}
                      >
                        {c.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(tr)}
                      className="p-2 text-white/30 hover:text-accent hover:bg-accent/10 transition-all cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => c?._id && handleDelete(c._id)}
                      disabled={deletingId === c?._id}
                      className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {deletingId === c?._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 border-t border-white/10 pt-4">
                  {c?.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-white/60">
                      <Phone size={11} className="text-accent shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c?.contactEmail && (
                    <div className="flex items-center gap-2 text-[11px] text-white/60">
                      <Mail size={11} className="text-accent shrink-0" />
                      <span className="truncate">{c.contactEmail}</span>
                    </div>
                  )}
                  {c?.address?.city && (
                    <div className="flex items-start gap-2 text-[11px] text-white/60">
                      <MapPin
                        size={11}
                        className="text-accent shrink-0 mt-0.5"
                      />
                      <span>
                        {c.address.street}, {c.address.city}{" "}
                        {c.address.postalCode}, {c.address.country}
                      </span>
                    </div>
                  )}
                  {c?.website && (
                    <div className="flex items-center gap-2 text-[11px] text-white/60">
                      <Globe size={11} className="text-accent shrink-0" />
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition-colors truncate"
                      >
                        {c.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Coverage */}
                {c?.coverageAreas && c.coverageAreas.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                      Zones couvertes
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {c.coverageAreas.map((area) => (
                        <span
                          key={area}
                          className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-white/50"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking */}
                {c?.trackingUrl && (
                  <a
                    href={c.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-accent/70 hover:text-accent transition-colors"
                  >
                    <ExternalLink size={10} /> Suivre un colis
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
