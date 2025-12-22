"use client";

import { useMemo } from "react";

/**
 * Safely renders HTML content from the rich text editor
 * Sanitizes content to prevent XSS attacks while preserving formatting
 * Handles YouTube embeds with beautiful previews
 */
export default function RichContentRenderer({ content, className = "" }) {
  // Sanitize and enhance HTML content
  const sanitizedContent = useMemo(() => {
    if (!content) return "";

    // Basic sanitization - removes script tags and dangerous attributes
    let cleaned = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .replace(/on\w+='[^']*'/g, "")
      .replace(/javascript:/gi, "");

    // Enhance YouTube iframes with wrapper for responsive design
    cleaned = cleaned.replace(
      /<iframe([^>]*src="[^"]*(?:youtube\.com|youtu\.be)[^"]*"[^>]*)><\/iframe>/gi,
      (match, attributes) => {
        return `
          <div class="youtube-video-wrapper">
            <div class="youtube-video-container">
              <iframe${attributes} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          </div>
        `;
      }
    );

    return cleaned;
  }, [content]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        /* YouTube Video Responsive Wrapper */
        .youtube-video-wrapper {
          margin: 2rem 0;
          padding: 0;
        }

        .youtube-video-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .youtube-video-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
        }

        .youtube-video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
        }

        /* Enhanced Link Styles */
        .prose a {
          color: #f97316;
          text-decoration: underline;
          text-decoration-color: rgba(249, 115, 22, 0.3);
          text-underline-offset: 3px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .prose a:hover {
          color: #ea580c;
          text-decoration-color: #ea580c;
          text-underline-offset: 5px;
        }

        /* Image Styles */
        .prose img {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .prose img:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* Blockquote Styles */
        .prose blockquote {
          border-left: 4px solid #f97316;
          background: linear-gradient(
            90deg,
            rgba(249, 115, 22, 0.05) 0%,
            transparent 100%
          );
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 8px 8px 0;
        }

        /* Code Block Styles */
        .prose code {
          background: #1f2937;
          color: #10b981;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: "Fira Code", "Courier New", monospace;
        }

        .prose pre {
          background: #1f2937;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .prose pre code {
          background: transparent;
          padding: 0;
          color: #10b981;
        }

        /* Heading Styles */
        .prose h1 {
          color: #111827;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .prose h2 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.875rem;
          border-bottom: 2px solid #f97316;
          padding-bottom: 0.5rem;
        }

        .prose h3 {
          color: #374151;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        /* List Styles */
        .prose ul,
        .prose ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose ul li {
          position: relative;
          padding-left: 0.5rem;
        }

        .prose ul li::marker {
          color: #f97316;
        }

        .prose ol li::marker {
          color: #f97316;
          font-weight: 600;
        }

        /* Horizontal Rule */
        .prose hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f97316, transparent);
          margin: 2rem 0;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .youtube-video-wrapper {
            margin: 1.5rem -1rem;
          }

          .youtube-video-container {
            border-radius: 0;
          }
        }

        /* Custom font sizes from editor */
        .prose [style*="font-size: 12px"] {
          font-size: 12px !important;
        }
        .prose [style*="font-size: 16px"] {
          font-size: 16px !important;
        }
        .prose [style*="font-size: 18px"] {
          font-size: 18px !important;
        }
        .prose [style*="font-size: 24px"] {
          font-size: 24px !important;
        }
        .prose [style*="font-size: 32px"] {
          font-size: 32px !important;
        }
        .prose [style*="font-size: 48px"] {
          font-size: 48px !important;
        }
      `}</style>

      <div
        className={`prose prose-sm md:prose-base lg:prose-lg max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
}
