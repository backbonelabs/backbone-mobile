export default (secs) => {
  const secNum = parseInt(secs, 10);
  const hours = Math.floor(secNum / 3600);
  const minutes = Math.floor(secNum / 60) % 60;
  const seconds = secNum % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};
