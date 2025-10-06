import React from "react";
import type { ReactNode } from "react";
import type { Metadata } from "next";

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
