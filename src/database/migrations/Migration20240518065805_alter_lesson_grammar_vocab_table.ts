import { Migration } from '@mikro-orm/migrations';

export class Migration20240518065805_alter_lesson_grammar_vocab_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `lessons` add `name` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` drop `name`;');
  }
}
