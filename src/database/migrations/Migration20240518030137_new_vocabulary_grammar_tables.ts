import { Migration } from '@mikro-orm/migrations';

export class Migration20240518030137_new_vocabulary_grammar_tables extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `lessons` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `shared_link` varchar(255) null, `description` varchar(255) null, `paragraph` varchar(255) null, `class_id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `lessons` add index `lessons_class_id_index`(`class_id`);',
    );

    this.addSql(
      'create table `grammars` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `lesson_id` varchar(255) not null, `name` varchar(255) not null, `usage` varchar(255) not null, `level` varchar(255) not null, `example_meta` text not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `grammars` add index `grammars_lesson_id_index`(`lesson_id`);',
    );

    this.addSql(
      'create table `vocabularies` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `lesson_id` varchar(255) not null, `word` varchar(255) not null, `meaning` varchar(255) not null, `synonym_meta` text not null, `antonym_meta` text not null, `example_meta` text not null, `pronunciation_audio` varchar(255) not null, `level` varchar(255) not null, `image_url` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;',
    );
    this.addSql(
      'alter table `vocabularies` add index `vocabularies_lesson_id_index`(`lesson_id`);',
    );

    this.addSql(
      'alter table `lessons` add constraint `lessons_class_id_foreign` foreign key (`class_id`) references `classes` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `grammars` add constraint `grammars_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on update cascade;',
    );

    this.addSql(
      'alter table `vocabularies` add constraint `vocabularies_lesson_id_foreign` foreign key (`lesson_id`) references `lessons` (`id`) on update cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table `grammars` drop foreign key `grammars_lesson_id_foreign`;',
    );

    this.addSql(
      'alter table `vocabularies` drop foreign key `vocabularies_lesson_id_foreign`;',
    );

    this.addSql('drop table if exists `lessons`;');

    this.addSql('drop table if exists `grammars`;');

    this.addSql('drop table if exists `vocabularies`;');

    this.addSql(
      'alter table `classes` add unique `classes_description_unique`(`description`);',
    );
    this.addSql(
      'alter table `classes` add unique `classes_description_heading_unique`(`description_heading`);',
    );
    this.addSql(
      'alter table `classes` add unique `classes_alternative_link_unique`(`alternative_link`);',
    );
    this.addSql(
      'alter table `classes` add unique `classes_drive_link_unique`(`drive_link`);',
    );
  }
}
