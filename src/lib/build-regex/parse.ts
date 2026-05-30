import type { ParsedBuild, ParsedSlot, NormalizedAffix } from './types';
import { normalizeAffix } from './normalize';

export class BuildParseError extends Error {}

/** Bỏ markup POE dạng <tag>{...}. */
function stripMarkup(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/[{}]/g, '');
}

function parseSlot(raw: unknown): ParsedSlot {
  const r = (raw ?? {}) as Record<string, unknown>;
  const text = stripMarkup(String(r.additional_text ?? ''));
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const baseLine = lines[0] ?? '';
  const classMatch = baseLine.match(/\(([^)]*Base)\)/);
  const baseClass = classMatch?.[1];
  const base = baseLine.replace(/\s*\([^)]*Base\)\s*/, '').trim();

  const affixes: NormalizedAffix[] = lines
    .map((l) => l.match(/^\d+\.\s*(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => normalizeAffix(m[1]));

  const li = r.level_interval;
  const levelInterval: [number, number] =
    Array.isArray(li) && li.length === 2 ? [Number(li[0]), Number(li[1])] : [1, 100];

  return {
    inventoryId: String(r.inventory_id ?? ''),
    base,
    baseClass,
    uniqueName: r.unique_name ? String(r.unique_name) : undefined,
    levelInterval,
    affixes,
  };
}

export function parseBuild(jsonText: string): ParsedBuild {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    throw new BuildParseError('File không đọc được — đảm bảo đây là file .build hợp lệ.');
  }
  const rawSlots = data.inventory_slots;
  if (!Array.isArray(rawSlots)) {
    throw new BuildParseError('File này không có phần đồ (inventory).');
  }
  return {
    name: String(data.name ?? ''),
    ascendancy: data.ascendancy ? String(data.ascendancy) : undefined,
    slots: rawSlots.map(parseSlot),
  };
}
