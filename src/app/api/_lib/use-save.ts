import { useEffect, useState } from 'react';

export default function useSave(
  die_off: number = 2000,
): [boolean, () => void, () => void] {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      setTimeout(() => {
        setSaved(false);
      }, die_off);
    }
  }, [saved]);

  const onSave = () => {
    setSaved(true);
  };

  const onChange = () => {
    setSaved(false);
  };

  return [saved, onSave, onChange];
}
