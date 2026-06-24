'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AppNav from '@/components/AppNav'
import Footer from '@/components/Footer'
import ReportModal from '@/components/ReportModal'
import { getUser } from '@/lib/userStore'

interface QA { q: string; a: string }
interface FaqSection { id: string; icon: string; title: string; items: QA[] }

const SECTIONS: FaqSection[] = [
  {
    id: 'offering',
    icon: '🚗',
    title: 'Offering a ride',
    items: [
      { q: 'How do I offer a ride?', a: 'Tap Offer a ride, enter your community code, then add your destination, pickup point, date, time and how many seats you have. Once posted, members of that community can request to join.' },
      { q: 'Can I edit a ride after posting?', a: 'To keep things clear for anyone who has joined, posted rides are not edited in place. If details change, cancel the ride and post a fresh one so everyone sees the update.' },
      { q: 'How do I cancel a ride I offered?', a: 'Open the ride in My trips and choose to cancel it. Anyone who joined is notified automatically.' },
      { q: 'How do I approve or decline requests?', a: 'When someone asks to join you get a notification. Open the ride in My trips to see pending requests and approve or decline each one. Approving shares contact details so you can arrange the pickup.' },
      { q: "What if I'm using a hired ride (Uber / Bolt / In-drive)?", a: 'When posting, pick the hired-ride option instead of a personal vehicle. Riders will see it is a hired ride so costs can be split fairly between everyone.' },
      { q: 'What happens after the ride date passes?', a: 'You will be asked to confirm whether the ride happened. Confirming adds it to everyone’s history. If it did not happen you can mark that, and tell us why so we can keep improving.' },
    ],
  },
  {
    id: 'finding',
    icon: '🔍',
    title: 'Finding a ride',
    items: [
      { q: 'How do I find a ride?', a: 'Tap Find a ride, enter your community code and your destination. Veesaa shows rides from members of that community heading the same way, with the closest pickups first.' },
      { q: 'How do I request to join a ride?', a: 'Open a ride that suits you and send a request to the host. They are notified and can approve or decline.' },
      { q: 'What happens after I send a request?', a: 'The host reviews it and you are notified when it is approved or declined. Once approved you will see the host’s contact details to arrange the pickup.' },
      { q: 'Can I cancel my request?', a: 'Yes. Go to My trips and withdraw your request or leave the ride. The host is notified so the seat can be freed up.' },
      { q: 'What if there are no rides on my route?', a: 'Members post rides throughout the week, so check back closer to your travel time. You can also offer a ride yourself and let neighbours join you.' },
    ],
  },
  {
    id: 'communities',
    icon: '🏘️',
    title: 'Communities & codes',
    items: [
      { q: 'What is a community code?', a: 'A community code is a private key to a trusted group, like your estate, parish or campus. It makes sure you only ride with verified members of that community.' },
      { q: 'Where do I get a community code?', a: 'From your community admin, the person who set Veesaa up for your group. Ask them to share it with you.' },
      { q: 'Do I need to enter the code every time?', a: 'No. Once you have entered a code, Veesaa remembers that community so you can jump straight back in next time.' },
      { q: 'Who creates community codes?', a: 'A community admin creates and manages the code from the admin dashboard, and decides who the community is for.' },
      { q: "My community code isn't working", a: 'Check there are no extra spaces and confirm the exact code with your admin, in case it changed.' },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Account & profile',
    items: [
      { q: 'How do I change my profile photo?', a: 'Go to your Profile and tap your photo to upload a new one.' },
      { q: 'How do I update my phone number?', a: 'Open Profile, go to Account and edit your phone number. It is only shared with people once you are matched on a ride.' },
      { q: 'How do I change my password?', a: 'In Profile under Account choose Change password. You confirm your current password, then set a new one.' },
      { q: 'How do I delete my account?', a: 'Email us at hello@veesaa.co and we will help you remove your account and data.' },
      { q: 'Why do I need to verify my email?', a: 'Verifying your email keeps communities trusted by confirming each member is a real person. You enter a short code sent to your inbox when you sign up.' },
    ],
  },
  {
    id: 'safety',
    icon: '🔒',
    title: 'Safety & trust',
    items: [
      { q: 'Is Veesaa safe to use?', a: 'Veesaa is built around closed communities: you only travel with verified members of a group you already belong to, never strangers.' },
      { q: 'Who can see my personal information?', a: 'Your details stay private. Contact information is only shared with a host or rider once you are matched on a ride together.' },
      { q: 'Why do I only share a pickup point, not my address?', a: 'You choose a public pickup point rather than your home address, so you keep your exact location private while still being easy to find.' },
      { q: 'How does Veesaa build trust without ratings?', a: 'Trust comes from the community itself. Everyone is a verified member of the same group, admins can act on reports, and it is people you already share a place with.' },
      { q: 'How do I report a concern?', a: 'Use the Report option below or on a member’s profile. Reports are confidential and reviewed by your community admin.' },
    ],
  },
  {
    id: 'free',
    icon: '💳',
    title: 'Is it really free?',
    items: [
      { q: 'Is Veesaa really free?', a: 'Yes. Veesaa is free to use. There are no fares and no booking fees.' },
      { q: 'Does Veesaa take a cut from rides?', a: 'No. Veesaa never takes a commission. We simply connect neighbours heading the same way.' },
      { q: 'Can a host charge for a ride?', a: 'Rides are not for profit. Neighbours may split real costs like fuel, but a host cannot mark up or charge a fare.' },
      { q: 'Are there any hidden fees?', a: 'None. There are no hidden charges, subscriptions or fees to ride or offer a ride.' },
    ],
  },
]

export default function HelpPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [active, setActive] = useState(SECTIONS[0].id)
  const refs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => { setLoggedIn(!!getUser()) }, [])

  // Scrollspy: highlight the section nearest the top.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive((visible[0].target as HTMLElement).id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    SECTIONS.forEach((s) => { const el = refs.current[s.id]; if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {loggedIn ? <AppNav /> : <Navbar showAuth="login" />}

      {/* Sub-header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3">
          <span className="text-sm font-semibold text-black">Help</span>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-gray-100 px-5 py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">How can we help?</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-500">
          Answers about offering and finding rides, communities, your account, safety and more.
        </p>
      </div>

      {/* FAQ: section nav + questions */}
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          {/* Section nav (sticky on large screens) */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                    active === s.id ? 'bg-gray-100 font-semibold text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Sections */}
          <div className="min-w-0">
            {SECTIONS.map((s) => (
              <section
                key={s.id}
                id={s.id}
                ref={(el) => { refs.current[s.id] = el }}
                className="mb-12 scroll-mt-28 last:mb-0"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="text-xl">{s.icon}</span>
                  <h2 className="text-lg font-bold text-black">{s.title}</h2>
                </div>
                <div className="rounded-2xl border border-gray-200">
                  {s.items.map((it) => (
                    <details key={it.q} className="group border-b border-gray-100 px-4 last:border-0">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-black [&::-webkit-details-marker]:hidden">
                        {it.q}
                        <svg className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="pb-4 pr-6 text-sm leading-relaxed text-gray-500">{it.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            {/* Report a concern */}
            <div className="mt-2 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="mb-0.5 text-sm font-bold text-black">Report a safety concern</p>
                  <p className="text-sm leading-relaxed text-gray-600">Tell us about a member or ride. Confidential. In an emergency, call local authorities.</p>
                </div>
              </div>
              <button onClick={() => setShowReport(true)} className="shrink-0 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600">
                Report
              </button>
            </div>

            {/* Still need help */}
            <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-10 md:px-10 md:py-12">
              <h2 className="text-2xl font-bold text-black md:text-3xl">Still need help?</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Link href="mailto:hello@veesaa.co" className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <p className="mt-5 font-bold text-black">Email</p>
                  <p className="mt-1 text-sm text-gray-500">hello@veesaa.co</p>
                </Link>

                <Link href="https://wa.me/2348000000000" className="rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </span>
                  <p className="mt-5 font-bold text-black">WhatsApp</p>
                  <p className="mt-1 text-sm text-gray-500">+234 800 000 0000</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReportModal open={showReport} onClose={() => setShowReport(false)} />

      <Footer />
    </div>
  )
}
