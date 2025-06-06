import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navbar";
import {ClerkProvider} from '@clerk/nextjs';
import ReactQueryClientProvider from "@/components/react-query-client-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Daily Mean Planner",
};

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <ReactQueryClientProvider>
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
                >
                <NavBar/>
                <div className="max-w-7xl mx-auto pt-16 p-4 min-h-screen">
                    {children}
                </div>
                </body>
            </ReactQueryClientProvider>
            </html>
        </ClerkProvider>
    );
}
