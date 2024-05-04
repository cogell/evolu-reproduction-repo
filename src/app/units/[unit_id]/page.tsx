import { UnitId } from '../../_lib/Db';
import Content from './Content';

export default function Page({
  params: { unit_id },
}: {
  params: {
    unit_id: UnitId;
  };
}) {
  return <Content unit_id={unit_id} />;
}
