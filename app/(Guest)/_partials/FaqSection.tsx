import Section from "@/components/Section/Section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqSection() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Got a question? We&apos;ve got answers. Check out our FAQ to find out more about our product and services.</p>
      </div>
      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>What is the return policy for your products?</AccordionTrigger>
            <AccordionContent>
              <p>We offer a 30-day return policy on all of our products. If you&apos;re not satisfied with your purchase, you can return it for a full refund within 30 days of delivery. Please note that items must be in their original condition and packaging to be eligible for a return.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How long does it take to receive my order?</AccordionTrigger>
            <AccordionContent>
              <p>We typically ship orders within 1-2 business days of receiving them. Delivery times can vary depending on your location, but most orders arrive within 3-5 business days for standard shipping. We also offer expedited shipping options for faster delivery.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Do you offer any discounts or promotions?</AccordionTrigger>
            <AccordionContent>
              <p>Yes, we offer a variety of discounts and promotions throughout the year. You can find our current offers on our website or by signing up for our email newsletter. We also offer bulk discounts for larger orders, so feel free to reach out to our sales team if you have any questions.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
            <AccordionContent>
              <p>We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. We also accept PayPal and Apple Pay for added convenience. All of our payment transactions are secured with industry-standard encryption to protect your personal and financial information.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Do you offer any warranty or guarantee on your products?</AccordionTrigger>
            <AccordionContent>
              <p>Yes, we offer a 1-year warranty on all of our products. If you experience any issues with your purchase, please contact our customer support team and we&apos;ll be happy to assist you. We stand behind the quality of our products and are committed to ensuring your satisfaction.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Section>
  );
}
