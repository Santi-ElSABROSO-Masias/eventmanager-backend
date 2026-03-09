import { z } from 'zod';

export const validateIdentitySchema = z.object({
    // the files are handled by multer, maybe additional metadata can go here
});

export type ValidateIdentityDto = z.infer<typeof validateIdentitySchema>;
