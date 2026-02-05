import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tạo Thiệp - Valentine Letter 💕",
    description: "Tạo thiệp Valentine của bạn",
};

export default function CreateLayout({
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
