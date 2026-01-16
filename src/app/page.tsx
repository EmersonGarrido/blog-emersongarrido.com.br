import HomeContent from '@/components/HomeContent'
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()
  return <HomeContent posts={posts} />
}
