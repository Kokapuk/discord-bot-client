export interface SendMessageFileDTO {
  name: string;
  buffer: ArrayBuffer;
}

export interface SendMessageDTO {
  content?: string;
  files?: SendMessageFileDTO[];
}

export interface EditMessageDTO {
  content: string;
}
