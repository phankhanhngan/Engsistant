import { split, Syntax } from 'sentence-splitter';

export const generatePastelColor = () => {
  const R = Math.floor(Math.random() * 127 + 100);
  const G = Math.floor(Math.random() * 127 + 100);
  const B = Math.floor(Math.random() * 127 + 100);

  const rgb = (R << 16) + (G << 8) + B;
  return `#${rgb.toString(16).padStart(6, '0')}`;
};

export const randomEnumValue = (enumeration) => {
  const values = Object.keys(enumeration);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  return enumeration[enumKey];
};

export const separateSentences = (paragraph: string) => {
  const sentences = split(paragraph);
  if (sentences.length === 0) {
    return [];
  }
  return (
    sentences
      .filter((el) => el.type === Syntax.Sentence)
      // Extract the sentences from the result, removing the punctuation
      .map((el) => el.raw.replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, ''))
  );
};
