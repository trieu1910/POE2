import type { SlotResult } from './types';
import { parseBuild } from './parse';
import { buildIngameRegex } from './regex';
import { buildTradeList } from './trade';

export interface GenerateOptions {
  /** Lọc ô đồ theo level. Bỏ trống = lấy tất cả. */
  level?: number;
  /** Giới hạn ký tự cho ô search trong game. */
  charLimit?: number;
}

export function generate(jsonText: string, opts: GenerateOptions = {}): SlotResult[] {
  const build = parseBuild(jsonText);
  const slots =
    opts.level == null
      ? build.slots
      : build.slots.filter(
          (s) => opts.level! >= s.levelInterval[0] && opts.level! <= s.levelInterval[1],
        );

  return slots.map((slot) => ({
    slot,
    ingameRegex: buildIngameRegex(slot, opts.charLimit ?? 50),
    trade: buildTradeList(slot),
  }));
}

export { parseBuild, BuildParseError } from './parse';
export { buildCombined } from './combined';
export type { CombinedRegex } from './combined';
export type { SlotResult, ParsedSlot } from './types';
