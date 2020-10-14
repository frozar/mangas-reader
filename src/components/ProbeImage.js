import React from "react";

class ProbeImage extends React.Component {
  getImageURL(mangaURL, idxChapter, idxImage) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  render() {
    const { mangaInfo, imageExist, imageNotExist } = this.props;
    const { mangaURL, idxChapter, idxImage } = mangaInfo;
    const srcURL = this.getImageURL(mangaURL, idxChapter, idxImage);
    return (
      <img
        style={{
          display: "none",
        }}
        alt="manga"
        src={srcURL}
        onLoad={() => imageExist(mangaInfo)}
        onError={() => imageNotExist(mangaInfo)}
      />
    );
  }
}

export default ProbeImage;
