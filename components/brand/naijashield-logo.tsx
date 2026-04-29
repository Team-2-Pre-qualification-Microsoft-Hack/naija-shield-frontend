import { cn } from "@/lib/utils";

type NaijaShieldLogoProps = {
  showText?: boolean;
  markSize?: number;
  textClassName?: string;
  className?: string;
};

export default function NaijaShieldLogo({
  showText = true,
  markSize = 36,
  textClassName,
  className,
}: NaijaShieldLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        className="rounded-lg flex items-center justify-center"
        style={{
          width: markSize,
          height: markSize,
          background: "linear-gradient(145deg, #18182a 0%, #0f0f1a 100%)",
          border: "1px solid #1a1a2e",
        }}
      >
        <svg width={markSize * 0.56} height={markSize * 0.56} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5L4.5 6.1V10.3C4.5 15.2 7.7 19.5 12 21.2C16.3 19.5 19.5 15.2 19.5 10.3V6.1L12 2.5Z"
            fill="#e8581a"
          />
          <path
            d="M9.4 12.2L11.3 14.1L14.9 10.5"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.8 8.9C8.1 7.4 10 6.4 12 6.4C14 6.4 15.9 7.4 17.2 8.9"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={cn("font-semibold tracking-tight", textClassName)}
          style={{ color: "#f5ede8" }}
        >
          NaijaShield
        </span>
      )}
    </div>
  );
}
