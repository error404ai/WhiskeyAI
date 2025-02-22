import { cn } from "@/lib/utils"; // Assuming `cn` is a utility function for class names
import { cva, VariantProps } from "class-variance-authority";

const titleVariants = cva("font-bold leading-tight", {
  variants: {
    size: {
      base: "text-xl leading-7",
      lg: "text-3xl leading-[1.3]",
      xl: "text-5xl leading-[1.3]",
    },
    variant: {
      normal: "",
      underlined: "border-b ",
      blockquote: "border-l-2 pl-6 italic",
    },
  },
  defaultVariants: {
    size: "xl",
    variant: "normal",
  },
});

const commontClassName = "scroll-m-20 font-extrabold tracking-tight";

export type TitleProps = React.HTMLAttributes<HTMLHeadingElement | HTMLQuoteElement> &
  VariantProps<typeof titleVariants> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
    children: React.ReactNode;
    center?: boolean;
  };

const Title: React.FC<TitleProps> = ({ size, variant, center, as = "h2", className, children, ...props }) => {
  const Comp = as;
  return (
    <Comp className={cn(commontClassName, { "text-center": center }, titleVariants({ size, variant }), className)} {...props}>
      {children}
    </Comp>
  );
};

export default Title;
