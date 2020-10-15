import React from "react";

class ProbeImage extends React.Component {
  getImageURL({ mangaURL, idxChapter, idxImage }) {
    const strIdxImg = idxImage.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    });
    const baseURL = "https://lelscan.net/mangas";
    return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
  }

  // static getDerivedStateFromProps(props, state) {
  //   console.log("ProbeImage: getDerivedStateFromProps", props, state);
  // }
  // shouldComponentUpdate(nextProps, nextState) {
  //   // console.log("ProbeImage: shouldComponentUpdate", nextProps, nextState);
  //   return true;
  // }
  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   console.log("ProbeImage: getSnapshotBeforeUpdate", prevProps, prevState);
  // }
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log(
  //     "ProbeImage: componentDidUpdate",
  //     prevProps,
  //     prevState,
  //     snapshot
  //   );
  // }

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

// const ProbeImage = (props) => {
//   const getImageURL = ({ mangaURL, idxChapter, idxImage }) => {
//     const strIdxImg = idxImage.toLocaleString(undefined, {
//       minimumIntegerDigits: 2,
//     });
//     const baseURL = "https://lelscan.net/mangas";
//     return `${baseURL}/${mangaURL}/${idxChapter}/${strIdxImg}.jpg`;
//   };

//   const { mangaInfo, imageExist, imageNotExist } = props;
//   const srcURL = getImageURL(mangaInfo);
//   return (
//     <img
//       style={{
//         display: "none",
//       }}
//       alt="manga"
//       src={srcURL}
//       onLoad={() => imageExist(mangaInfo)}
//       onError={() => imageNotExist(mangaInfo)}
//     />
//   );
// };

export default ProbeImage;
