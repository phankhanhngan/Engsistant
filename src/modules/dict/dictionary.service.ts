import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ThesaurusData, VocabData } from './dtos/VocabularyMeta.dto';
import axios from 'axios';
import { GptService } from '../gpt/gpt.service';

@Injectable()
export class DictionaryService {
  private DICT_API_KEY = process.env.INTERMEDIATE_DICTIONARY;
  private THESAURUS_API_KEY = process.env.INTERMEDIATE_THESAURUS_API_KEY;
  private DICT_API_URL =
    'https://www.dictionaryapi.com/api/v3/references/sd3/json';
  private THESAURUS_API_URL =
    'https://www.dictionaryapi.com/api/v3/references/ithesaurus/json';
  private AUDIO_API_URL =
    'https://media.merriam-webster.com/audio/prons/en/us/mp3';

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly gptService: GptService,
  ) {}

  getSubDir(audio: string): string {
    if (audio.startsWith('bix')) {
      return 'bix';
    }
    if (audio.startsWith('gg')) {
      return 'gg';
    }
    // if start with a number or punctuation, subdir should be number
    if (
      audio.match(/^[0-9]/) ||
      /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(audio)
    ) {
      return 'number';
    }
    return audio[0];
  }

  /**
   * Get only audio and pronunciation written
   */
  async fetchDictData(
    word: string,
    functionalLabel: string,
  ): Promise<VocabData> {
    try {
      const response = await axios.get(
        `${this.DICT_API_URL}/${word}?key=${this.DICT_API_KEY}`,
      );
      if (response.data.length === 0) {
        return null;
      }
      const vocab = response.data.find((el) => el.fl === functionalLabel);
      if (vocab === undefined || vocab === null) {
        return null;
      }
      const audio = vocab.hwi?.prs ? vocab.hwi?.prs[0]?.sound?.audio : null;
      let audioLink = null;
      if (audio !== undefined && audio !== null) {
        audioLink = `${this.AUDIO_API_URL}/${this.getSubDir(
          word,
        )}/${audio}.mp3`;
      }
      const pronunciation = vocab.hwi?.prs ? vocab.hwi?.prs[0]?.mw : null;
      return {
        word: word,
        audio: audioLink,
        pronunciationWritten: pronunciation,
      };
    } catch (error) {
      this.logger.error(
        'Calling fetchDictData()',
        error,
        DictionaryService.name,
      );
      throw new Error(
        'Failed to fetch dictionary data due to error= ' + error.message,
      );
    }
  }

  async fetchThesaurusData(word: string): Promise<ThesaurusData> {
    try {
      const response = await axios.get(
        `${this.THESAURUS_API_URL}/${word}?key=${this.THESAURUS_API_KEY}`,
      );
      return {
        word: word,
        // get 3 synonyms
        synonyms: response.data[0].meta?.syns?.flat()?.slice(0, 3) ?? [],
        antonyms: response.data[0].meta?.ants?.flat()?.slice(0, 3) ?? [],
      };
    } catch (error) {
      this.logger.error(
        'Calling fetchThesaurusData()',
        error,
        DictionaryService.name,
      );
      throw new Error(
        'Failed to fetch thesaurus data due to error= ' + error.message,
      );
    }
  }
  //
  // async getDictMeta(level: CEFR, words: string[]): Promise<DictMetaDto[]> {
  //   try {
  //     const dictData = await Promise.all(
  //       words.map((word) => this.fetchDictData(word)),
  //     ).then((res) => res.filter((el) => el !== null));
  //     const thesaurusData = await Promise.all(
  //       words.map((word) => this.fetchThesaurusData(word)),
  //     );
  //     const examples = await this.gptService.getVocabularyExample(level, words);
  //     return dictData.map((el) => {
  //       const thesaurus = thesaurusData.find((data) => data.word === el.word);
  //       const example = examples.find((data) => data.word === el.word);
  //       return {
  //         word: el.word,
  //         meaning: el.meaning,
  //         audio: el.audio,
  //         functionalLabel: el.functionalLabel,
  //         pronunciationWritten: el.pronunciationWritten,
  //         synonyms: thesaurus.synonyms,
  //         antonyms: thesaurus.antonyms,
  //         example: example.example,
  //       };
  //     });
  //   } catch (error) {
  //     this.logger.error('Calling getDictMeta()', error, DictionaryService.name);
  //     throw new Error(
  //       'Failed to get dictionary meta due to error= ' + error.message,
  //     );
  //   }
  // }
}
