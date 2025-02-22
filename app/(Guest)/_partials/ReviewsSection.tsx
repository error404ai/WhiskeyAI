import Section from "@/components/Section/Section";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { JSX, SVGProps } from "react";

export default function ReviewsSection() {
  return (
    <Section>
      <div className="container px-4 md:px-6">
        <div className="grid gap-8">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold md:text-3xl">Product Reviews</h2>
            <p className="text-muted-foreground">See what our customers have to say about this product.</p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-muted/40 h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="font-semibold">Jane Doe</h4>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-muted stroke-muted-foreground h-4 w-4" />
                      <StarIcon className="fill-muted stroke-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">This product is amazing! It has exceeded all my expectations and I highly recommend it to anyone looking for a high-quality and reliable product.</p>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-muted/40 h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="font-semibold">John Smith</h4>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-muted stroke-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">I am extremely satisfied with this product. The quality is top-notch and it has exceeded all my expectations. I highly recommend it to anyone looking for a reliable and durable product.</p>
              </Card>
              <Card className="p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-muted/40 h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="font-semibold">Sarah Lee</h4>
                    <div className="text-muted-foreground flex items-center gap-1 text-sm">
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-primary h-4 w-4" />
                      <StarIcon className="fill-muted stroke-muted-foreground h-4 w-4" />
                      <StarIcon className="fill-muted stroke-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">I am very pleased with this product. It is well-made and performs exactly as advertised. I would definitely recommend it to anyone looking for a high-quality product.</p>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function StarIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
