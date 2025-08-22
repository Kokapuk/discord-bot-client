import { Button, Card, Field, Fieldset, Link, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import z from 'zod';
import { ipcRendererDiscordApiFunctions } from '../../api/discord';
import { PasswordInput } from '../../ui/password-input';

export const AuthFormData = z.object({ token: z.string().min(1, { error: 'Token is required' }) });

export default function Auth() {
  const [formIssues, setFormIssues] = useState<Record<string, string>>({});
  const [isAuthorizing, setAuthorizing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setAuthorizing(true);
      const formdata = AuthFormData.parse(Object.fromEntries(new FormData(event.currentTarget).entries()));
      const response = await ipcRendererDiscordApiFunctions.authorize(formdata.token);

      if (response.success) {
        localStorage.setItem('token', formdata.token);
        navigate('/');
      } else {
        setFormIssues({ token: response.error });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFormIssues(() => {
          const issues: typeof formIssues = {};
          err.issues.forEach((i) => (issues[i.path.join('/')] = i.message));

          return issues;
        });
      }
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <Card.Root width={500} variant="subtle" mx="auto" mt="15vh">
      <form onSubmit={handleSubmit} onChange={() => setFormIssues((prev) => (Object.keys.length === 0 ? prev : {}))}>
        <Fieldset.Root size="lg" padding="25px">
          <Stack>
            <Fieldset.Legend>Authorization</Fieldset.Legend>
            <Fieldset.HelperText>
              To authorize as bot, you need to get it's token, which located at{' '}
              <Link href="https://discord.com/developers/applications" target="_blank">
                Discord Developer Portal
              </Link>
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field.Root invalid={Object.keys(formIssues).includes('token')}>
              <Field.Label>Token</Field.Label>
              <PasswordInput defaultValue={localStorage.getItem('token') ?? undefined} name="token" autoFocus />
              <Field.ErrorText>{formIssues['token']}</Field.ErrorText>
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
