import {getSortedPostsData} from '../lib/posts'

// dummy function, actual content will be passed to res argument of getServerSideProps
export default function Sitemap() {}

export async function getServerSideProps({ res }) {
	const posts = await getSortedPostsData();
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
        	<loc>https://bunyk.github.io/</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
      	<changefreq>weekly</changefreq>
      	<priority>1.0</priority>
        </url>
        ${posts.map((post) => {
            return `
              <url>
                <loc>https://bunyk.github.io/posts/${post.id}</loc>
                <lastmod>${post.updated_at}</lastmod>
                <changefreq>monthly</changefreq>
              </url>
            `;
          })
          .join("")}
      </urlset>
    `;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
