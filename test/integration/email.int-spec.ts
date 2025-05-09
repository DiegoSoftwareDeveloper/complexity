// import { Test } from '@nestjs/testing'
// import { ConfigModule } from '@nestjs/config'

// import { EmailService } from '../../src/email/domain/services/email.service'
// import { email } from '../mocks/email.mock'

// jest.setTimeout(1000 * 1000)
// describe('emailService (integration)', () => {
//   let emailService

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [
//         ConfigModule.forRoot({
//           isGlobal: true,
//           envFilePath: ['development.local.env', '.development.env'],
//         }),
//       ],
//       providers: [EmailService],
//     }).compile()

//     emailService = await moduleRef.get<EmailService>(EmailService)
//   })

//   // it('emailService verify auth should be true', async () => {
//   //   const result = await emailService.verify();
//   //   expect(result).toBe(true);
//   // });

//   it('emailService sendMail should be true', async () => {
//     const result = await emailService.sendMail(email.subject, email.emailAddress, email.templateData)
//     expect(result).toBe(true)
//   })
// })
