import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import * as RxSelect from '@radix-ui/react-select';
import { map } from 'lodash';
import { forwardRef } from 'react';

import { css } from '@/../styled-system/css';

import Button from './Button';

const SelectItem = forwardRef(
  (
    {
      children,
      className,
      css: cssProp,
      currentValue,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
      css?: any;
      currentValue: any;
    } & React.ComponentProps<typeof RxSelect.Item>,

    forwardedRef: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <RxSelect.Item
        className={css(
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: currentValue === children ? 'bold' : 'normal',
            // mt: 1,
            cursor: 'pointer',

            backgroundColor: 'background.accent',
            rounded: 'sm',
            borderColor: 'transparent',
            p: 1,

            _hover: {
              filter: 'brightness(97%)',
            },
          },
          cssProp,
        )}
        {...props}
        // @ts-expect-error: something with radix types?

        ref={forwardedRef}
      >
        <RxSelect.ItemText>{children}</RxSelect.ItemText>
        <RxSelect.ItemIndicator className={css({})}>
          <CheckIcon />
        </RxSelect.ItemIndicator>
      </RxSelect.Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';

const Select = <Key extends string, Value extends string>({
  values,
  value,
  setValue,
  placeholder,
}: {
  values: Record<Key, Value>;
  value: Key | '';
  setValue: (v: Key) => void;
  placeholder: string;
}) => {
  return (
    <RxSelect.Root value={value} onValueChange={setValue}>
      <RxSelect.Trigger>
        <Button
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <RxSelect.Value placeholder={placeholder} />
          <RxSelect.Icon>
            <ChevronDownIcon />
          </RxSelect.Icon>
        </Button>
      </RxSelect.Trigger>

      <RxSelect.Content
        className={css({
          overflow: 'hidden',
          backgroundColor: 'white',
          borderRadius: 'sm',
          boxShadow:
            '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
        })}
      >
        <RxSelect.ScrollUpButton>
          <ChevronUpIcon />
        </RxSelect.ScrollUpButton>

        <RxSelect.Viewport
          className={css({
            bg: 'background.accent',
            p: 3,
            overflow: 'auto',
            rounded: 'sm',
            width: '100%',
            shadow: 'md',
          })}
        >
          {map(values, (val, key) => (
            <SelectItem key={key} value={key} currentValue={value}>
              {val}
            </SelectItem>
          ))}

          <RxSelect.Separator />
        </RxSelect.Viewport>

        <RxSelect.ScrollDownButton>
          <ChevronDownIcon />
        </RxSelect.ScrollDownButton>
      </RxSelect.Content>
    </RxSelect.Root>
  );
};

export default Select;
