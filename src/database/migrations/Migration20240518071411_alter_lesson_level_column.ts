import { Migration } from '@mikro-orm/migrations';

export class Migration20240518071411_alter_lesson_level_column extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `lessons` add `level` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` drop `level`;');
  }

}
