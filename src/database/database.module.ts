import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, ),
  ],
  providers: [
    {
      provide: 'DatabaseConnection',
      useFactory: async () => {
        const mongoose = await import('mongoose');
        return mongoose.connect(process.env.MONGO_URI);
      },
    },
  ],
  exports: ['DatabaseConnection'],
})
export class DatabaseModule {}