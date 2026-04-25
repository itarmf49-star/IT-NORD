"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function EcommerceProductsButton() {
  const [open, setOpen] = useState(false);

  const products = useMemo<Product[]>(
    () => [
      { id: "p1", name: "IP Camera 4MP (PoE)", price: 3200, currency: "MRU" },
      { id: "p2", name: "8‑Channel NVR + HDD", price: 12900, currency: "MRU" },
      { id: "p3", name: "Access Control Kit", price: 8600, currency: "MRU" },
      { id: "p4", name: "PTZ Camera (Outdoor)", price: 17900, currency: "MRU" },
    ],
    [],
  );

  return (
    <>
      <button type="button" className="btn btn-ghost btn-md" onClick={() => setOpen(true)}>
        E‑commerce products
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="eco-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Products"
          >
            <motion.div
              className="eco-modal"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="eco-modal-head">
                <div>
                  <div className="eco-modal-title">Store products</div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    Display products with prices inside the website interface.
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>

              <div className="eco-grid">
                {products.map((p) => (
                  <div key={p.id} className="eco-card">
                    <div className="eco-card-name">{p.name}</div>
                    <div className="eco-card-price">{formatMoney(p.price, p.currency)}</div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                      Add to quote
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

