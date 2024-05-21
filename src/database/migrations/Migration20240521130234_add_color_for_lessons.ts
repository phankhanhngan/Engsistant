import { Migration } from '@mikro-orm/migrations';

export class Migration20240521130234_add_color_for_lessons extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `lessons` add `color` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` drop `color`;');
  }

}
