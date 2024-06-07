export enum CEFR {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const getNextLevel = (level: CEFR): CEFR => {
  switch (level) {
    case CEFR.A1:
      return CEFR.A2;
    case CEFR.A2:
      return CEFR.B1;
    case CEFR.B1:
      return CEFR.B2;
    case CEFR.B2:
      return CEFR.C1;
    case CEFR.C1:
      return CEFR.C2;
    default:
      return CEFR.C2;
  }
};
