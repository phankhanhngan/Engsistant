import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@Entity({ tableName: 'classes' })
export class Class extends BaseUUID {
  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  descriptionHeading?: string;

  @Property({ nullable: true })
  alternativeLink?: string;

  @Property({ nullable: true })
  driveLink?: string;

  @Property({ nullable: false })
  @Unique()
  googleCourseId!: string;

  @ManyToOne({
    entity: () => User,
    onDelete: 'cascade',
    onUpdateIntegrity: 'cascade',
  })
  owner: User;

  @Property({ nullable: false })
  color!: string;

  @Property({ nullable: false })
  cover!: string;

  @OneToMany(() => Lesson, (lesson) => lesson.class)
  lessons: Collection<Lesson>;
}
