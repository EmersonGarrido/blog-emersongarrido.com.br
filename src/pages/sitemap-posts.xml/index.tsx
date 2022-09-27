// pages/server-sitemap-index.xml/index.tsx
import { getServerSideSitemapIndex } from 'next-sitemap'
import { GetServerSideProps } from 'next'
import { fetchAPI } from "../../lib/api";

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  const [posts] = await Promise.all([
    fetchAPI(
      "/posts?pagination[limit]=50&sort=id:DESC&populate=media&populate=category&filters[highlight]=false"
    ),
  ]);

  const links = posts.data.map((post: any) => {
    return `https://blog.emersongarrido.com.br/${post.attributes.slug}`
  })

  return getServerSideSitemapIndex(ctx, [
    ...links,
  ])
}

export default function SitemapIndex() { }