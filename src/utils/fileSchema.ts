import z from 'zod';

const fileSchema = z.custom<File>();

export default fileSchema;
