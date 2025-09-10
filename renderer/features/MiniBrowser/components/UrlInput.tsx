import { Input, InputProps } from '@chakra-ui/react';
import React, { RefAttributes, useRef } from 'react';

export default function UrlInput(props: InputProps & RefAttributes<HTMLInputElement>) {
  const shouldSelect = useRef(false);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.setSelectionRange(null, null);
    event.currentTarget.blur();
  };

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    if (shouldSelect.current) {
      event.currentTarget.select();
    }
  };

  return (
    <Input
      type="url"
      onBlur={handleBlur}
      onMouseDown={(e) => (shouldSelect.current = e.currentTarget !== document.activeElement)}
      onClick={handleClick}
      size="xs"
      {...props}
    />
  );
}
