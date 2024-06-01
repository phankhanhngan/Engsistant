import { Migration } from '@mikro-orm/migrations';

export class Migration20240601104738_add_cover_for_lesson extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `lessons` add `cover` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` drop `cover`;');
  }
}
