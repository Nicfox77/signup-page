import type {Metadata} from "next";

import "./ui/globals.css";


export const metadata: Metadata = {
    title: "Sign up page",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}