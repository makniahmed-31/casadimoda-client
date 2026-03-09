import db from "@/utils/db";
import User from "@/models/User";
import TransporterCompany from "@/models/TransporterCompany";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { companyName, description, logo, phone, contactEmail, website, trackingUrl, address, coverageAreas, status, name } = body;

    await db.connect();

    const company = await TransporterCompany.findById(id);
    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    if (companyName !== undefined) company.companyName = companyName;
    if (description !== undefined) company.description = description;
    if (logo !== undefined) company.logo = logo;
    if (phone !== undefined) company.phone = phone;
    if (contactEmail !== undefined) company.contactEmail = contactEmail;
    if (website !== undefined) company.website = website;
    if (trackingUrl !== undefined) company.trackingUrl = trackingUrl;
    if (address !== undefined) company.address = address;
    if (coverageAreas !== undefined) company.coverageAreas = coverageAreas;
    if (status !== undefined) company.status = status;
    await company.save();

    if (name !== undefined) {
      await User.findByIdAndUpdate(company.user, { name });
    }

    return NextResponse.json({ message: "Company updated" });
  } catch (err) {
    console.error("[PUT /api/admin/transporters/[id]]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.connect();

    const company = await TransporterCompany.findById(id);
    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(company.user);
    await TransporterCompany.findByIdAndDelete(id);

    return NextResponse.json({ message: "Company deleted" });
  } catch (err) {
    console.error("[DELETE /api/admin/transporters/[id]]", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
