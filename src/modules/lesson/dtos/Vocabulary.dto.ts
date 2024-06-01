import { CEFR } from 'src/common/constants/cefr-level';

export class VocabularyDto {
  id: string;
  word: string;
  meaning: string;
  exampleMeta: string[];
  antonymMeta: string[];
  synonymMeta: string[];
  pronunciationAudio?: string;
  functionalLabel: string;
  level: CEFR;
  pronunciationWritten?: string;
}
