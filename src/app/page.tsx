import HomeContent from '@/components/HomeContent'
import { getAllPosts } from '@/lib/posts'

export default async function Home() {
  const posts = await getAllPosts()
  return <HomeContent posts={posts} />
}
