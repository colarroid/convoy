import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Veesaa Terms of Use',
  description: 'The terms governing your access to and use of Veesaa, a community carpooling coordination service operating in Nigeria and Canada.',
}

type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string }

interface Section {
  n: number
  title: string
  blocks: Block[]
}

const SECTIONS: Section[] = [
  {
    n: 1,
    title: 'Introduction and acceptance',
    blocks: [
      { type: 'p', text: 'Welcome to Veesaa (the “Platform”), a community carpooling coordination service operated by VZA Technologies Limited (“Veesaa”, “we”, “us”, or “our”). Veesaa operates in Nigeria and Canada, and these Terms apply to all users in both countries.' },
      { type: 'p', text: 'These Terms of Use (“Terms”) govern your access to and use of the Platform, including our website and any associated web application. By creating an account, entering a community code, or otherwise using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not use the Platform.' },
      { type: 'p', text: 'The Platform is currently offered as a pilot (MVP) and is provided on an “as is” and “as available” basis. Features may change, be limited, or be withdrawn during this period.' },
    ],
  },
  {
    n: 2,
    title: 'Definitions',
    blocks: [
      { type: 'list', items: [
        '“Platform” is the Veesaa website and web application through which Users coordinate shared trips within communities they have access to.',
        '“User” / “you” is aperson who has registered a Veesaa account.',
        '“Community” is aclosed group (for example, an organisation, club, workplace, or neighbourhood) identified by a unique Community Code. Communities are created and managed outside the Platform, on a separate administrative system; the Platform reads communities and validates codes but does not create them.',
        '“Community Code” is acode that grants access to a specific Community. Holding a valid code is an access pass, not fixed membership: a User may hold access to more than one Community by entering more than one code.',
        '“Host” is aUser who offers a trip and may carry other Users.',
        '“Rider” is aUser who requests to join a Host’s trip.',
        '“Trip” is ajourney to a shared destination posted by a Host within a Community.',
      ] },
      { type: 'p', text: 'There are no fixed account roles. The same User may act as a Host on one trip and a Rider on another; “Host” and “Rider” describe a User’s role on a particular trip, not a type of account.' },
    ],
  },
  {
    n: 3,
    title: 'Eligibility',
    blocks: [
      { type: 'p', text: 'To use the Platform you must:' },
      { type: 'list', items: [
        'be at least 18 years of age, or the age of majority in your province or jurisdiction if it is higher;',
        'hold a valid Community Code granting access to at least one Community;',
        'provide accurate, current, and complete information when registering; and',
        'have the legal capacity to enter into these Terms.',
      ] },
      { type: 'p', text: 'We may suspend or terminate accounts that do not meet these requirements.' },
    ],
  },
  {
    n: 4,
    title: 'Nature of the service (important)',
    blocks: [
      { type: 'callout', text: 'The Platform is a coordination tool, not a transport provider. We do not provide transportation services, operate vehicles, employ or engage drivers, or act as a taxi, ride-hailing, or e-hailing operator. Our sole role is to provide technology that enables Users of the same Community to find one another and arrange shared trips voluntarily.' },
      { type: 'p', text: 'Rides are free. The Platform does not charge Riders for rides, does not process payments for rides, and does not take any commission, fare, or fee on any trip. Trips arranged through the Platform are a non-commercial, community lift-sharing arrangement between Users. Hosts must not demand or charge a fare as a condition of a ride.' },
      { type: 'p', text: 'We do not guarantee that any Trip will be available, that any request will be accepted, that any Host or Rider will arrive, or that any Trip will take place as arranged. All arrangements are made between Users at their own discretion and risk.' },
    ],
  },
  {
    n: 5,
    title: 'Accounts and community codes',
    blocks: [
      { type: 'p', text: 'You are responsible for maintaining the confidentiality of your account and any Community Code you hold. A Community Code grants access to a Community, and you may hold access to more than one Community. You agree:' },
      { type: 'list', items: [
        'not to share a Community Code with anyone who is not a genuine member of that Community;',
        'not to use a Community Code you are not authorised to use;',
        'to notify us promptly of any unauthorised use of your account or a Code; and',
        'that you are responsible for all activity carried out under your account.',
      ] },
      { type: 'p', text: 'Community Codes are the means by which Communities remain closed and trusted. Misuse of a Code, including distributing it outside the Community, may result in suspension of your account and may compromise the safety of other Users.' },
    ],
  },
  {
    n: 6,
    title: 'User conduct',
    blocks: [
      { type: 'p', text: 'When using the Platform you agree to:' },
      { type: 'list', items: [
        'provide truthful and accurate information about yourself, your vehicle, your trip, and your location;',
        'treat other Users with respect and behave lawfully and safely at all times;',
        'use the Platform only for genuine, non-commercial trip coordination within your Community;',
        'honour arrangements you make, and communicate promptly if you cannot;',
        'not use the Platform to harass, endanger, defraud, or harm any other person;',
        'not impersonate any person or misrepresent your affiliation with a Community; and',
        'not use the Platform for any commercial transport operation or to charge fares.',
      ] },
    ],
  },
  {
    n: 7,
    title: 'Hosts’ responsibilities',
    blocks: [
      { type: 'p', text: 'If you offer a Trip as a Host, you are solely responsible for ensuring that:' },
      { type: 'list', items: [
        'you hold a valid driver’s licence and are legally permitted to drive;',
        'your vehicle is roadworthy, properly registered, and maintained;',
        'you hold valid and adequate motor insurance appropriate to your use of the vehicle, and you understand that ordinary private motor insurance may not cover the carrying of passengers, so you are responsible for confirming your own coverage;',
        'you drive safely and comply with all applicable traffic and transport laws; and',
        'you do not charge or accept a fare for the ride.',
      ] },
      { type: 'p', text: 'Where you choose to fulfil a Trip using a third-party hired vehicle (for example, a ride-hailing service), you remain responsible for the arrangement, and you acknowledge that the third-party provider and its driver are outside our control.' },
    ],
  },
  {
    n: 8,
    title: 'Riders’ responsibilities',
    blocks: [
      { type: 'p', text: 'If you join a Trip as a Rider, you agree to:' },
      { type: 'list', items: [
        'provide accurate location and contact information;',
        'be present at the agreed pickup point at the agreed time, and communicate promptly if your plans change;',
        'behave respectfully and safely during the Trip; and',
        'exercise your own judgement about whether to accept or continue any ride.',
      ] },
    ],
  },
  {
    n: 9,
    title: 'Trips, requests, and cancellations',
    blocks: [
      { type: 'p', text: 'Hosts post Trips and may approve or decline requests at their discretion. Available seats are limited and may be filled by other Riders. The Platform does not guarantee a match, a seat, or a completed journey. Either party may cancel an arrangement; we encourage Users to communicate cancellations promptly and courteously, but we are not responsible for cancellations, no-shows, or delays.' },
    ],
  },
  {
    n: 10,
    title: 'Safety and assumption of risk',
    blocks: [
      { type: 'callout', text: 'You use the Platform and participate in Trips at your own risk. We do not supervise, accompany, or control any Trip. We do not verify the identity, character, driving ability, vehicle condition, or insurance status of any User. Information shown on the Platform, including a User’s name, photo, or number of completed rides, is generated by Users and the system for convenience only and is not a verification, endorsement, or guarantee of any person’s reliability or safety.' },
      { type: 'p', text: 'You are responsible for taking sensible precautions, exercising your own judgement, and complying with the law. If you experience or witness unsafe or inappropriate behaviour, you should use the Platform’s reporting tools and, where appropriate, contact the relevant authorities.' },
    ],
  },
  {
    n: 11,
    title: 'No vetting or endorsement',
    blocks: [
      { type: 'p', text: 'We do not conduct background checks, identity verification beyond validating a Community Code, driving-record checks, or vehicle inspections. Holding a valid Community Code indicates only that a User has access to a Community; it is not a warranty of trustworthiness. Any reliance you place on another User is at your own risk.' },
    ],
  },
  {
    n: 12,
    title: 'Privacy and data protection',
    blocks: [
      { type: 'p', text: 'We collect and process personal data, including your name, contact details, and location information, in order to operate the Platform. Our handling of personal data is described in our Privacy Policy, which forms part of these Terms and is intended to comply with the Nigeria Data Protection Act, 2023 (for users in Nigeria) and Canada’s PIPEDA and applicable provincial privacy laws (for users in Canada). By using the Platform you consent to the collection and processing of your data as described in that policy.' },
    ],
  },
  {
    n: 13,
    title: 'Intellectual property',
    blocks: [
      { type: 'p', text: 'All rights in the Platform, including its software, design, branding, and content (excluding content you submit), belong to Veesaa or its licensors. You may not copy, modify, distribute, or create derivative works from the Platform without our written permission. You retain ownership of information you submit, and grant us a licence to use it as necessary to operate the Platform.' },
    ],
  },
  {
    n: 14,
    title: 'Third-party services',
    blocks: [
      { type: 'p', text: 'The Platform may rely on or link to third-party services (for example, mapping providers or hired-ride services). We do not control and are not responsible for third-party services, and their use is subject to their own terms.' },
    ],
  },
  {
    n: 15,
    title: 'Disclaimers',
    blocks: [
      { type: 'p', text: 'To the fullest extent permitted by law, the Platform is provided “as is” and “as available”, without warranties of any kind, whether express or implied, including any warranty of merchantability, fitness for a particular purpose, reliability, availability, or that the Platform will be uninterrupted or error-free. As an MVP, the Platform may contain bugs, incomplete features, or inaccuracies.' },
    ],
  },
  {
    n: 16,
    title: 'Limitation of liability',
    blocks: [
      { type: 'p', text: 'To the fullest extent permitted by law, Veesaa, its directors, employees, and agents will not be liable for any loss, injury, death, damage, or claim arising out of or in connection with:' },
      { type: 'list', items: [
        'any Trip, including the conduct of any Host or Rider, any accident, or any act or omission of any User;',
        'any failure to obtain a match, a seat, or a completed journey;',
        'any reliance on information provided by a User or displayed on the Platform; or',
        'any interruption, error, or unavailability of the Platform.',
      ] },
      { type: 'p', text: 'Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited.' },
    ],
  },
  {
    n: 17,
    title: 'Indemnification',
    blocks: [
      { type: 'p', text: 'You agree to indemnify and hold harmless Veesaa and its directors, employees, and agents from any claim, loss, liability, or expense (including reasonable legal fees) arising from your use of the Platform, your participation in any Trip, your breach of these Terms, or your violation of any law or the rights of any person.' },
    ],
  },
  {
    n: 18,
    title: 'Suspension and termination',
    blocks: [
      { type: 'p', text: 'We may suspend or terminate your access to the Platform, or remove you from a Community, at any time and without notice, including where we believe you have breached these Terms, misused a Community Code, or posed a risk to other Users. You may stop using the Platform and close your account at any time.' },
    ],
  },
  {
    n: 19,
    title: 'Changes to these terms',
    blocks: [
      { type: 'p', text: 'We may update these Terms from time to time. Where changes are material, we will take reasonable steps to notify Users. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.' },
    ],
  },
  {
    n: 20,
    title: 'Governing law and disputes',
    blocks: [
      { type: 'p', text: 'The law that governs these Terms, and the place where disputes are resolved, depend on where you are located:' },
      { type: 'list', items: [
        'If you are in Nigeria, these Terms are governed by the laws of the Federal Republic of Nigeria, and disputes are subject to the jurisdiction of the courts of Lagos State.',
        'If you are in Canada, these Terms are governed by the laws of the province or territory in which you reside and the federal laws of Canada applicable there, and disputes are subject to the jurisdiction of the courts of that province or territory.',
      ] },
      { type: 'p', text: 'In each case, the parties agree to attempt to resolve disputes amicably before commencing any legal proceedings. Nothing in this section deprives you of the protection of mandatory consumer-protection laws that apply where you live.' },
    ],
  },
  {
    n: 21,
    title: 'Contact',
    blocks: [
      { type: 'p', text: 'For questions about these Terms, contact us at support@veesaa.co.' },
    ],
  },
]

function BlockView({ block }: { block: Block }) {
  if (block.type === 'p') {
    return <p className="text-[15px] text-gray-700 leading-relaxed mb-4">{block.text}</p>
  }
  if (block.type === 'callout') {
    return (
      <div className="border-l-4 border-black bg-gray-50 rounded-r-xl px-4 py-3 mb-4">
        <p className="text-[15px] text-black font-medium leading-relaxed">{block.text}</p>
      </div>
    )
  }
  return (
    <ul className="mb-4 space-y-2">
      {block.items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] text-gray-700 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Legal</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Terms of Use</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400 mb-10">
            <span>Effective date: 3rd of July, 2026</span>
            <span>Last updated: 4th of July, 2026</span>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map(section => (
              <section key={section.n} id={`section-${section.n}`} className="scroll-mt-20">
                <h2 className="text-lg font-bold text-black mb-3">
                  {section.n}. {section.title}
                </h2>
                {section.blocks.map((block, i) => (
                  <BlockView key={i} block={block} />
                ))}
              </section>
            ))}
          </div>

          {/* Closing */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500 italic leading-relaxed">
              By using Veesaa, you acknowledge that you have read and understood these Terms of Use
              and agree to be bound by them.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
