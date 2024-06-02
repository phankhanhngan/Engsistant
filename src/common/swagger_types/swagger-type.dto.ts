import { CEFR } from 'src/common/constants/cefr-level';
import { ApiResponseStatus } from '../enum/common.enum';
import { GoogleClassroomInfoDto } from 'src/modules/google_classroom/dtos/GoogleClassroomInfo.dto';
import { User } from 'src/entities';
import { UserRtnDto } from 'src/modules/auth/dtos/UserRtnDto.dto';

export class BaseSwaggerResponseDto {
  status: ApiResponseStatus;
  message: string;
}

export class GrammarDto {
  id: string;
  name: string;
  usage: string;
  exampleMeta: string[];
}
export class VocabularyDto {
  id: string;
  word: string;
  meaning: string;
  exampleMeta: string[];
  antonymMeta: string[];
  synonymMeta: string[];
  pronunciationAudio: string;
  pronunciationWritten: string;
  functionalLabel: string;
}

export class LessonDto {
  id: string;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
  grammars: GrammarDto[];
  vocabularies: VocabularyDto[];
  cover?: string;
}
export class GetLessonResponse extends BaseSwaggerResponseDto {
  lesson: LessonDto;
}

export class ListLessonDto {
  id: string;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
  cover?: string;
}
export class ListLessonResponse extends BaseSwaggerResponseDto {
  lessons: LessonDto[];
}

export class GoogleLoginTypeDTO extends BaseSwaggerResponseDto {
  token!: string; // access token
}

export class AuthorizeTypeDto extends BaseSwaggerResponseDto {
  isAuthorized: boolean;
  authorizeUrl?: string;
}

export class ListClassDTO extends BaseSwaggerResponseDto {
  classes: GoogleClassroomInfoDto[];
}

export class GrammarRecommendSwaggerDto {
  sentence: string;
  grammars: string[];
}

export class LessonRecommendSwaggerDto extends BaseSwaggerResponseDto {
  vocabularies: string[];
  grammars: GrammarRecommendSwaggerDto[];
}

export class BuildLessonResponseDto extends BaseSwaggerResponseDto {}

export class ListImportedClassDto extends BaseSwaggerResponseDto {
  classes: {
    id: string;
    name: string;
    description?: string;
    descriptionHeading?: string;
    alternativeLink?: string;
    driveLink?: string;
    googleCourseId?: string;
    color?: string;
    students?: User[];
    cover?: string;
  }[];
}

export class AdminListUsers extends BaseSwaggerResponseDto {
  users: UserRtnDto[];
}

export class AdminUpdateUser extends BaseSwaggerResponseDto {
  users: UserRtnDto;
}

export class UpdateVocabularyResponse extends BaseSwaggerResponseDto {
  vocabulary: VocabularyDto;
}

export class StudentGrammarDto {
  id: string;
  name: string;
  usage: string;
  exampleMeta: string[];
  isMarked: boolean;
}

export class StudentVocabularyDto {
  id: string;
  word: string;
  meaning: string;
  exampleMeta: string[];
  antonymMeta: string[];
  synonymMeta: string[];
  pronunciationAudio: string;
  pronunciationWritten: string;
  functionalLabel: string;
  isMarked: boolean;
}

export class StudentLessonDto {
  id: string;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
  grammars: GrammarDto[];
  vocabularies: VocabularyDto[];
  cover?: string;
}
export class StudentGetLessonResponse extends BaseSwaggerResponseDto {
  lesson: StudentLessonDto;
}

export class UpdateGrammarResponse extends BaseSwaggerResponseDto {
  grammar: GrammarDto;
}
