import { Button } from '../ui/Button';

export function SaveSlotList({ saves, onLoad, onDelete }: any) {
  if (!saves || saves.length === 0) return <div className="text-muted italic text-sm">No saves found.</div>;
  return (
    <div className="space-y-2">
      {saves.map((s: any) => (
        <div key={s.id} className="flex justify-between items-center border border-gold/15 p-3 rounded-sm bg-black/20">
          <div>
            <div className="text-ink h-serif">{s.characterName}</div>
            <div className="text-xs text-muted">{s.className} Lv.{s.level}</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onLoad(s.id)}>Load</Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(s.id)}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SaveSlotCard() { return null; }