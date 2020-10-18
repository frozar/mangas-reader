import React from "react";
import ReactDOM from "react-dom";

function probeImage(mangaInfo, imageExistCallback, imageNotExistCallback) {
  ReactDOM.render(
    <ProbeImage
      mangaInfo={mangaInfo}
      imageExist={imageExistCallback}
      imageNotExist={imageNotExistCallback}
    />,
    document.querySelector("#probe")
  );
}

class ProbeImage extends React.Component {
  getImageURL({ mangaURL, idxChapter, idxImage }) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  render() {
    const { mangaInfo, imageExist, imageNotExist } = this.props;
    const srcURL = this.getImageURL(mangaInfo);
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

export default probeImage;
