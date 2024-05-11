import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseUUID } from './baseUUID.enity';
import { User } from './user.entity';

@Entity({ tableName: 'classes' })
export class Class extends BaseUUID {
  @Property({ nullable: false })
  name!: string;

  @Unique()
  @Property({ nullable: true })
  description?: string;

  @Unique()
  @Property({ nullable: true })
  descriptionHeading?: string;

  @Unique()
  @Property({ nullable: true })
  alternativeLink?: string;

  @Unique()
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
}
