export class DictMetaDto {
  word: string;
  meaning: string;
  audio?: string;
  functionalLabel: string;
  pronunciationWritten?: string;
  synonyms: string[];
  antonyms: string[];
  example: string[];
}

export class VocabData {
  word: string;
  audio?: string;
  pronunciationWritten?: string;
}

export class ThesaurusData {
  word: string;
  synonyms: string[];
  antonyms: string[];
}
