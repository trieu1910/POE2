export interface NormalizedAffix {
  /** Dòng affix gốc (đã bỏ markup, bỏ số thứ tự). */
  raw: string;
  /** Khóa chuẩn để tra bảng — luôn lowercase, không %, không +. */
  key: string;
  /** Nhãn hiển thị cho người đọc. */
  label: string;
}

export interface ParsedSlot {
  inventoryId: string;
  base: string;
  baseClass?: string;
  uniqueName?: string;
  levelInterval: [number, number];
  affixes: NormalizedAffix[];
}

export interface ParsedBuild {
  name: string;
  ascendancy?: string;
  slots: ParsedSlot[];
}

export type Confidence = 'high' | 'low';

export interface AffixToken {
  token: string;
  confidence: Confidence;
}

export interface IngameRegex {
  regex: string;
  length: number;
  included: string[];
  dropped: string[];
  warnings: string[];
}

export interface SlotResult {
  slot: ParsedSlot;
  ingameRegex: IngameRegex | null;
  trade: { mustHave: string[]; niceToHave: string[] };
}
