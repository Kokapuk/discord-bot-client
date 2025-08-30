import { Button, Card, Field, Fieldset, Stack } from '@chakra-ui/react';
import { ipcRendererApiFunctions } from '@renderer/api';
import Link from '@renderer/ui/Link';
import { PasswordInput } from '@renderer/ui/password-input';
import structureZodIssues, { StructuredZodIssues } from '@renderer/utils/structureZodIssues';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import z from 'zod';

const authFormDataSchema = z.object({ token: z.string().trim().min(1, { error: 'Token is required' }) });

export default function Auth() {
  const [formIssues, setFormIssues] = useState<StructuredZodIssues>({});
  const [isAuthorizing, setAuthorizing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setAuthorizing(true);
      const formdata = authFormDataSchema.parse(Object.fromEntries(new FormData(event.currentTarget).entries()));
      const response = await ipcRendererApiFunctions.authorize(formdata.token);

      if (response.success) {
        localStorage.setItem('token', formdata.token);
        navigate('/');
      } else {
        setFormIssues({ token: [response.error] });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFormIssues(structureZodIssues(err));
      }
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <Card.Root width={500} variant="subtle" mx="auto" mt="15vh" backgroundColor="bg.transparentPanel">
      <form onSubmit={handleSubmit} onChange={() => setFormIssues((prev) => (Object.keys.length === 0 ? prev : {}))}>
        <Fieldset.Root size="lg" padding="6">
          <Stack>
            <Fieldset.Legend>Authorization</Fieldset.Legend>
            <Fieldset.HelperText>
              To authorize as bot, you need to get it's token, which located at{' '}
              <Link to="https://discord.com/developers/applications" target="_blank">
                Discord Developer Portal
              </Link>
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field.Root invalid={!!formIssues['token']?.length}>
              <Field.Label>Token</Field.Label>
              <PasswordInput defaultValue={localStorage.getItem('token') ?? undefined} name="token" autoFocus />
              <Field.ErrorText>{formIssues['token']?.[0]}</Field.ErrorText>
            </Field.Root>
          </Fieldset.Content>

          <Button type="submit" alignSelf="flex-start" loading={isAuthorizing}>
            Authorize
          </Button>
        </Fieldset.Root>
      </form>
    </Card.Root>
  );
}
