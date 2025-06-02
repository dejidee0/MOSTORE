import Image from "next/image"
import Link from "next/link"
import { Calendar, User } from "lucide-react"


export default function BlogCard({ post }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <Image
          src={post.image}
          alt={post.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-3 hover:text-orange-500 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>

        <Link
          href={`/blog/${post.slug}`}
          className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
        >
          Read More →
        </Link>
      </div>
    </article>
  )
}
