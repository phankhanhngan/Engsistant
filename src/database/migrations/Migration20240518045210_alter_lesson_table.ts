import { Migration } from '@mikro-orm/migrations';

export class Migration20240518045210_alter_lesson_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `lessons` modify `paragraph` text not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` modify `paragraph` varchar(255) null;');
  }
}
