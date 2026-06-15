import { z } from 'zod';

export const authSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .trim(),
});

export type authSchema = z.infer<typeof authSchema>;

export const authValidation = {
  register: authSchema,
  login: authSchema.pick({ email: true, password: true }),
  update: authSchema.omit({ email: true, password: true }),
  updatePasswordForm: z
    .object({
      oldPassword: authSchema.shape.password,
      newPassword: authSchema.shape.password,
      confirmNewPassword: authSchema.shape.password,
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      path: ['newPassword'],
      message: 'New password cannot be the same as the old password',
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      path: ['confirmNewPassword'],
      message: 'Passwords do not match',
    }),
  updatePasswordRoute: z
    .object({
      oldPassword: authSchema.shape.password,
      newPassword: authSchema.shape.password,
    })
    .refine((data) => data.newPassword !== data.oldPassword, {
      path: ['newPassword'],
      message: 'New password cannot be the same as the old password',
    }),
  forgotPasswordForm: authSchema.pick({ email: true }),
  resetPassword: z
    .object({
      newPassword: authSchema.shape.password,
      confirmNewPassword: authSchema.shape.password,
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      path: ['confirmNewPassword'],
      message: 'Passwords do not match',
    }),
};
