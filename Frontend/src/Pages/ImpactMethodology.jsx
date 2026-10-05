import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../Components/Footer';
import { analyticsService } from '../services';

const BASIS_LABELS = {
  published: 'Published data',
  partial: 'Published CO₂e, estimated water',
  estimate: 'Our estimate',
};

const ImpactMethodology = () => {
  const [method, setMethod] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    analyticsService
      .getImpactMethodology()
      .then((data) => isMounted && setMethod(data))
      .catch(() => isMounted && setFailed(true));
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-fufu">
      <div className="bg-fufu/95 backdrop-blur-md border-b border-fufu-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-moringa-muted hover:text-moringa transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-moringa mb-2">How we calculate impact</h1>
        <p className="text-moringa-muted mb-8 max-w-[72ch]">
          The meals, food, CO₂e and water figures in ChopNow are <strong>estimates</strong>, not
          measurements. Here is exactly how they are worked out.
        </p>

        <div className="max-w-[72ch] text-moringa-muted leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-moringa mb-3">The method</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Meals</strong> are the number of items in a completed order.
              </li>
              <li>
                <strong>Food rescued (kg)</strong> is the quantity of each item times its weight.
                The weight comes from, in this order: the unit the vendor sells by (kg, g, litre), a
                weight written in the listing title such as “1kg” or “500ml”, or a typical weight
                for that kind of food.
              </li>
              <li>
                <strong>CO₂e</strong> and <strong>water</strong> are the food’s kilograms times a
                per-kilogram figure for its category, shown in the table below. They represent what
                it took to produce the food, which is wasted if the food is thrown away.
              </li>
              <li>
                If part of an order is refunded because of a problem with the food, the same share
                no longer counts as rescued.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-moringa mb-3">Factors by category</h2>
            {failed ? (
              <p>The factor table could not be loaded right now. Please try again later.</p>
            ) : !method ? (
              <p>Loading…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-moringa border-b border-fufu-border">
                        <th className="py-2 pr-4 font-semibold">Category</th>
                        <th className="py-2 pr-4 font-semibold">Typical item (kg)</th>
                        <th className="py-2 pr-4 font-semibold">CO₂e per kg</th>
                        <th className="py-2 pr-4 font-semibold">Water per kg (L)</th>
                        <th className="py-2 font-semibold">Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {method.categories.map((c) => (
                        <tr key={c.key} className="border-b border-fufu-border/60">
                          <td className="py-2 pr-4">{c.label}</td>
                          <td className="py-2 pr-4">{c.defaultWeightKg}</td>
                          <td className="py-2 pr-4">{c.co2ePerKg}</td>
                          <td className="py-2 pr-4">{c.waterPerKg.toLocaleString()}</td>
                          <td className="py-2">{BASIS_LABELS[c.basis] || 'Our estimate'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  <strong>Published data</strong> means the figures follow the sources listed below.{' '}
                  <strong>Published CO₂e, estimated water</strong> means the emissions figure
                  follows the sources but the water figure does not (fish is not in the water
                  tables). <strong>Our estimate</strong> means that kind of food is not covered by
                  those sources, so we estimated it from similar foods (for example, baked goods use
                  wheat as a stand-in, and prepared meals are based on a typical plate of rice,
                  chicken and vegetables). Treat those rows as less certain.
                </p>
                <p className="text-xs mt-3">Method version {method.version}</p>
              </>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-moringa mb-3">What this does not claim</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The figures are averages for each category and are deliberately on the cautious
                side, so we are more likely to understate than overstate.
              </li>
              <li>
                They cover producing the food (farm, processing, transport, packaging). They do not
                include the methane that food waste would give off in landfill.
              </li>
              <li>
                A drink is counted as 1 kg per litre. A listing with no weight anywhere uses the
                typical weight for its category.
              </li>
            </ul>
          </section>

          {method && (
            <section>
              <h2 className="text-2xl font-semibold text-moringa mb-3">Sources</h2>
              <ul className="list-disc pl-6 space-y-2">
                {method.sources.map((s) => (
                  <li key={s.name}>
                    {s.name} — <em>{s.use}</em>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ImpactMethodology;
