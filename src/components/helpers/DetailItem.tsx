import { memo } from "react";

const DetailItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) => (
  <div>
    <p className="text-muted-foreground">{label}</p>
    <p
      className={`font-medium ${highlight ? "text-emerald-600 text-base" : ""}`}
    >
      {value}
    </p>
  </div>
);

export default memo(DetailItem);
