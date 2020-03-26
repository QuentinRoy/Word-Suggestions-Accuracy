const getTimeZone = () => {
  if (Intl != null && Intl.DateTimeFormat != null) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return null;
};

export default getTimeZone;
