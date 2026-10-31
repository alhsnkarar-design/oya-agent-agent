export interface Template {
  id: string;
  title: string;
  category: "Website" | "Web app" | "Store" | "Landing page" | "Portfolio";
  blurb: string;
  /** two colors used for the template's card artwork */
  colors: [string, string];
  prompt: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "saas",
    title: "SaaS landing page",
    category: "Landing page",
    blurb: "Hero, features, pricing toggle, FAQ",
    colors: ["#7c3aed", "#06b6d4"],
    prompt:
      "A landing page for 'Ledgerly', a cloud accounting app for small businesses: bold hero with a free-trial CTA and a product screenshot mockup, logo cloud, feature grid with icons, an animated stats band, pricing with a monthly/yearly toggle (3 tiers), testimonials carousel, FAQ accordion and a newsletter signup. Dark, modern, violet-to-cyan gradients.",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    category: "Website",
    blurb: "Menu tabs, table booking, reviews",
    colors: ["#b45309", "#14532d"],
    prompt:
      "A website for 'Olive & Ember', a Mediterranean restaurant: full-bleed hero, menu with tabs (starters, grill, desserts) and prices, a table reservation form with date, time and party size plus validation, chef's story, reviews, opening hours with a map, and a floating WhatsApp button. Warm palette of olive green, cream and gold.",
  },
  {
    id: "store",
    title: "Online store",
    category: "Store",
    blurb: "Product grid, filters, working cart",
    colors: ["#111827", "#d4a373"],
    prompt:
      "An e-commerce store for 'Oud House', a luxury fragrance brand: product cards with category and price filters, a product detail page, a fully working cart saved in the browser, a checkout page with a shipping form and coupon code, and a luxurious black-and-gold design.",
  },
  {
    id: "booking",
    title: "Clinic booking app",
    category: "Web app",
    blurb: "Pick doctor, slot, manage bookings",
    colors: ["#0ea5e9", "#22c55e"],
    prompt:
      "A web app for a dental clinic: doctors and services pages, a booking flow where you choose doctor, service, day and an available time slot, a 'My appointments' page to view and cancel bookings (saved in the browser), and a simple admin dashboard listing all bookings with search and filters. Clean sky-blue and white UI.",
  },
  {
    id: "kanban",
    title: "Task manager",
    category: "Web app",
    blurb: "Kanban board, drag & drop, stats",
    colors: ["#f43f5e", "#f59e0b"],
    prompt:
      "A Kanban task manager: To do / In progress / Done columns with drag and drop, add and edit tasks with title, description, priority and due date, search and priority filters, a progress chart, dark/light mode, and everything persisted in the browser.",
  },
  {
    id: "portfolio",
    title: "Designer portfolio",
    category: "Portfolio",
    blurb: "Filterable gallery, lightbox, timeline",
    colors: ["#e11d48", "#7c3aed"],
    prompt:
      "A portfolio for a product designer: striking intro with a big editorial headline, filterable project gallery with a lightbox, case-study page, animated skills, experience timeline, and a contact form. Editorial typography, generous whitespace, subtle scroll animations.",
  },
  {
    id: "event",
    title: "Event & RSVP",
    category: "Website",
    blurb: "Countdown, schedule, RSVP form",
    colors: ["#db2777", "#fbbf24"],
    prompt:
      "An elegant event page for a tech conference 'Build Summit 2026': countdown timer, speakers grid with bios in modals, a schedule with day tabs, venue with map, ticket tiers, and an RSVP form with guest count and confirmation message.",
  },
  {
    id: "dashboard",
    title: "Analytics dashboard",
    category: "Web app",
    blurb: "KPIs, charts, tables, filters",
    colors: ["#2563eb", "#9333ea"],
    prompt:
      "A sales analytics dashboard: sidebar navigation, KPI cards with trends, line and bar charts drawn with SVG, a sortable and searchable orders table with pagination, date-range filter, and a dark theme with crisp data visualization.",
  },
];
