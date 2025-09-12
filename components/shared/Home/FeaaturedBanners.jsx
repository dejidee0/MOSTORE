import { ArrowRightCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeaturedBanners() {
  const router = useRouter();

  return (
    <section className="py-0 md:py-4 px-4 sm:px-8 lg:px-16 ">
      <div className="max-w-7xl mx-auto">
        {/* Mobile: Single Row with Horizontal Scroll */}
        <div className="block md:hidden">
          <div className="overflow-x-auto">
            <div
              className="flex space-x-4 pb-4"
              style={{ width: "max-content" }}
            >
              {[
                {
                  title: "Grab Mega Deals Today",
                  img: "/hero/automotive.jpg",
                  badge: "Hot Picks This Week",
                  link: "/products?category=0ed90e18-4884-4291-b654-258b4c7f8fd4",
                  color: "bg-red-600",
                  desc: "Mega savings on rides, tools & accessories",
                },
                {
                  title: "Upgrade Your Tech Life",
                  img: "/hero/tech.jpg",
                  badge: "Tech Frenzy",
                  link: "/products?category=a4ebac6f-50a2-4ce2-9057-0003cd1b737d",
                  color: "bg-blue-600",
                  desc: "Grab the latest phones, gaming & more",
                },
                {
                  title: "Start Selling With Us",
                  img: "/hero/supplier.jpg",
                  badge: "Join Us",
                  link: "/sign-up",
                  color: "bg-green-600",
                  desc: "Upload your products and start selling",
                },
              ].map((banner, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden bg-cover bg-center h-64 w-80 flex-shrink-0 flex items-end p-6 text-white cursor-pointer transform transition duration-300 ease-out hover:scale-105 hover:brightness-110 group"
                  style={{ backgroundImage: `url(${banner.img})` }}
                  onClick={() => router.push(banner.link)}
                >
                  {/* Overlay for readability */}
                  <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />

                  {/* Text content */}
                  <div className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-4px] w-full">
                    <span
                      className={`${banner.color} text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block`}
                    >
                      {banner.badge}
                    </span>
                    <h3 className="text-xl font-bold leading-tight">
                      {banner.title}
                    </h3>
                    <p className="text-sm mt-1 leading-relaxed">
                      {banner.desc}
                    </p>
                  </div>

                  {/* Click icon */}
                  <ArrowRightCircle
                    size={32}
                    className="absolute top-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {[
            {
              title: "Grab Mega Deals Today",
              img: "/hero/automotive.jpg",
              badge: "Hot Picks This Week",
              link: "/products?category=0ed90e18-4884-4291-b654-258b4c7f8fd4",
              color: "bg-red-600",
              desc: "Mega savings on rides, tools & accessories",
            },
            {
              title: "Upgrade Your Tech Life",
              img: "/hero/tech.jpg",
              badge: "Tech Frenzy",
              link: "/products?category=a4ebac6f-50a2-4ce2-9057-0003cd1b737d",
              color: "bg-blue-600",
              desc: "Grab the latest phones, gaming & more",
            },
            {
              title: "Start Selling With Us",
              img: "/hero/supplier.jpg",
              badge: "Join Us",
              link: "/sign-up",
              color: "bg-green-600",
              desc: "Upload your products and start selling",
            },
          ].map((banner, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden bg-cover bg-center h-64 flex items-end p-6 text-white cursor-pointer transform transition duration-300 ease-out hover:scale-105 hover:brightness-110 group"
              style={{ backgroundImage: `url(${banner.img})` }}
              onClick={() => router.push(banner.link)}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />

              {/* Text content */}
              <div className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-4px]">
                <span
                  className={`${banner.color} text-xs px-3 py-1 rounded-full font-semibold mb-2 inline-block`}
                >
                  {banner.badge}
                </span>
                <h3 className="text-xl font-bold">{banner.title}</h3>
                <p className="text-sm mt-1">{banner.desc}</p>
              </div>

              {/* Click icon */}
              <ArrowRightCircle
                size={32}
                className="absolute top-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
