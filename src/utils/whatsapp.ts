export const WHATSAPP_PHONE_DISPLAY = '01306318949';
export const WHATSAPP_PHONE_INTERNATIONAL = '8801306318949';

export const JM_FASHION_PREFILLED_MESSAGE = `আসসালামু আলাইকুম 🌸
JM FASHION থেকে স্বাগতম।
আমাদের কাছে বর্তমানে সব ধরনের কালার স্টকে available আছে।
আপনি যদি অর্ডার করতে চান, তাহলে সরাসরি WhatsApp-এ অর্ডার করতে পারেন অথবা আমাদের website থেকে অর্ডার করতে পারেন।

💰 Price:
১ পিস — ১২০৳
৫ পিস — ৫০০৳

📏 Size: Free Size

ধন্যবাদ ❤️`;

export interface WhatsAppMessageParams {
  orderNumber?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  thana?: string;
  preferredColors?: string;
  deliveryZone?: string;
  productName?: string;
  colorNameBn?: string;
  colorNameEn?: string;
  selectedColors?: Array<{ colorNameBn: string; quantity: number }>;
  size?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number;
  customText?: string;
}

export function createWhatsAppUrl(params?: WhatsAppMessageParams): string {
  if (params?.customText) {
    return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(params.customText)}`;
  }

  if (params?.orderNumber || params?.productName || params?.customerName) {
    const colorLine = params.preferredColors
      ? `🎨 পছন্দের কালারসমূহ: ${params.preferredColors}`
      : (params.selectedColors && params.selectedColors.length > 1
        ? `🎨 বাছাইকৃত কালারসমূহ:\n${params.selectedColors.map(c => `   • ${c.colorNameBn}: ${c.quantity} পিস`).join('\n')}`
        : (params.colorNameBn ? `🎨 কালার: ${params.colorNameBn}` : ''));

    const textLines = [
      `আসসালামু আলাইকুম JM FASHION 🌸`,
      params.orderNumber ? `আমি ওয়েবসাইট থেকে একটি নতুন অর্ডার করেছি:` : `আমি সরাসরি WhatsApp-এ অর্ডার করতে চাই:`,
      ``,
      params.orderNumber ? `📦 অর্ডার নম্বর: #${params.orderNumber}` : '',
      `👤 কাস্টমার নাম: ${params.customerName || 'সম্মানিত গ্রাহক'}`,
      params.phone ? `📱 মোবাইল: ${params.phone}` : '',
      params.thana ? `🏛️ থানা: ${params.thana}` : '',
      params.address ? `📍 ঠিকানা: ${params.address}` : '',
      params.deliveryZone ? `🚚 ডেলিভারি এলাকা: ${params.deliveryZone === 'inside_dhaka' ? 'ঢাকার মধ্যে' : 'ঢাকার বাইরে'}` : '',
      colorLine,
      ``,
      params.productName ? `👗 পণ্য: ${params.productName}` : '',
      params.quantity ? `🔢 পরিমাণ: ${params.quantity} পিস` : '',
      params.unitPrice ? `💵 ১ পিস মূল্য: ৳${params.unitPrice}` : '',
      params.subtotal ? `🧾 সাবটোটাল: ৳${params.subtotal}` : '',
      params.deliveryFee !== undefined ? `🚚 ডেলিভারি চার্জ: ৳${params.deliveryFee}` : '',
      params.totalAmount ? `💰 সর্বমোট বিল: ৳${params.totalAmount}` : '',
      `অনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন। ধন্যবাদ! ❤️`
    ].filter(line => line !== null && line !== undefined && line !== '');

    return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(textLines.join('\n').trim())}`;
  }

  return `https://wa.me/${WHATSAPP_PHONE_INTERNATIONAL}?text=${encodeURIComponent(JM_FASHION_PREFILLED_MESSAGE.trim())}`;
}
