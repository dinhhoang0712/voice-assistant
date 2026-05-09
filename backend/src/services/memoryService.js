import { MEMORY_RULES } from "../constant/memory_patterns.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../repository/userRepository.js";
import { normalizeText } from "../utils/helper.js";

function isInvalidMemoryValue(value) {
  const invalid = ["gì", "bao nhiêu", "ở đâu", "khi nào", "là ai", "thế nào"];
  return invalid.some((k) => value.includes(k));
}

async function saveMemory(userId, field, value) {
  const profile = await getUserProfile(userId);
  const oldValue = profile[field];

  // hobbies array
  if (field === "hobbies") {
    const hobbies = new Set(profile.hobbies || []);
    hobbies.add(value);

    await updateUserProfile(userId, {
      hobbies: [...hobbies],
    });

    return `Đã thêm sở thích: ${value}.`;
  }

  // normal field update
  if (oldValue && oldValue !== value) {
    await updateUserProfile(userId, {
      [field]: value,
    });

    return `Đã cập nhật ${field} từ ${oldValue} thành ${value}.`;
  }

  await updateUserProfile(userId, {
    [field]: value,
  });

  return null;
}

export async function handlePersonalization(userId, text) {
  text = normalizeText(text);

  /* Rule-based extraction */
  for (const rule of MEMORY_RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (!match) continue;

      const value = match[1]?.trim();
      if (!value || isInvalidMemoryValue(value)) return null;

      const msg = await saveMemory(userId, rule.field, value);

      if (msg) return msg;

      return rule.template.replace("{}", value);
    }
  }

  return null;
}
