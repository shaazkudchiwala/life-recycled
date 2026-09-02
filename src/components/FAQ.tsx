import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "Is organ donation the same as body donation?",
    answer: "No. Organ donation helps save lives through transplantation. Body donation is for medical education or research. They are separate and independent choices."
  },
  {
    question: "Will organ donation delay the funeral?",
    answer: "No. Organ donation does not significantly delay funeral arrangements. After the medical process is completed, the body is returned to the family so last rites can proceed normally."
  },
  {
    question: "Will the body be cut or disfigured?",
    answer: "No visible disfigurement occurs. Organ retrieval is done respectfully, and the body is carefully reconstructed. Families can still perform all customary rituals."
  },
  {
    question: "Can my family see me and perform last rites after donation?",
    answer: "Yes. Families can see the body, perform last rites, and follow religious or cultural practices as usual."
  },
  {
    question: "Is organ donation allowed in my religion?",
    answer: "Most major religions in India support organ donation as an act of saving life and compassion. Individuals are encouraged to consult their religious leaders if unsure."
  },
  {
    question: "Can doctors stop trying to save me if I am a registered donor?",
    answer: "No. The medical team treating you is completely separate from transplant teams. Doctors always prioritize saving your life."
  },
  {
    question: "Will my family have to pay any money?",
    answer: "No. There is no cost to the donor's family for organ donation."
  },
  {
    question: "Can organs be sold or misused?",
    answer: "No. Organ donation in India is strictly regulated by law and managed through government-authorized systems like NOTTO."
  },
  {
    question: "Who makes the final decision at the time of death?",
    answer: "The family is consulted at the time. Registering helps make your wishes clear and supports your family in honoring that decision."
  },
  {
    question: "Can I change my decision later?",
    answer: "Yes. Registration is voluntary and can be updated or withdrawn at any time through official channels."
  },
  {
    question: "What if I die at home or in an accident?",
    answer: "In such cases, you should be immediately taken to a hospital. Organ donation depends on medical conditions at the time of death. Hospitals and authorities assess feasibility when the situation arises."
  },
  {
    question: "Is there an age limit or medical restriction?",
    answer: "No one is automatically excluded. Medical suitability is determined only at the time of donation."
  },
  {
    question: "What if I have health problems or medical conditions?",
    answer: "Having medical conditions does not automatically disqualify you. Suitability is determined only at the time of donation."
  },
  {
    question: "Can I choose which organs or tissues to donate?",
    answer: "Yes. You can choose specific organs or tissues while registering."
  },
  {
    question: "Can I donate organs but not tissues, or vice versa?",
    answer: "Yes. Organ donation and tissue donation can be selected separately."
  },
  {
    question: "Are reproductive organs or bone marrow donated?",
    answer: "No. Reproductive organs, bone marrow, or organs that affect lineage are not transplanted."
  },
  {
    question: "Is brain donation or spinal cord donation possible?",
    answer: "Brain and spinal cord are not transplanted for organ donation. They may be considered only under separate body donation or research programs."
  },
  {
    question: "Does registering mean my organs will definitely be donated?",
    answer: "No. Donation depends on medical suitability and family consent at the time."
  },
  {
    question: "What if my family disagrees with my decision?",
    answer: "Medical teams discuss the decision with the family at the time. Having your wishes registered helps guide these conversations."
  },
  {
    question: "Does organ donation affect how death is certified?",
    answer: "No. Death certification follows standard medical and legal procedures, independent of donation."
  },
  {
    question: "Is organ donation only after brain death?",
    answer: "Organ donation usually occurs after brain death. Tissue donation may be possible after cardiac death, depending on circumstances."
  },
  {
    question: "Is this registration binding or compulsory?",
    answer: "No. Registration expresses your intent. It is voluntary and not legally binding."
  },
];

interface FAQProps {
  initialVisibleCount?: number;
}

export function FAQ({ initialVisibleCount = 8 }: FAQProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visibleFaqs = showAll ? faqData : faqData.slice(0, initialVisibleCount);
  const remainingCount = faqData.length - initialVisibleCount;

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full space-y-3">
        {visibleFaqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="border border-border rounded-xl px-6 data-[state=open]:bg-muted/30"
          >
            <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline py-5 text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-base">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {!showAll && remainingCount > 0 && (
        <div className="text-center pt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(true)}
            className="gap-2"
            size="lg"
          >
            More questions ({remainingCount} more)
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
