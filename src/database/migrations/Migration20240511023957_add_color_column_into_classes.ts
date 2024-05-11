import { Migration } from '@mikro-orm/migrations';

export class Migration20240511023957_add_color_column_into_classes extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `classes` add `color` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `classes` drop `color`;');
  }

}
