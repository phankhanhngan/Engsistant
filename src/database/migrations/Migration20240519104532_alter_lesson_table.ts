import { Migration } from '@mikro-orm/migrations';

export class Migration20240519104532_alter_lesson_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `lessons` drop `paragraph`;');

    this.addSql('alter table `grammars` drop `level`;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` add `paragraph` text not null;');

    this.addSql('alter table `grammars` add `level` varchar(255) not null;');
  }
}
