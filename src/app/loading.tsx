export default function Loading() {
  return (
    <main className="route-loading" aria-busy="true" aria-live="polite">
      <div className="route-loading__bar" aria-hidden="true" />

      <section className="route-loading__content">
        <div className="route-loading__brand" aria-hidden="true">
          <div className="route-loading__logo" />
          <div>
            <div className="route-loading__line route-loading__line--brand" />
            <div className="route-loading__line route-loading__line--tagline" />
          </div>
        </div>

        <div className="route-loading__hero" aria-hidden="true" />

        <div className="route-loading__heading" aria-hidden="true">
          <div className="route-loading__line route-loading__line--eyebrow" />
          <div className="route-loading__line route-loading__line--title" />
        </div>

        <div className="route-loading__cards" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="route-loading__card" key={index}>
              <div className="route-loading__card-image" />
              <div className="route-loading__line route-loading__line--dish" />
              <div className="route-loading__line route-loading__line--price" />
            </div>
          ))}
        </div>

        <p className="route-loading__message">Preparing your next page…</p>
      </section>
    </main>
  );
}
