import { Migration } from '@mikro-orm/migrations';

export class Migration20240601091452_add_starred_column_into_lesson_item extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `grammars` add `starred` tinyint(1) not null default false;',
    );

    this.addSql(
      'alter table `vocabularies` add `starred` tinyint(1) not null default false;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table `grammars` drop `starred`;');

    this.addSql('alter table `vocabularies` drop `starred`;');
  }
}
