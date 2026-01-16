import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '7d' // 7d, 30d, all

  try {
    let dateFilter = ''
    if (period === 'today') {
      dateFilter = `AND created_at > NOW() - INTERVAL '1 day'`
    } else if (period === '7d') {
      dateFilter = `AND created_at > NOW() - INTERVAL '7 days'`
    } else if (period === '30d') {
      dateFilter = `AND created_at > NOW() - INTERVAL '30 days'`
    }

    // Total views
    const totalViewsResult = await sql`
      SELECT COUNT(*) as count FROM page_views WHERE 1=1 ${sql.unsafe(dateFilter)}
    `
    const totalViews = parseInt(totalViewsResult[0].count as string) || 0

    // Unique visitors (by visitor_id)
    const uniqueVisitorsResult = await sql`
      SELECT COUNT(DISTINCT visitor_id) as count FROM page_views WHERE 1=1 ${sql.unsafe(dateFilter)}
    `
    const uniqueVisitors = parseInt(uniqueVisitorsResult[0].count as string) || 0

    // Total likes
    const totalLikesResult = await sql`
      SELECT COUNT(*) as count FROM likes
    `
    const totalLikes = parseInt(totalLikesResult[0].count as string) || 0

    // Total comments
    const totalCommentsResult = await sql`
      SELECT COUNT(*) as count FROM comments
    `
    const totalComments = parseInt(totalCommentsResult[0].count as string) || 0

    // Pending comments
    const pendingCommentsResult = await sql`
      SELECT COUNT(*) as count FROM comments WHERE is_approved = false AND is_spam = false
    `
    const pendingComments = parseInt(pendingCommentsResult[0].count as string) || 0

    // Views by day (last 30 days)
    const viewsByDay = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as views
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    // Top pages by views
    const topPages = await sql`
      SELECT
        COALESCE(post_slug, page_type) as page,
        page_type,
        COUNT(*) as views
      FROM page_views
      WHERE 1=1 ${sql.unsafe(dateFilter)}
      GROUP BY COALESCE(post_slug, page_type), page_type
      ORDER BY views DESC
      LIMIT 10
    `

    // Posts with most likes
    const topPostsByLikes = await sql`
      SELECT
        post_slug,
        COUNT(*) as likes
      FROM likes
      WHERE page_type = 'post'
      GROUP BY post_slug
      ORDER BY likes DESC
      LIMIT 10
    `

    // Posts with most comments
    const topPostsByComments = await sql`
      SELECT
        post_slug,
        COUNT(*) as comments
      FROM comments
      WHERE is_approved = true
      GROUP BY post_slug
      ORDER BY comments DESC
      LIMIT 10
    `

    // Traffic sources
    const trafficSources = await sql`
      SELECT
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as views
      FROM page_views
      WHERE 1=1 ${sql.unsafe(dateFilter)}
      GROUP BY COALESCE(utm_source, 'direct')
      ORDER BY views DESC
      LIMIT 10
    `

    // Countries
    const countries = await sql`
      SELECT
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as views
      FROM page_views
      WHERE 1=1 ${sql.unsafe(dateFilter)}
      GROUP BY COALESCE(country, 'Unknown')
      ORDER BY views DESC
      LIMIT 10
    `

    // Cities with country
    const cities = await sql`
      SELECT
        COALESCE(city, 'Unknown') as city,
        country,
        COUNT(*) as views
      FROM page_views
      WHERE city IS NOT NULL ${sql.unsafe(dateFilter)}
      GROUP BY COALESCE(city, 'Unknown'), country
      ORDER BY views DESC
      LIMIT 10
    `

    // Recent views (last 10)
    const recentViews = await sql`
      SELECT
        id,
        post_slug,
        page_type,
        utm_source,
        country,
        city,
        user_agent,
        created_at
      FROM page_views
      ORDER BY created_at DESC
      LIMIT 10
    `

    // Online users (active in last 5 minutes)
    const onlineUsersResult = await sql`
      SELECT
        COUNT(DISTINCT visitor_id) as count
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    `
    const onlineUsers = parseInt(onlineUsersResult[0].count as string) || 0

    // Online users by location
    const onlineUsersByLocation = await sql`
      SELECT
        COALESCE(city, country, 'Unknown') as location,
        country,
        COUNT(DISTINCT visitor_id) as users
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '5 minutes'
      GROUP BY COALESCE(city, country, 'Unknown'), country
      ORDER BY users DESC
      LIMIT 10
    `

    // Currently viewing (what pages are being viewed right now)
    const currentlyViewing = await sql`
      SELECT DISTINCT ON (visitor_id)
        visitor_id,
        COALESCE(post_slug, page_type) as page,
        page_type,
        city,
        country,
        created_at
      FROM page_views
      WHERE created_at > NOW() - INTERVAL '5 minutes'
      ORDER BY visitor_id, created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueVisitors,
        totalLikes,
        totalComments,
        pendingComments,
        onlineUsers
      },
      viewsByDay,
      topPages,
      topPostsByLikes,
      topPostsByComments,
      trafficSources,
      countries,
      cities,
      recentViews,
      onlineUsersByLocation,
      currentlyViewing
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 })
  }
}
