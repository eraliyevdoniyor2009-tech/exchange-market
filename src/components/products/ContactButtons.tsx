// src/components/products/ContactButtons.tsx
"use client";

import { useState } from "react";
import { Phone, Send, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTelegramLink, getPhoneLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ContactButtonsProps {
  phone?: string | null;
  telegram?: string | null;
  sellerName: string;
  productTitle: string;
}

export function ContactButtons({
  phone,
  telegram,
  sellerName,
  productTitle,
}: ContactButtonsProps) {
  const [phoneRevealed, setPhoneRevealed]       = useState(false);
  const [telegramRevealed, setTelegramRevealed] = useState(false);
  const [phoneCopied, setPhoneCopied]           = useState(false);

  const handleCopyPhone = async () => {
    if (!phone) return;
    await navigator.clipboard.writeText(phone);
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  // Mask phone: show first 4 and last 2 digits
  const maskedPhone = phone
    ? phone.slice(0, 4) + " *** " + phone.slice(-2)
    : null;

  const hasNoContact = !phone && !telegram;

  if (hasNoContact) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          This seller has not added contact information yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Phone button */}
      {phone && (
        <div className="space-y-2">
          {!phoneRevealed ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-gray-300 hover:border-brand-400 hover:bg-brand-50 group"
              onClick={() => setPhoneRevealed(true)}
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <Phone className="w-4 h-4 text-green-700" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-gray-400 font-normal leading-none mb-0.5">Phone number</p>
                <p className="text-sm font-semibold text-gray-700">{maskedPhone}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-600 font-medium shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Show
              </div>
            </Button>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
              {/* Revealed phone number */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-600 font-medium leading-none mb-0.5">Phone number</p>
                  <p className="text-lg font-bold text-gray-900 tracking-wide">{phone}</p>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    phoneCopied
                      ? "bg-green-200 text-green-800"
                      : "bg-white border border-green-200 text-green-700 hover:bg-green-100"
                  )}
                >
                  {phoneCopied ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy</>
                  )}
                </button>
              </div>

              {/* Call CTA */}
              <a href={getPhoneLink(phone)} className="block">
                <div className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white transition-colors cursor-pointer">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">Call {sellerName}</span>
                </div>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Telegram button */}
      {telegram && (
        <div>
          {!telegramRevealed ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-gray-300 hover:border-[#2AABEE] hover:bg-blue-50 group"
              onClick={() => setTelegramRevealed(true)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <TelegramIcon className="w-4 h-4 text-[#2AABEE]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-gray-400 font-normal leading-none mb-0.5">Telegram</p>
                <p className="text-sm font-semibold text-gray-700">
                  @{"*".repeat(Math.min(telegram.length, 8))}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#2AABEE] font-medium shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Show
              </div>
            </Button>
          ) : (
            <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TelegramIcon className="w-4 h-4 text-[#2AABEE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium leading-none mb-0.5">Telegram</p>
                  <p className="text-lg font-bold text-gray-900">@{telegram}</p>
                </div>
              </div>

              <a
                href={getTelegramLink(telegram)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center justify-center gap-2 py-3 bg-[#2AABEE] hover:bg-[#229ED9] active:bg-[#1a8dc4] text-white transition-colors cursor-pointer">
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-semibold">Message on Telegram</span>
                </div>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Privacy note */}
      <p className="text-xs text-gray-400 text-center pt-1">
        Contact info is revealed when you tap — no registration required
      </p>
    </div>
  );
}

// Inline Telegram SVG icon (no external dependency)
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
