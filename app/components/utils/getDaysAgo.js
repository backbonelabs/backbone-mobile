export default (days) => {
  const today = new Date();
  today.setDate(today.getDate() - days);

  let month = (today.getMonth() + 1);
  let day = today.getDate();
  const year = today.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return `${year}-${month}-${day}`;
};
