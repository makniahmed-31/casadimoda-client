import db from "@/utils/db";
import User from "@/models/User";
import TransporterCompany from "@/models/TransporterCompany";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();
    const transporters = await User.find({ role: "transporter" })
      .select("_id name email transporterCompanyId")
      .populate("transporterCompanyId", "companyName companySlug phone contactEmail address coverageAreas logo website trackingUrl description status")
      .lean();

    return NextResponse.json(
      transporters.map((t) => {
        const c = t.transporterCompanyId as Record<string, unknown> | null;
        return {
          _id: t._id.toString(),
          name: t.name,
          email: t.email,
          company: c
            ? {
                _id: (c._id as { toString(): string }).toString(),
                companyName: c.companyName,
                companySlug: c.companySlug,
                description: c.description,
                phone: c.phone,
                contactEmail: c.contactEmail,
                address: c.address,
                coverageAreas: c.coverageAreas,
                logo: c.logo,
                website: c.website,
                trackingUrl: c.trackingUrl,
                status: c.status,
              }
            : null,
        };
      })
    );
  } catch (err) {
    console.error("[GET /api/admin/transporters]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, companyName, companySlug, description, logo, phone, contactEmail, website, trackingUrl, address, coverageAreas } = body;

    if (!name || !email || !password || !companyName || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await db.connect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 400 });
    }

    const slug = companySlug || companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slugExists = await TransporterCompany.findOne({ companySlug: slug });
    if (slugExists) {
      return NextResponse.json({ message: "Company slug already in use" }, { status: 400 });
    }

    const user = await User.create({
      name,
      email,
      password: bcryptjs.hashSync(password, 10),
      isAdmin: false,
      role: "transporter",
    });

    const company = await TransporterCompany.create({
      user: user._id,
      companyName,
      companySlug: slug,
      description: description || "",
      logo: logo || "",
      phone,
      contactEmail: contactEmail || email,
      website: website || "",
      trackingUrl: trackingUrl || "",
      address: address || { street: "", city: "", postalCode: "", country: "Tunisie" },
      coverageAreas: coverageAreas || [],
      status: "active",
    });

    await User.findByIdAndUpdate(user._id, { transporterCompanyId: company._id });

    return NextResponse.json({ message: "Transporter created", _id: user._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/transporters]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
