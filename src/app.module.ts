import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { appConfig } from "./app-config";
import { DatabaseModule } from "./database/database.module";
import { PostsModule } from "./modules/posts/posts.module";
import { UsersModule } from "./modules/users/users.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { BullModule } from "@nestjs/bull";
import { ImagesModule } from "./modules/images/images.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    DatabaseModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: configService.get("redis"),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PostsModule,
    CommentsModule,
    ImagesModule,
  ],
})
export class AppModule {}
