import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin - Valentine Letter 💕",
    description: "Quản lý thiệp Valentine",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{
            height: '100%',
            width: '100%',
            overflow: 'auto',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        }}>
            {children}
        </div>
    );
}
