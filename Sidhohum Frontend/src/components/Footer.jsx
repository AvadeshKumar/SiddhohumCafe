import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, Mail, Shield, Heart, ExternalLink, Code2, Handshake } from 'lucide-react'
import { useCafe } from '../context/CafeContext'


import logo from '../assets/images/siddhohum-logo.jpg'

export const Footer = () => {
  const { settings } = useCafe()

  return (
    <footer className="bg-[#261408] text-stone-300 pt-10 pb-24 md:pb-12 border-t border-amber-950 mt-16 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Column */}
<div className="space-y-3 md:col-span-1">
  <div className="flex items-center gap-2">
    <img
      src={logo}
      alt="Siddhohum Cafe"
      className="w-10 h-10 object-contain drop-shadow transition-transform group-hover:scale-105"
    />
    <h3 className="font-display font-extrabold text-white text-lg">
      {settings?.cafeName || 'Siddhohum Cafe'}
    </h3>
  </div>

  <p className="text-xs text-stone-400 leading-relaxed">
    Your favourite spot for kadak chai, fresh parathas, delicious snacks,
    and everyday comfort food.
  </p>

  {/* Admin Link */}
  <Link
    to="/admin/login"
    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-amber-800/70 bg-amber-950/60 px-2.5 py-1.5 text-xs text-amber-300 transition-colors hover:bg-amber-900/70"
    title="Cafe Staff & Kitchen Management"
  >
    <Shield className="h-3.5 w-3.5 shrink-0" />
    <span>Admin</span>
  </Link>
</div>

        {/* Quick Links */}
        <div className="space-y-2.5">
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Explore
          </h4>
          <ul className="space-y-1.5 text-xs text-stone-400">
            <li>
              <Link to="/menu" className="hover:text-amber-300 transition">Complete Food Menu</Link>
            </li>
            <li>
              <Link to="/menu?category=beverages-and-chai" className="hover:text-amber-300 transition">Beverages</Link>
            </li>
            <li>
              <Link to="/menu?category=signature-specials" className="hover:text-amber-300 transition">Specials</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-amber-300 transition">Rewards</Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-amber-300 transition">Track Your Order</Link>
            </li>
          </ul>
        </div>

        {/* Cafe Hours & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Kitchen Hours
          </h4>
          <div className="space-y-2 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mon – Sun: 10:00 AM – 09:00 PM </span>
            </div>
            <p className="text-[11px] text-stone-400">
              ⚡ Quick & Convenient Local Delivery
            </p>
            <p className="text-[11px] text-emerald-400 font-medium">
              🎁 10% Weekday Offer active Monday through Friday!
            </p>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-2.5">
          <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Visit & Contact
          </h4>
          <div className="space-y-2 text-xs text-stone-400">
            <p className="text-white font-semibold">
              Owner: Ashish & Rahul
            </p>
            <a
              href={`tel:${(settings?.phone || '8868977399').replace(/\D/g, '')}`}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>{settings?.phone || '+91 8868977399'}</span>
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>opp. Mega county, near The bend restaurant, Salan Gaon, Bhagwant Pur, Dehradun, Kirsali Gaon, Uttarakhand 248009 </span>
                {settings?.mapLink && (
                  <a
                    href={settings.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[11px] text-amber-400 hover:underline mt-0.5"
                  >
                    View on Map →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-amber-950/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2">
        <p>© {new Date().getFullYear()} {settings?.cafeName || 'Siddhohum Cafe'}. All rights reserved.</p>
        <p className="flex items-center gap-1 text-[11px]">
          <Code2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          Website Designed & Developed by Avadesh & Arsh.
        </p>
      </div>
    </footer>
  )
}
