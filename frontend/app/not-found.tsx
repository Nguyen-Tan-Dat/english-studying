import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <section className="flex w-full max-w-2xl flex-col items-center text-center">
                <h1 className="text-7xl font-black tracking-tight text-green text-[#0fa345] sm:text-8xl">
                    404
                </h1>

                <div className="mt-4 w-full max-w-xl">
                    <Image
                        src="/image/404-lost.gif"
                        alt="Nhân vật đang tìm đường"
                        width={700}
                        height={420}
                        priority
                        unoptimized
                        className="h-auto w-full object-contain"
                    />
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                    Có vẻ như bạn đã lạc đường
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                    Trang bạn đang tìm không tồn tại, đã bị di chuyển hoặc đường dẫn
                    không còn chính xác.
                </p>

                <Link
                    href="/"
                    className="
            mt-7 inline-flex items-center justify-center
            rounded-xl bg-black px-6 py-3
            text-sm font-semibold text-white
            transition-all duration-300 ease-out
            hover:-translate-y-1
            hover:bg-orange-600
            hover:shadow-lg
            active:translate-y-0
            active:scale-95
            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-orange-500/20
          "
                >
                    Quay về trang chủ
                </Link>
            </section>
        </main>
    );
}