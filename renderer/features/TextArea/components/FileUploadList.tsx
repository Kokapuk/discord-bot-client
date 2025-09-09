import { FileUpload as ChakraFileUpload, Float, Stack, StackProps, Text, UseFileUploadReturn } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { FaX } from 'react-icons/fa6';

export type FileUploadListBaseProps = { fileUpload: UseFileUploadReturn };
export type FileUploadListProps = FileUploadListBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function FileUploadList({ fileUpload, ...props }: FileUploadListProps) {
  return (
    <Stack direction="row" {...props}>
      {fileUpload.acceptedFiles.map((file, index) => (
        <ChakraFileUpload.Item w="auto" maxWidth="40" p="2" file={file} key={`${file.name}-${index}`}>
          <Text width="100%" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
            {file.name}
          </Text>
          <Float placement="top-end">
            <ChakraFileUpload.ItemDeleteTrigger boxSize="4" layerStyle="fill.solid">
              <FaX />
            </ChakraFileUpload.ItemDeleteTrigger>
          </Float>
        </ChakraFileUpload.Item>
      ))}
    </Stack>
  );
}
