import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { Class } from './class.entity';
import { CEFR } from '../common/constants/cefr-level';
import { LessonStatus } from '../common/enum/common.enum';

@Entity({ tableName: 'lessons' })
export class Lesson extends BaseUUID {
  @Property({ nullable: true })
  sharedLink?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  level: CEFR;

  @Property({ nullable: false })
  status: LessonStatus = LessonStatus.PENDING;

  @Property({ nullable: true })
  color?: string;

  @ManyToOne({
    entity: () => Class,
  })
  class: Class;

  @Property({ nullable: true })
  cover?: string;
}
