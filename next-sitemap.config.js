/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://blog.emersongarrido.com.br',
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://blog.emersongarrido.com.br/sitemap-posts.xml',
    ],
  },

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
}