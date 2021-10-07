import { getMangas, getMangaChapters } from "../src/db.js";
import { applicationBaseUrl } from "../utils/serverSide/url";

function generateSiteMap(tmpLObjManga) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${applicationBaseUrl}</loc>
    </url>
    ${Object.entries(tmpLObjManga)
      .map(([idManga, dico]) => {
        const main = `
      <url>
        <loc>${applicationBaseUrl}/manga/${idManga}</loc>
      </url>
      `;

        const secondaries = Object.keys(dico.chapters)
          .map((idChapter) => {
            return `<url>
        <loc>${applicationBaseUrl}/v/${idManga}/${idChapter}/0</loc>
      </url>
      `;
          })
          .join("");
        return main + secondaries;
      })
      .join("")}
  </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  const tmpLObjManga = await getMangas();

  const toWait = [];
  for (const idManga of Object.keys(tmpLObjManga)) {
    const process = async (idManga) => {
      const chapters = await getMangaChapters(idManga);
      tmpLObjManga[idManga].chapters = chapters;
    };

    toWait.push(process(idManga));
  }

  await Promise.all(toWait);

  // We generate the XML sitemap with the tmpLObjManga data
  const sitemap = generateSiteMap(tmpLObjManga);

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
