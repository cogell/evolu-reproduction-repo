'use client';

import { H2 } from '@/app/_components/Typography';
import { useEvolu, withProvider } from './_lib/Db';
import { parseMnemonic, useOwner } from '@evolu/react';
import TextArea from '@/app/_components/TextArea';
import Button from '@/app/_components/Button';
import { HStack } from '@/../styled-system/jsx';
import { css } from '@/../styled-system/css';
import { Effect, Exit } from 'effect';

const Mnemoic = () => {
  const evolu = useEvolu();
  const owner = useOwner();

  const handleRestoreOwnerClick = () => {
    const value = window.prompt('Please enter your mnemoic phrase');

    if (!value) {
      return;
    }

    parseMnemonic(value)
      .pipe(Effect.runPromiseExit)
      .then((x) => x)
      .then(
        Exit.match({
          onFailure: (e) => {
            console.error(e);
            return;
          },
          onSuccess: (value) => {
            console.log('value:', value);
            evolu.restoreOwner(value);
          },
        }),
      );
  };

  const handleResetOwnerClick = () => {
    if (confirm('Are you sure you want to reset the owner?')) {
      evolu.resetOwner();
    }
  };

  return (
    <div>
      <H2>Mnemoic</H2>
      <p>{`This owner's mnemoic is:`}</p>
      <TextArea
        value={owner?.mnemonic || 'none'}
        disabled
        css={{
          display: 'flex',
          width: '100%',
        }}
      />
      <HStack
        className={css({
          mt: 2,
        })}
      >
        <Button onClick={handleRestoreOwnerClick}>Restore Owner</Button>
        <Button onClick={handleResetOwnerClick} visual="warning">
          Reset Owner
        </Button>
      </HStack>
    </div>
  );
};

export default withProvider(Mnemoic);
