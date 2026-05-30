const LABELS: Record<string, string> = {
  Belt1: 'Thắt lưng',
  Amulet1: 'Dây chuyền',
  BodyArmour1: 'Giáp thân',
  Gloves1: 'Găng tay',
  Helm1: 'Mũ',
  Offhand1: 'Bao tên/Khiên',
  Offhand2: 'Bao tên/Khiên (phụ)',
  Trinket1: 'Charm',
  Flask1: 'Bình',
  Ring1: 'Nhẫn 1',
  Ring2: 'Nhẫn 2',
  Boots1: 'Giày',
  Weapon1: 'Vũ khí',
  Weapon2: 'Vũ khí (phụ)',
};

export function slotLabel(id: string): string {
  return LABELS[id] ?? id;
}
