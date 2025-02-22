import { cn } from "@/lib/utils"; // Assuming `cn` is a utility function for class names
import { cva, VariantProps } from "class-variance-authority";

const sectionVariants = cva("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", {
  variants: {
    space: {
      none: "py-0",
      sm: "py-5",
      md: "py-9",
      lg: "py-12",
    },
  },
  defaultVariants: {
    space: "md",
  },
});

const commonClassName = "scroll-m-20 space-y-6";

export type SectionProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof sectionVariants> & {
    as?: "div" | "section";
    children: React.ReactNode;
  };

const Section: React.FC<SectionProps> = ({ space, as = "div", className, children, ...props }) => {
  const Comp = as;

  return (
    <Comp className={cn(commonClassName, sectionVariants({ space }), className)} {...props}>
      {children}
    </Comp>
  );
};

export default Section;
