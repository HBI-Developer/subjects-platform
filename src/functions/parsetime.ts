export default function parseTime(time: number) {
  const seconds = Math.floor(time % 60),
    minutes = Math.floor((time % 3600) / 60),
    hours = Math.floor(time / 3600);

  return `${hours < 10 ? "0" : ""}${hours}:${
    minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
