import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-row font-sans">
            {/* LEFT PANEL - Branding (70%) */}
            <div className="hidden md:flex flex-[0.7] relative bg-[#f4f4f4] flex-col items-center overflow-hidden">
                {/* Center Logo */}
                <div className="mt-[160px] relative z-10 translate-x-[10px] transition-all duration-500">
                    <Image
                        src="/images/book-logo.jpeg"
                        alt="Katha Logo"
                        width={224}
                        height={224}
                        className="rounded-full border-[3px] border-maroon shadow-lg"
                        priority
                    />
                </div>

                {/* Bottom Temple Silhouette */}
                <div className="absolute bottom-0 left-0 w-full opacity-[0.08] pointer-events-none">
                    <Image
                        src="/images/SGVP-building.png"
                        alt="SGVP Building"
                        width={1200}
                        height={400}
                        className="w-full h-auto object-bottom"
                    />
                </div>

                {/* Bottom Center Logo */}
                <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-20">
                    <Image
                        src="/images/Logoooo.png"
                        alt="SGVP Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                </div>
            </div>

            {/* RIGHT PANEL - Login Section (30% or Full on Mobile) */}
            <div className="flex-1 md:flex-[0.3] flex items-center justify-center bg-[#eeeeee] min-h-screen">
                <div className="w-full max-w-[320px] p-[40px_30px] text-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
