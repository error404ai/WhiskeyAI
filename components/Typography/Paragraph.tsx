import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const paragraphVariants = cva("leading-normal", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
    },
    variant: {
      normal: "",
      muted: "text-muted",
      highlighted: "bg-highlight",
    },
  },
  defaultVariants: {
    size: "base",
    variant: "normal",
  },
});

const commontClassName = "scroll-m-20";

export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof paragraphVariants> & {
    children: React.ReactNode;
    center?: boolean;
  };

const Paragraph: React.FC<ParagraphProps> = ({ size, variant, center, className, children, ...props }) => {
  return (
    <p className={cn(commontClassName, { "text-center": center }, paragraphVariants({ size, variant }), className)} {...props}>
      {children}
    </p>
  );
};

export default Paragraph;
