import Link from "next/link";
import Image from "next/image";
import { getTrending } from "@/lib/anilist";
import { SignInForm } from "@/components/SignInForm";

export const metadata = { title: "Sign In" };

export default async function SignInPage() {
  const trending = await getTrending(1, 1).catch(() => []);
  const featured = trending[0];

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="w-full lg:w-[440px] flex items-center justify-center px-6 py-16 relative">
        <div className="orb w-[300px] h-[300px] bg-brand top-[10%] left-[-20%] opacity-20" />
        <div className="relative w-full max-w-sm">
          <Link href="/home" className="inline-block mb-10">
            <span className="font-display text-2xl tracking-wider">
              <span className="text-white">kuro</span><span className="text-brand">!</span><span className="text-white">anime</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl text-white mb-1">WELCOME BACK</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to continue watching.</p>

          <SignInForm />

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-brand hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right: anime art panel — desktop only */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        {featured && (
          <Image
            src={featured.bannerImage || featured.coverImage.extraLarge}
            alt=""
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/30" />

        {featured && (
          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-xs text-brand font-semibold mb-1 tracking-wide">TRENDING NOW</p>
            <h2 className="font-display text-2xl text-white mb-2">
              {(featured.title.english || featured.title.romaji).toUpperCase()}
            </h2>
            <p className="text-sm text-gray-300 line-clamp-2 max-w-md">
              {featured.description?.replace(/<[^>]*>/g, "")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
