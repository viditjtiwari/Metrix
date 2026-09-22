"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { HeroVerifier } from "@/components/public/HeroVerifier";

export default function VerifyPortalPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;

  return (
    <div className="py-6">
      <HeroVerifier initialToken={token} />
    </div>
  );
}
