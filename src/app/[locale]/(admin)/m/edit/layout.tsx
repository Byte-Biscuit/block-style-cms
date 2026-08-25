import type { Metadata } from "next";
import type { ReactNode } from "react";
import React from "react";

export const metadata: Metadata = {
    title: "编辑文章",
    description: "编辑文章",
    robots: {
        index: false,
        follow: false,
    },
};

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return <>{children}</>;
};

export default Layout;
