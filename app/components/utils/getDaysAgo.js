export default (days) => {
  const today = new Date();
  today.setDate(today.getDate() - days);

  return today.toISOString();
};
