import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MainLayout from "@/components/layout/MainLayout";
import './styles/globals.css';
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TaskPro - Task Management",
    description: "Professional task management application",
};

export default function RootLayout({children}: {children: React.ReactNode;}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>
                    <MainLayout>{children}</MainLayout>
                </QueryProvider>
            </body>
        </html>
    );
}
