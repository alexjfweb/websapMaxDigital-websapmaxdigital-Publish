// This file is intentionally left blank.
// By deleting this file, the navigation page will inherit the correct layout 
// from its parent directory, which includes the main sidebar.
// This resolves the bug where the sidebar disappears on this specific page.
"use client";

import React from 'react';

// This layout is necessary to avoid a Next.js error, but it should just pass children through.
export default function NavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
