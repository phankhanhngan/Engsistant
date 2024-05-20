import { Migration } from '@mikro-orm/migrations';

export class Migration20240505034455_alter_class_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `classes` add `description_heading` varchar(255) null, add `alternative_link` varchar(255) null, add `drive_link` varchar(255) null;',
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

  async down(): Promise<void> {
    this.addSql(
      'alter table `classes` drop index `classes_description_heading_unique`;',
    );
    this.addSql(
      'alter table `classes` drop index `classes_alternative_link_unique`;',
    );
    this.addSql(
      'alter table `classes` drop index `classes_drive_link_unique`;',
    );
    this.addSql('alter table `classes` drop `description_heading`;');
    this.addSql('alter table `classes` drop `alternative_link`;');
    this.addSql('alter table `classes` drop `drive_link`;');
  }
}
