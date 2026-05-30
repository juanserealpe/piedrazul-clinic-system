export const getTodayUtc = () => {

  const today = new Date();

  return new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  ).toISOString();
};

export const toISOStringLib = (
  localDateTime: string
) => {

  return new Date(
    localDateTime
  ).toISOString();
};