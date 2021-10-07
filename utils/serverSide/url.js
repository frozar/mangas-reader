export const applicationBaseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://mangas-reader.vercel.app";
