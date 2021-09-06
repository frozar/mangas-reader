const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const spawn = require("child-process-promise").spawn;

/**
 * Return he path of a file in storage from a public URL generated
 * by the storage itself.
 * @param {*} url
 * @returns path in storage of a thumbnail
 *          ex: thumbnails/thumbnail_gantz_377_RS_gantz_c377_p00.jpg
 */
export function thumbnailURLtoStoragePath(url) {
  return url.split("?")[0].split("/")[9].replace("%2F", "/");
}

async function download(uri, filename) {
  const writer = fs.createWriteStream(filename);

  const response = await axios({
    url: uri,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 *
 * @param {*} uri (ex.: https://lelscans.net/mangas/gantz/375/RS_gantz_c375_p00.jpg)
 * @returns a custom filename (ex.: thumbnail_gantz_375_RS_gantz_c375_p00.jpg)
 */
function getFileName(uri) {
  const splittedUri = uri.split("/");
  const fileName = splittedUri
    .slice(splittedUri.length - 3, splittedUri.length)
    .join("_");

  return fileName;
}

export async function createThumbnail(uri) {
  try {
    const fileName = getFileName(uri);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    await download(uri, tempFilePath);

    const subDimensions = "200x200>";
    const thumbFileName = `thumbnail_${fileName}`;
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);
    await spawn("convert", [
      tempFilePath,
      "-thumbnail",
      subDimensions,
      thumbFilePath,
    ]);
    fs.unlinkSync(tempFilePath);

    return [thumbFileName, thumbFilePath];
  } catch (error) {
    functions.logger.error("[createThumbnail] error", error);
    return [null, null];
  }
}
