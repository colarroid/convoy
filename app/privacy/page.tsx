import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — Convoy',
  description: 'How Convoy collects, uses, shares, and protects your personal data, in line with the Nigeria Data Protection Act, 2023.',
}

type Block =
  | { type: 'p'; text: string }
  | { type: 'def'; label: string; text: string }
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
    title: 'Introduction',
    blocks: [
      { type: 'p', text: 'This Privacy Policy explains how Convoy (“we”, “us”, or “our”) collects, uses, shares, and protects your personal data when you use Convoy (the “Platform”), a community carpooling coordination service.' },
      { type: 'p', text: 'We are the data controller responsible for your personal data. We are committed to handling it in accordance with the Nigeria Data Protection Act, 2023 and the directions of the Nigeria Data Protection Commission (the “NDPC”). This Policy forms part of our Terms of Use.' },
      { type: 'p', text: 'By using the Platform, you acknowledge the practices described in this Policy. Where we rely on your consent, you may withdraw it at any time as described below.' },
    ],
  },
  {
    n: 2,
    title: 'Information we collect',
    blocks: [
      { type: 'def', label: 'Account and profile data.', text: 'Your name, email address, phone number, password, profile photo, and the Community you belong to (identified by your Community Code).' },
      { type: 'def', label: 'Location data.', text: 'The starting location you provide, pickup or meeting points you set, and any saved locations. Location data is central to matching you with relevant trips, and we treat it with particular care (see Section 6).' },
      { type: 'def', label: 'Trip data.', text: 'Trips you post as a Host or join as a Rider, including dates, times, pickup points, seats, your record of completed rides, and requests you send or receive.' },
      { type: 'def', label: 'Vehicle data (Hosts).', text: 'Where you offer a trip, the vehicle type, model, and colour you provide so Riders can identify the ride.' },
      { type: 'def', label: 'Usage and device data.', text: 'Information about how you access the Platform, including device and browser information, log data, and identifiers used to recognise a returning device (for example, to personalise your greeting).' },
      { type: 'def', label: 'Communications.', text: 'Messages, requests, approvals, declines, reports, and notifications exchanged through the Platform.' },
      { type: 'p', text: 'We do not intentionally collect special categories of personal data, and we ask that you do not submit such data through the Platform.' },
    ],
  },
  {
    n: 3,
    title: 'How and why we use your information',
    blocks: [
      { type: 'p', text: 'We use your personal data to:' },
      { type: 'list', items: [
        'create and manage your account and verify your Community membership;',
        'match Hosts and Riders by showing trips relevant to your location and destination;',
        'enable Members to coordinate trips, including sharing the limited information necessary for a Host and a matched Rider to find one another;',
        'send service communications such as requests, approvals, confirmations, and reminders;',
        'maintain safety, investigate reports, and prevent misuse or fraud;',
        'recognise returning devices to personalise your experience;',
        'understand demand within a Community in aggregate, to support transport planning (see Section 5); and',
        'operate, maintain, and improve the Platform.',
      ] },
    ],
  },
  {
    n: 4,
    title: 'Lawful bases for processing',
    blocks: [
      { type: 'p', text: 'We process your personal data on the following bases under the NDPA:' },
      { type: 'list', items: [
        'Performance of a service — to provide the matching and coordination functions you request.',
        'Consent — for example, for non-essential cookies or optional features; you may withdraw consent at any time.',
        'Legitimate interests — to keep the Platform safe, prevent abuse, and improve the service, balanced against your rights.',
        'Legal obligation — where we are required to process or disclose data by law.',
      ] },
    ],
  },
  {
    n: 5,
    title: 'How we share your information',
    blocks: [
      { type: 'def', label: 'With other Members.', text: 'When you and another Member are matched, we share the information necessary to make the trip work — for example, a Host’s name, photo, vehicle details, pickup point, and completed-rides count are shown to a matched Rider, and a Rider’s name, completed-rides count, and pickup point are shown to the Host. Only share information through the Platform that you are comfortable other Members seeing.' },
      { type: 'def', label: 'With Community Admins.', text: 'Admins may see demand information about their Community in aggregate and at an area level (for example, how many Members in a given area need rides) to support transport planning. We do not provide Admins with individual location tracking of Members.' },
      { type: 'def', label: 'With service providers.', text: 'We use trusted third parties to host the Platform, deliver notifications, and provide mapping. These providers process data only on our instructions and under appropriate safeguards.' },
      { type: 'def', label: 'For legal reasons.', text: 'We may disclose data where required by law, regulation, legal process, or to protect the rights, safety, or property of any person.' },
      { type: 'callout', text: 'We do not sell your personal data, and we do not share it with advertisers.' },
    ],
  },
  {
    n: 6,
    title: 'Location data',
    blocks: [
      { type: 'p', text: 'Because location is sensitive, we limit how it is used and shared:' },
      { type: 'list', items: [
        'We use your location to match you with relevant trips and to enable a pickup.',
        'Members see pickup and meeting points, not your home address. A Host’s starting location is not exposed to Riders.',
        'Admins receive only aggregated, area-level demand data, never precise individual location histories.',
      ] },
      { type: 'p', text: 'You can choose how much location detail you provide, though limiting it may reduce the quality of matches.' },
    ],
  },
  {
    n: 7,
    title: 'Cookies and similar technologies',
    blocks: [
      { type: 'p', text: 'The Platform uses cookies and similar technologies that are necessary to operate the service (for example, to keep you signed in and to recognise a returning device for your greeting). Where we use non-essential cookies, we will seek your consent. You can manage cookies through your browser settings, though disabling some may affect how the Platform works.' },
    ],
  },
  {
    n: 8,
    title: 'Data retention',
    blocks: [
      { type: 'p', text: 'We retain your personal data for as long as your account is active and as needed to provide the service. When you close your account, we delete or anonymise your personal data within a reasonable period, except where we are required to retain certain information to comply with legal obligations, resolve disputes, or maintain safety records.' },
    ],
  },
  {
    n: 9,
    title: 'Data security',
    blocks: [
      { type: 'p', text: 'We apply reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security. You are responsible for keeping your account credentials and Community Code confidential.' },
    ],
  },
  {
    n: 10,
    title: 'Your rights',
    blocks: [
      { type: 'p', text: 'Under the NDPA, you have the right to:' },
      { type: 'list', items: [
        'access the personal data we hold about you;',
        'request correction of inaccurate or incomplete data;',
        'request deletion of your data in certain circumstances;',
        'object to or request restriction of certain processing;',
        'request portability of data you have provided;',
        'withdraw consent where processing is based on consent; and',
        'lodge a complaint with the Nigeria Data Protection Commission.',
      ] },
      { type: 'p', text: 'To exercise any of these rights, contact us at privacy@convoy.app. We will respond within the period required by law. You will not have to pay a fee in most cases.' },
    ],
  },
  {
    n: 11,
    title: 'Children’s privacy',
    blocks: [
      { type: 'p', text: 'The Platform is intended for users aged 18 and over. We do not knowingly collect personal data from anyone under 18. If we learn that we have collected such data, we will delete it.' },
    ],
  },
  {
    n: 12,
    title: 'Cross-border transfers',
    blocks: [
      { type: 'p', text: 'Where we use service providers located outside Nigeria, we take steps to ensure your data is protected to a standard consistent with the NDPA before any transfer takes place.' },
    ],
  },
  {
    n: 13,
    title: 'Changes to this policy',
    blocks: [
      { type: 'p', text: 'We may update this Policy from time to time. Where changes are material, we will take reasonable steps to notify you. The “Last updated” date at the top shows when the Policy was last revised.' },
    ],
  },
  {
    n: 14,
    title: 'Contact us',
    blocks: [
      { type: 'p', text: 'For questions about this Policy or to exercise your rights, contact us at privacy@convoy.app.' },
      { type: 'p', text: 'You may also contact the Nigeria Data Protection Commission if you have concerns about how your data is handled.' },
    ],
  },
]

function BlockView({ block }: { block: Block }) {
  if (block.type === 'p') {
    return <p className="text-[15px] text-gray-700 leading-relaxed mb-4">{block.text}</p>
  }
  if (block.type === 'def') {
    return (
      <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
        <span className="font-semibold text-black">{block.label}</span> {block.text}
      </p>
    )
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar showAuth="login" />

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Legal</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">Privacy Policy</h1>
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
              By using Convoy, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
