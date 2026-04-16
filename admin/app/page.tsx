export default function Home() {
  const steps = [
    "Create your account in the mobile app",
    "Explore rentals by city, area, room count and budget",
    "Open verified listing details and contact landlord directly",
  ];

  const screenshots = [
    { title: "Home Feed", caption: "Discover recent verified listings at a glance." },
    { title: "Explore Search", caption: "Filter by location, price and room size." },
    { title: "Listing Detail", caption: "View property info, call landlord, and navigate." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto w-full max-w-6xl px-6 py-5">
        <span className="text-xl font-extrabold tracking-wide">
          <span className="text-blue-700">265</span>Homes
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        {/* Hero */}
        <section className="rounded-3xl bg-slate-900 p-8 text-white md:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
            Malawi Rental Platform
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            Trusted rentals powered by GPS-verified property listings
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            265Homes helps tenants find legitimate rentals faster while landlords get quality demand
            from serious renters.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#download"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Download App
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl border border-slate-500 px-5 py-3 text-sm font-semibold text-white"
            >
              How it Works
            </a>
          </div>
        </section>

        {/* Problem */}
        <section className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Problem</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Fake listings and location uncertainty hurt renters
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 md:text-base">
            In informal marketplaces, tenants often waste time on misleading ads, wrong addresses,
            and inactive contacts. This creates trust and safety issues in the rental process.
          </p>
        </section>

        {/* Solution */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">GPS Verification</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Landlords capture current location during listing creation, confirming property
              presence.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Structured Listings</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tenants see organized property details, photos, pricing and contact actions in one
              experience.
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Trusted Access Model</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tenant subscriptions support a serious user base while landlords post properties for
              free.
            </p>
          </article>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-2xl font-bold text-slate-900">How it works for tenants</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {/* Screenshots */}
        <section className="mt-10">
          <h3 className="text-2xl font-bold text-slate-900">Screenshots</h3>
          <p className="mt-2 text-sm text-slate-500">
            Preview the core mobile experience that helps tenants rent with confidence.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {screenshots.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                  {item.title} Preview
                </div>
                <h4 className="mt-3 text-base font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{item.caption}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="download" className="mt-10 rounded-2xl bg-blue-700 p-6 text-white">
          <h3 className="text-2xl font-bold">Ready to find your next home?</h3>
          <p className="mt-2 max-w-2xl text-blue-100">
            Install 265Homes on mobile and start browsing verified listings in Lilongwe, Blantyre,
            and Mzuzu.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700"
            >
              Get Android App
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} 265Homes</span>
        </div>
      </footer>
    </div>
  );
}
