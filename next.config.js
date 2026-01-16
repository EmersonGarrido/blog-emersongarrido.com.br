/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: [
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/extension-link',
    '@tiptap/extension-image',
    '@tiptap/extension-placeholder',
    '@tiptap/core',
    '@tiptap/pm',
  ],
}

module.exports = nextConfig
