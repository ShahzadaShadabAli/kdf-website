// A YouTube-hosted success-story video, displayed as a card on the public
// site. Only the video's URL is stored — playback streams straight from
// YouTube (embedded iframe on click), so no video file ever touches our
// own storage or bandwidth.
export const SuccessStoryShape = {
  _id: "string (Firestore document id)",
  title: "string",
  caption: "string",
  youtubeUrl: "string",
  order: "number",
  status: "draft | published | archived",
  createdAt: "Date",
  updatedAt: "Date",
};
