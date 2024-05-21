export const generatePastelColor = () => {
  const R = Math.floor(Math.random() * 127 + 127);
  const G = Math.floor(Math.random() * 127 + 127);
  const B = Math.floor(Math.random() * 127 + 127);

  const rgb = (R << 16) + (G << 8) + B;
  return `#${rgb.toString(16)}`;
};

export const randomEnumValue = (enumeration) => {
  const values = Object.keys(enumeration);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  return enumeration[enumKey];
};
