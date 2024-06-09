import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { MikroOrmConfig, NestWinsternConfig } from './configs';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { PreauthMiddleware } from './modules/auth/preauth.middleware';
import { GoogleClassroomModule } from './modules/google_classroom/google-classroom.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { StudentModule } from './modules/student/student.module';
import { AdminModule } from './modules/admin/admin.module';
import { CanvaModule } from './modules/canva/canva.module';
import { AWSModule } from './modules/aws/aws.module';

@Module({
  imports: [
    MorganModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    MikroOrmModule.forRootAsync({
      useFactory: () => MikroOrmConfig(),
    }),
    WinstonModule.forRootAsync({
      useFactory: () => NestWinsternConfig(),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
        defaults: {
          from: `"No Reply " <${process.env.MAIL_FROM}>`,
        },
        template: {
          dir: join(__dirname, 'src/templates/email'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      },
    }),
    AuthModule,
    UsersModule,
    GoogleClassroomModule,
    TeacherModule,
    StudentModule,
    AdminModule,
    CanvaModule,
    AWSModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('combined'),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreauthMiddleware).forRoutes(
      {
        path: 'auth/login/google',
        method: RequestMethod.POST,
      },
      {
        path: 'auth/login/canva',
        method: RequestMethod.POST,
      },
    );
  }
}
