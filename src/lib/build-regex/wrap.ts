/**
 * Bọc chuỗi search trong ngoặc kép NẾU có dấu cách.
 *
 * Trong ô search của POE, dấu cách tách thành nhiều mẫu riêng (logic AND).
 * Muốn dấu cách là ký tự thật (vd token "imum L" khớp "maximum Life") thì phải
 * bọc cả cụm trong "...". Toán tử | (OR) vẫn hoạt động bên trong ngoặc.
 * Nếu không có dấu cách thì để trần cho gọn (tiết kiệm 2 ký tự).
 */
export function wrapSearch(body: string): string {
  return body.includes(' ') ? `"${body}"` : body;
}
