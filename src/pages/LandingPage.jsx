import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api/client';
import Spinner from '../components/Spinner';
import {
  Star,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Users,
  Droplet,
  Lock,
  Clock,
  BadgeCheck,
  Wallet,
  TrendingUp,
  FileCheck2,
  ClipboardCheck,
  Headphones,
  X,
  Phone,
  MapPin,
  UserCheck,
  Briefcase,
  Award,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


const img = (id, w = 400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ---------------------------------------------------------------- */
/* Homepage launcher categories (Urban-Company style 3x2 grid)      */
/* ---------------------------------------------------------------- */
// dbCategory must match exactly what is stored in MongoDB provider profiles
const CATEGORY_LAUNCHER = [
  {
    title: "Women's Salon",
    dbCategory: 'Beauty & Salon',
    img: img('photo-1560066984-138dadb4c035'),
    badge: null,
    services: [
      { name: "Pedicure & D-Tan Clean-up", price: 649, originalPrice: 799, rating: '4.88', time: '90 min', img: img('photo-1560066984-138dadb4c035') },
      { name: "Luxury Facial & Hair Spa", price: 999, originalPrice: 1199, rating: '4.91', time: '120 min', img: img('photo-1502823403499-6ccfcf4fb453') },
      { name: "RICA Full Body Waxing", price: 799, originalPrice: 899, rating: '4.85', time: '60 min', img: img('photo-1516975080664-ed2fc6a32937') },
      { name: "Bridal Makeup & Saree Draping", price: 3499, originalPrice: 3999, rating: '4.97', time: '180 min', img: img('photo-1519415943484-9fa1873496d4') },
      { name: "Hair Keratin Treatment", price: 1499, originalPrice: 1799, rating: '4.82', time: '150 min', img: img('photo-1522337360788-8b13dee7a37e') }
    ]
  },
  {
    title: 'Salon Prime',
    dbCategory: 'Beauty & Salon',
    img: img('photo-1503951914875-452162b0f3f1'),
    badge: null,
    services: [
      { name: "Men's Grooming & Haircut", price: 349, originalPrice: 449, rating: '4.78', time: '45 min', img: img('photo-1503951914875-452162b0f3f1') },
      { name: "Men's De-Tan & Clean-up", price: 499, originalPrice: 599, rating: '4.80', time: '60 min', img: img('photo-1534528741775-53994a69daeb') },
      { name: "Head Massage & Hair Oil", price: 249, originalPrice: 299, rating: '4.74', time: '30 min', img: img('photo-1559599101-f09722fb4948') },
      { name: "Anti-Dandruff Hair Treatment", price: 599, originalPrice: 699, rating: '4.76', time: '75 min', img: img('photo-1522337360788-8b13dee7a37e') }
    ]
  },
  {
    title: 'Cleaning & Pest',
    dbCategory: 'Home Cleaning',
    img: img('photo-1581578731548-c64695cc6952'),
    badge: null,
    services: [
      { name: "Full Home Deep Cleaning (2BHK)", price: 2499, originalPrice: 2799, rating: '4.82', time: '4-6 hrs', img: img('photo-1581578731548-c64695cc6952') },
      { name: "Bathroom Disinfection & Tile Scrub", price: 979, originalPrice: 1058, rating: '4.80', time: '2 hrs', img: img('photo-1584622650111-993a426fbf0a') },
      { name: "Kitchen Degreasing & Chimney Clean", price: 699, originalPrice: 799, rating: '4.85', time: '3 hrs', img: img('photo-1556909211-36987daf7b4d') },
      { name: "Cockroach & Ant Pest Control", price: 499, originalPrice: 599, rating: '4.77', time: '1-2 hrs', img: img('photo-1508739773434-c26b3d09e071') },
      { name: "Sofa & Mattress Dry Cleaning", price: 599, originalPrice: 699, rating: '4.72', time: '2-3 hrs', img: img('photo-1484154218962-a197022b5858') }
    ]
  },
  {
    title: 'AC & Appliance',
    dbCategory: 'AC & Appliance Repair',
    img: img('photo-1621905252507-b35492cc74b4'),
    badge: null,
    services: [
      { name: "Foam-Jet AC Service & Repair", price: 799, originalPrice: 899, rating: '4.88', time: '1-2 hrs', img: img('photo-1621905252507-b35492cc74b4') },
      { name: "Split AC Gas Refill & Leak Fix", price: 1299, originalPrice: 1499, rating: '4.83', time: '2-3 hrs', img: img('photo-1621905251189-08b45d6a269e') },
      { name: "Washing Machine Repair", price: 349, originalPrice: 449, rating: '4.78', time: '1-2 hrs', img: img('photo-1517685352821-92cf88aee5a5') },
      { name: "Refrigerator Gas Recharging", price: 999, originalPrice: 1199, rating: '4.79', time: '2-3 hrs', img: img('photo-1600585154340-be6161a56a0c') },
      { name: "Microwave & Oven Repair", price: 449, originalPrice: 549, rating: '4.75', time: '1 hr', img: img('photo-1574269909862-7e1d70bb8078') }
    ]
  },
  {
    title: 'Plumber & Elect.',
    dbCategory: 'Plumbing',
    img: img('photo-1621905251189-08b45d6a269e'),
    badge: '⚡ 44 mins',
    extraCategory: 'Electrical',
    services: [
      { name: "Tap & Pipe Leakage Repair", price: 149, originalPrice: 199, rating: '4.77', time: '30-60 min', img: img('photo-1585704032915-c3400ca199e7') },
      { name: "New Tap / Shower Installation", price: 249, originalPrice: 299, rating: '4.80', time: '45 min', img: img('photo-1504328345606-18bbc8c9d7d1') },
      { name: "Drainage Unblocking & Cleaning", price: 349, originalPrice: 449, rating: '4.74', time: '1 hr', img: img('photo-1588776814546-1ffedbe47100') },
      { name: "Switchboard & Fan Wiring Fix", price: 199, originalPrice: 249, rating: '4.81', time: '30-45 min', img: img('photo-1603796846097-bee99e4a601f') },
      { name: "Ceiling Fan Installation", price: 299, originalPrice: 349, rating: '4.86', time: '45 min', img: img('photo-1565043589221-1a6fd9ae45c7') },
      { name: "Smart MCB & RCCB Fitting", price: 549, originalPrice: 649, rating: '4.79', time: '1-2 hrs', img: img('photo-1621905252507-b35492cc74b4') }
    ]
  },
  {
    title: 'All Services',
    dbCategory: null,
    img: img('photo-1585704032915-c3400ca199e7'),
    badge: null,
    services: []
  }
];


const SPOTLIGHT_BANNERS = [
  {
    title: 'AC Anti-Rust Foam Jet Service',
    subtitle: 'Comprehensive 360° coil cleaning & anti-rust protection',
    category: 'AC & Appliance Repair',
    price: 799,
    originalPrice: 899,
    rating: '4.88',
    img: img('photo-1621905252507-b35492cc74b4', 600),
    tag: 'Up to 30% OFF',
    inclusions: [
      'Deep foam-jet washing of indoor AC filters & cooling coils',
      'Anti-bacterial spray coating against mold and dust mites',
      'Free gas checkup & 30-day post-service warranty cover'
    ]
  },
  {
    title: 'Salon Luxe Spa & Facial Package',
    subtitle: 'Premium facial & hair spa by certified top beauticians',
    category: 'Beauty & Salon',
    price: 1299,
    originalPrice: 1499,
    rating: '4.88',
    img: img('photo-1560066984-138dadb4c035', 600),
    tag: '4.88 ★ Rated',
    inclusions: [
      'Fruit glow facial & anti-tan scrub massage',
      'Organic hair spa & deep conditioning mask',
      'Single-use sealed hygiene kit with disposables'
    ]
  },
  {
    title: 'Intense Home Deep Cleaning',
    subtitle: 'Hospital-grade sanitization for 2 & 3 BHK homes',
    category: 'Home Cleaning',
    price: 2499,
    originalPrice: 2799,
    rating: '4.82',
    img: img('photo-1581578731548-c64695cc6952', 600),
    tag: 'Special Deal',
    inclusions: [
      'Hard stain scrubbing of kitchen counter, tiles & appliances',
      'Deep steam sanitization of 2 or 3 bathrooms',
      'Heavy-duty vacuuming of mattresses, sofas & carpets'
    ]
  },
  {
    title: 'Plumbing & Water Leakage Fix',
    subtitle: 'Instant 44-minute response by background-verified plumbers',
    category: 'Plumbing',
    price: 499,
    originalPrice: 599,
    rating: '4.78',
    img: img('photo-1585704032915-c3400ca199e7', 600),
    tag: 'Fast Service',
    inclusions: [
      'Instant leak identification and washer replacement',
      'High-pressure pipe clearing and drainage unblocking',
      'Background-verified certified plumber with tool kit'
    ]
  }
];

const NEW_NOTEWORTHY = [
  {
    title: 'Kitchen Chimney Servicing',
    category: 'Home Cleaning',
    price: 699,
    originalPrice: 799,
    rating: '4.85',
    img: img('photo-1584622650111-993a426fbf0a'),
    isNew: true,
    subtitle: 'Complete mesh filter degreasing & motor inspection',
    inclusions: [
      'Chemical degreasing of baffle filters & oil collector',
      'Internal blower cleaning & suction power checkup',
      '30-day warranty against oil dripping'
    ]
  },
  {
    title: 'Native Smart Water Purifier',
    category: 'AC & Appliance Repair',
    price: 1999,
    originalPrice: 2299,
    rating: '4.91',
    img: img('photo-1600585154340-be6161a56a0c'),
    isNew: false,
    subtitle: 'Native RO Water Purifier — No service needed for 2 years',
    inclusions: [
      '10-stage RO + UV + UF purification technology',
      'In-built TDS controller & mineral booster',
      'Zero maintenance cost for 2 full years'
    ]
  },
  {
    title: 'Smart Television Wall Mounting',
    category: 'Electrical',
    price: 349,
    originalPrice: 449,
    rating: '4.80',
    img: img('photo-1593784991095-a205069470b6'),
    isNew: true,
    subtitle: 'Precision Spirit Level TV Bracket Installation up to 75"',
    inclusions: [
      'Heavy-duty wall bracket alignment with spirit level',
      'Cable conceal conduit routing & power socket check',
      'Safety load check for OLED / QLED / LED screens'
    ]
  },
  {
    title: 'Bathroom Tile & Fittings Upgrade',
    category: 'Plumbing',
    price: 899,
    originalPrice: 999,
    rating: '4.76',
    img: img('photo-1584622650111-993a426fbf0a'),
    isNew: false,
    subtitle: 'Grout re-sealing & high-shine chrome fitting polish',
    inclusions: [
      'Epoxy re-grouting of tile joints against water seepage',
      'Descaling of shower heads, faucets & health faucets',
      'Anti-fungal silicone sealing along wash basin edges'
    ]
  }
];

const MOST_BOOKED = [
  {
    title: 'Intense cleaning (2 bathroom)',
    category: 'Home Cleaning',
    rating: '4.80',
    price: 979,
    originalPrice: 1058,
    img: img('photo-1581578731548-c64695cc6952'),
    inclusions: [
      'Tile scrubbing & hard water stain removal',
      'Disinfection of toilet bowl, sink & shower glass',
      'Exhaust fan & mirror chrome buffing'
    ]
  },
  {
    title: 'Foam-jet AC service & repair',
    category: 'AC & Appliance Repair',
    rating: '4.75',
    price: 799,
    originalPrice: 899,
    img: img('photo-1621905252507-b35492cc74b4'),
    inclusions: [
      '2x deeper jet wash of indoor cooling coils',
      'Drain pipe flush & anti-mold spray treatment',
      '30-day post-service warranty'
    ]
  },
  {
    title: 'Tap repair & leakage fix',
    category: 'Plumbing',
    rating: '4.77',
    price: 149,
    originalPrice: 199,
    img: img('photo-1585704032915-c3400ca199e7'),
    inclusions: [
      'Gasket & spindle replacement for leaky taps',
      'Thread sealant tape wrapping',
      'Pressure testing after installation'
    ]
  },
  {
    title: "Women's Luxury Salon Package",
    category: 'Beauty & Salon',
    rating: '4.88',
    price: 1099,
    originalPrice: 1299,
    img: img('photo-1560066984-138dadb4c035'),
    inclusions: [
      'O3+ Glow Facial & Anti-Tan De-Tan Pack',
      'RICA Liposoluble Waxing (Full Arms & Legs)',
      'Pedicure with foot scrub & pressure point massage'
    ]
  },
  {
    title: 'Deep Cleaning & Sanitization',
    category: 'Home Cleaning',
    rating: '4.72',
    price: 599,
    originalPrice: 699,
    img: img('photo-1584622650111-993a426fbf0a'),
    inclusions: [
      'Single room / area deep vacuuming and mop',
      'Surface wipe-down with hospital-grade disinfectant',
      'Cobweb removal & light fixture dust-off'
    ]
  },
  {
    title: 'Move-in / Move-out Cleaning',
    category: 'Home Cleaning',
    rating: '4.69',
    price: 2499,
    originalPrice: 2799,
    img: img('photo-1484154218962-a197022b5858'),
    inclusions: [
      'Empty house deep scrub of floors, kitchen & wardrobes',
      'Balcony washing & window glass polishing',
      'Sanitization of all doors, handles & switches'
    ]
  }
];


const HOW_IT_WORKS = [
  {
    step: '1',
    icon: ClipboardCheck,
    title: 'Register & Complete Profile',
    desc: 'Create your provider account, choose service categories, add skills, experience and service areas.'
  },
  {
    step: '2',
    icon: FileCheck2,
    title: 'Upload Verification Documents',
    desc: 'Submit your profile photo, Government ID and address proof. Secure & encrypted storage.'
  },
  {
    step: '3',
    icon: ShieldCheck,
    title: 'Admin Review',
    desc: 'Our admin team verifies your documents, portfolio and background before approval.'
  },
  {
    step: '4',
    icon: Wallet,
    title: 'Start Earning',
    desc: 'Once approved, get daily job leads, manage bookings and grow your service business on OnboardHub.'
  }
];

const WHY_CHOOSE_US = [
  {
    icon: TrendingUp,
    title: 'High Earning Potential',
    desc: 'Top providers consistently earn up to ₹45,000+ per month with steady job lead allocation.'
  },
  {
    icon: BadgeCheck,
    title: 'Verified & Trusted',
    desc: 'Strict verification of every partner builds customer trust and drives repeat bookings for you.'
  },
  {
    icon: Clock,
    title: 'Fast Onboarding',
    desc: 'Get your application reviewed within 48 hours on average. No long waiting periods.'
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    desc: 'Our partner support team is available to help you with any onboarding or booking issue.'
  }
];

const PLATFORM_STATS = [
  { v: '2,400+', l: 'Verified Partners' },
  { v: '120+', l: 'Service Categories' },
  { v: '1.2M', l: 'Bookings Completed' },
  { v: '4.8★', l: 'Average Rating' }
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Bengaluru',
    rating: 5,
    img: img('photo-1544005313-94ddf0286df2', 100),
    text: 'Signed up as a cleaning professional. The admin verified my documents in under 48 hours — now I get regular bookings!'
  },
  {
    name: 'Arjun Mehta',
    city: 'Mumbai',
    rating: 5,
    img: img('photo-1507003211169-0a1dd7228f2d', 100),
    text: 'The onboarding portal is slick. Uploaded my ID, certifications and got approved within a day. Highly professional team.'
  },
  {
    name: 'Sneha Reddy',
    city: 'Hyderabad',
    rating: 5,
    img: img('photo-1494790108377-be9c29b29330', 100),
    text: 'Love how transparent the status tracking is. I could see exactly where my application stood and edit anything before approval.'
  },
  {
    name: 'Rohit Verma',
    city: 'Delhi NCR',
    rating: 5,
    img: img('photo-1472099645785-5658abf4ff4e', 100),
    text: 'As a plumber, this platform brought me steady work. Approval was quick and the dashboard stats are super useful.'
  }
];

const FAQS = [
  {
    q: 'How do I become a verified service provider on OnboardHub?',
    a: 'Register as a provider, complete your profile (categories, skills, experience, service locations), upload your Government ID and address proof, then submit your application. An admin reviews and approves it within an average of 48 hours.'
  },
  {
    q: 'What documents do I need to upload?',
    a: 'You must upload at least your Government ID (Aadhaar / PAN / Driving License) and address proof (utility bill / bank statement). Profile photo is mandatory. Certifications and background check documents are optional but boost your approval chances.'
  },
  {
    q: 'Can I edit my profile after submitting my application?',
    a: 'Yes. You can edit your profile and documents any time before the application is approved. Once rejected, you will see the admin remarks, fix the issues, and resubmit within minutes.'
  },
  {
    q: 'How long does verification take?',
    a: 'On average, applications are reviewed within 48 hours. You will receive an email notification as soon as your application is approved or rejected.'
  },
  {
    q: 'What does the admin see when reviewing my application?',
    a: 'Admins view your complete profile, uploaded documents with previews, and can approve, reject (with remarks), or individually verify/reject each document. They also track dashboard statistics and filter providers by status and category.'
  }
];

/* ---------------------------------------------------------------- */

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);
  const [launcherCategories, setLauncherCategories] = useState(CATEGORY_LAUNCHER);
  const [spotlightBannersList, setSpotlightBannersList] = useState(SPOTLIGHT_BANNERS);
  const [newNoteworthyList, setNewNoteworthyList] = useState(NEW_NOTEWORTHY);
  const [mostBookedList, setMostBookedList] = useState(MOST_BOOKED);
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart_items') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchDynamicPrices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data?.services && res.data.services.length > 0) {
          const dbServices = res.data.services;

          const updateItemPrice = (item) => {
            const matched = dbServices.find(
              (d) => d.name.toLowerCase().trim() === (item.name || item.title || '').toLowerCase().trim()
            );
            if (matched) {
              return {
                ...item,
                price: matched.price,
                originalPrice: matched.originalPrice || matched.price + 100
              };
            }
            return item;
          };

          const updatedLauncher = CATEGORY_LAUNCHER.map((catGroup) => {
            const updatedServices = catGroup.services.map(updateItemPrice);
            return { ...catGroup, services: updatedServices };
          });

          setLauncherCategories(updatedLauncher);
          setSpotlightBannersList(SPOTLIGHT_BANNERS.map(updateItemPrice));
          setNewNoteworthyList(NEW_NOTEWORTHY.map(updateItemPrice));
          setMostBookedList(MOST_BOOKED.map(updateItemPrice));
        }
      } catch (err) {
        // fallback presets
      }
    };
    fetchDynamicPrices();
  }, []);

  const handleServiceClick = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setActiveCategoryModal(item);
  };

  const getSrvTitle = (srv) => {
    if (!srv) return '';
    if (typeof srv === 'string') return srv;
    return srv.name || srv.title || '';
  };

  const addToCart = (srv) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const targetTitle = getSrvTitle(srv);
    const existing = cartItems.find((item) => getSrvTitle(item) === targetTitle);
    let updated;
    if (existing) {
      updated = cartItems.map((item) =>
        getSrvTitle(item) === targetTitle ? { ...item, qty: (item.qty || 1) + 1 } : item
      );
    } else {
      updated = [...cartItems, { ...srv, title: targetTitle, name: targetTitle, qty: 1 }];
    }
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const removeFromCart = (srv) => {
    const targetTitle = getSrvTitle(srv);
    const existing = cartItems.find((item) => getSrvTitle(item) === targetTitle);
    if (!existing) return;
    let updated;
    if (existing.qty > 1) {
      updated = cartItems.map((item) =>
        getSrvTitle(item) === targetTitle ? { ...item, qty: item.qty - 1 } : item
      );
    } else {
      updated = cartItems.filter((item) => getSrvTitle(item) !== targetTitle);
    }
    setCartItems(updated);
    localStorage.setItem('cart_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated'));
  };

  const getQty = (srv) => {
    const targetTitle = getSrvTitle(srv);
    const found = cartItems.find((item) => getSrvTitle(item) === targetTitle);
    return found ? found.qty : 0;
  };

  const toggleFaq = (i) => setOpenFaq((prev) => (prev === i ? null : i));


  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', paddingBottom: 64 }}>

      {/* ============ HERO + PRIMARY CATEGORY LAUNCHER ============ */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 40, alignItems: 'center' }}>

          {/* LEFT: heading + categories + trust */}
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 24 }}>
              Home services at your doorstep
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {launcherCategories.map((cat) => (
                <div
                  key={cat.title}
                  onClick={() => handleServiceClick(cat)}

                  className="cat-tile"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 12px',
                    borderRadius: 16,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    color: 'inherit',
                    position: 'relative',
                    transition: 'all 0.16s ease'
                  }}
                >
                  <img src={cat.img} alt={cat.title} style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', marginBottom: 10 }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.25 }}>
                    {cat.title}
                  </span>
                  {cat.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'var(--success-soft)',
                        color: 'var(--success-dark, var(--success))',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 999
                      }}
                    >
                      {cat.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>


            {/* Native Smart Products strip */}
            <div
              style={{
                background: 'var(--brand-50)',
                border: '1px solid var(--brand-200)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Droplet size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                    Native Smart Products
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text)' }}>Native RO Water Purifiers — No service needed for 2 years</strong>
                </div>
              </div>
              <ChevronRight size={18} color="var(--brand-500)" />
            </div>

            {/* Trust metrics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} color="#f59e0b" fill="#f59e0b" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>4.8 Service Rating*</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="var(--brand-500)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>12M+ Customers Globally*</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#0f8a5f" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>Background Verified</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Authentic 4-photo Collage Grid matching Urban Company Vijayawada */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              height: 460
            }}
          >
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <img
                src={img('photo-1560066984-138dadb4c035', 600)}
                alt="Women's Salon & Spa Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <img
                src={img('photo-1544161515-4ab6ce6db874', 600)}
                alt="Spa & Body Massage Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <img
                src={img('photo-1581578731548-c64695cc6952', 600)}
                alt="Kitchen Chimney Repair"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <img
                src={img('photo-1621905252507-b35492cc74b4', 600)}
                alt="AC Foam Jet Washing"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* ============ IN THE SPOTLIGHT ============ */}
        <section style={{ marginTop: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>In the spotlight</h2>
            <span className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>See all →</span>
          </div>
           <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 12, scrollSnapType: 'x mandatory' }}>
            {spotlightBannersList.map((b) => (
              <div
                key={b.title}
                onClick={() => handleServiceClick(b)}
                style={{
                  minWidth: 300,
                  maxWidth: 340,
                  flex: '0 0 auto',
                  background: 'var(--surface)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  scrollSnapAlign: 'start',
                  cursor: 'pointer'
                }}
              >
                <div style={{ height: 170, position: 'relative' }}>
                  <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      background: 'var(--brand-500)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 6
                    }}
                  >
                    {b.tag}
                  </span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  {b.category && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>
                      {b.category}
                    </span>
                  )}
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>{b.title}</h3>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', margin: 0 }}>{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ NEW & NOTEWORTHY ============ */}
        <section style={{ marginTop: 44 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 18 }}>
            New and noteworthy
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {newNoteworthyList.map((item) => (
              <div
                key={item.title}
                onClick={() => handleServiceClick(item)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  padding: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {item.isNew && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'var(--brand-500)',
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: 6
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                {item.category && (
                  <span style={{ fontSize: '0.67rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>
                    {item.category}
                  </span>
                )}
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{item.title}</h3>
                {item.subtitle && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', margin: '4px 0 0', lineHeight: 1.45 }}>{item.subtitle}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>₹{item.price}</span>
                    {item.originalPrice && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', textDecoration: 'line-through', marginLeft: 6 }}>
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                  {getQty(item) > 0 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand-50)', border: '1px solid var(--brand-500)', borderRadius: 8, padding: '3px 10px' }}
                    >
                      <button onClick={() => removeFromCart(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}>-</button>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--brand-600)' }}>{getQty(item)}</strong>
                      <button onClick={() => addToCart(item)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}>+</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: 'var(--brand-500)', color: 'var(--brand-500)', fontWeight: 800, padding: '4px 14px', borderRadius: 8, fontSize: '0.78rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      Add +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ============ MOST BOOKED SERVICES ============ */}
        <section style={{ marginTop: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Most booked services</h2>
            <span className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>See all →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
            {mostBookedList.map((srv) => (
              <div
                key={srv.title}
                onClick={() => handleServiceClick(srv)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  padding: 16,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.16s ease',
                  cursor: 'pointer'
                }}
                className="mb-card"
              >
                <img src={srv.img} alt={srv.title} style={{ width: 104, height: 104, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {srv.category && (
                    <span style={{ fontSize: '0.67rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 3 }}>
                      {srv.category}
                    </span>
                  )}
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 5px' }}>{srv.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{srv.rating}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-500)', fontWeight: 700 }}>(2.1k bookings)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>₹{srv.price}</span>
                      {srv.originalPrice && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-3)', textDecoration: 'line-through', marginLeft: 8 }}>
                          ₹{srv.originalPrice}
                        </span>
                      )}
                    </div>
                    {getQty(srv.title) > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand-50)', border: '1px solid var(--brand-500)', borderRadius: 8, padding: '3px 10px' }}
                      >
                        <button onClick={() => removeFromCart(srv)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}>-</button>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--brand-600)' }}>{getQty(srv.title)}</strong>
                        <button onClick={() => addToCart(srv)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}>+</button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: 'var(--brand-500)', color: 'var(--brand-500)', fontWeight: 800, padding: '5px 16px', borderRadius: 8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(srv);
                        }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>


        {/* ============ PARTNER RECRUITMENT CTA ============ */}
        <section style={{ marginTop: 52 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--brand-50) 0%, var(--brand-100) 100%)',
              border: '1.5px solid var(--brand-200)',
              borderRadius: 24,
              padding: '40px 36px',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 36,
              alignItems: 'center'
            }}
          >
            <div>
              <span
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--brand-200)',
                  padding: '5px 14px',
                  borderRadius: 999,
                  color: 'var(--brand-500)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 14
                }}
              >
                <Sparkles size={14} color="var(--brand-500)" />
                Service Provider Onboarding Portal
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 12 }}>
                Want to Earn up to <span style={{ color: 'var(--brand-500)' }}>₹45,000 / month</span> in Vijayawada?
              </h2>
              <p style={{ color: 'var(--text-3)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: 24 }}>
                Join OnboardHub as a Verified Service Partner. Submit your profile, upload your Government ID & skills
                certificate, pass verification, and get daily customer bookings!
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
                    Go to {isAdmin ? 'Admin Dashboard' : 'My Dashboard'} →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
                      <span>Register as Service Partner</span>
                      <ArrowRight size={18} />
                    </Link>
                    <Link to="/login" className="btn btn-outline btn-lg" style={{ fontWeight: 700 }}>
                      Partner Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden', height: 290, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <img
                src={img('photo-1621905251189-08b45d6a269e', 800)}
                alt="Service Partner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section style={{ marginTop: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>How It Works</h2>
            <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Four simple steps to get your provider account verified and active.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {HOW_IT_WORKS.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.step} className="card card-hover" style={{ padding: 24, borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-200)' }}>{h.step}</span>
                  </div>
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{h.title}</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>{h.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ WHY CHOOSE US ============ */}
        <section style={{ marginTop: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Why Choose OnboardHub</h2>
            <p style={{ color: 'var(--text-3)', marginTop: 8 }}>An enterprise platform built for provider growth, security, and transparent payouts.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {WHY_CHOOSE_US.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="card card-hover" style={{ padding: 24, borderRadius: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{w.title}</h3>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0 }}>{w.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ PLATFORM STATS ============ */}
        <section style={{ marginTop: 56 }}>
          <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 24, padding: '40px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
              {PLATFORM_STATS.map((s) => (
                <div key={s.l}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--brand-500)', letterSpacing: '-0.02em' }}>{s.v}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section style={{ marginTop: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Partner Success Stories</h2>
            <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Real experiences from verified service professionals across India.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card" style={{ borderRadius: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <img src={t.img} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>{t.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{t.city}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section style={{ marginTop: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-3)', marginTop: 8 }}>Everything you need to know about provider registration & admin verification.</p>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq, i) => (
              <div key={faq.q} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    padding: '18px 22px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    color: 'var(--text)'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="var(--text-3)"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ padding: '0 22px 18px', color: 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.6 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer style={{ marginTop: 72, borderTop: '1px solid var(--border)', paddingTop: 48, paddingBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 12 }}>
                Fixora<span style={{ color: 'var(--brand-500)' }}>Pro</span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Premier Home Services E-Commerce & Service Provider Onboarding Portal. Secure credential verification and real-time job allocation.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 14 }}>Provider Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                <li><Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Become a Partner</Link></li>
                <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Partner Login</Link></li>
                <li><Link to="/status" style={{ color: 'inherit', textDecoration: 'none' }}>Verification Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 14 }}>Admin Verification</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Admin Sign In</Link></li>
                <li><Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Verification Dashboard</Link></li>
                <li><a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Swagger API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 14 }}>Security & Compliance</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                <Lock size={15} color="var(--success)" />
                <span>256-bit Encrypted Credentials</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-4)' }}>
            © {new Date().getFullYear()} Fixora Pro Platform. All rights reserved.
          </div>
        </footer>
      </div>

      {/* APPROVED PROVIDERS LISTING MODAL */}
      <AnimatePresence>
        {activeCategoryModal && (
          <ApprovedProvidersModal
            category={activeCategoryModal}
            onClose={() => setActiveCategoryModal(null)}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            getQty={getQty}
          />
        )}
      </AnimatePresence>

      {/* FLOATING STICKY BOTTOM CHECKOUT BAR */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9990,
              width: '90%',
              maxWidth: 580,
              background: '#0f0f0f',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', color: '#ffffff' }}>
                  {cartItems.reduce((acc, i) => acc + i.qty, 0)} Service(s) Selected
                </strong>
                <span style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.75)' }}>
                  Total: ₹{cartItems.reduce((acc, i) => acc + i.price * i.qty, 0)}
                </span>
              </div>
            </div>

            <Link
              to={isAuthenticated ? '/cart' : '/login'}
              className="btn btn-primary btn-md"
              style={{ borderRadius: 12, fontWeight: 800, padding: '10px 20px', textDecoration: 'none' }}
            >
              View Cart & Book →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ApprovedProvidersModal({ category, onClose, onAddToCart, onRemoveFromCart, getQty }) {
  const [providers, setProviders] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detect what was passed:
  // 1. CATEGORY_LAUNCHER object  → has .title, .dbCategory, .services[]
  // 2. Service card object        → has .title, .category, .price, .inclusions[]
  // 3. String (legacy fallback)   → just a category name string
  const isCategoryTile = typeof category === 'object' && category !== null && Array.isArray(category.services);
  const isServiceObj = typeof category === 'object' && category !== null && !isCategoryTile;
  const catName = isCategoryTile
    ? category.dbCategory
    : isServiceObj
    ? (category.category || null)
    : (category !== 'All Services' ? category : null);
  const displayName = isCategoryTile ? category.title : isServiceObj ? category.title : category;

  useEffect(() => {
    const fetchApprovedAndServices = async () => {
      try {
        setLoading(true);
        const catQuery = catName ? `?category=${encodeURIComponent(catName)}` : '';
        const [pRes, sRes] = await Promise.all([
          api.get(`/provider/approved${catQuery}`),
          api.get('/services')
        ]);
        let provs = pRes.data.providers || [];
        if (provs.length === 0) {
          const allRes = await api.get('/provider/approved');
          provs = allRes.data.providers || [];
        }
        setProviders(provs);
        setDbServices(sRes.data.services || []);
      } catch (err) {
        try {
          const fallbackRes = await api.get('/provider/approved');
          setProviders(fallbackRes.data.providers || []);
        } catch (e) {
          setProviders([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedAndServices();
  }, [catName]);

  const navigate = useNavigate();

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 880, maxHeight: '92vh', background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'sticky', top: 16, left: '100%', marginRight: 16, background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', zIndex: 10, float: 'right' }}
        >
          <X size={20} />
        </button>

        {/* If clicked from a CATEGORY TILE: show hero header + services list */}
        {isCategoryTile && (
          <div>
            {/* Category hero header */}
            <div style={{ height: 180, position: 'relative', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
              <img src={category.img} alt={category.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
              {category.badge && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--brand-500)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: 8 }}>
                  {category.badge}
                </span>
              )}
              <div style={{ position: 'absolute', bottom: 18, left: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>{category.title}</h2>
                {catName && (
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>
                    {catName}{category.extraCategory ? ` & ${category.extraCategory}` : ''} Services
                  </span>
                )}
              </div>
            </div>

            {/* Services list for this category */}
            {category.services && category.services.length > 0 && (
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
                  Available Services
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {category.services.map((svc) => (
                    <div
                      key={svc.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        transition: 'box-shadow 0.15s'
                      }}
                    >
                      <img src={svc.img} alt={svc.name} style={{ width: 68, height: 68, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svc.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 6 }}>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{svc.rating}</span>
                          <span>•</span>
                          <Clock size={12} />
                          <span>{svc.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>₹{svc.price}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-4)', textDecoration: 'line-through', marginLeft: 6 }}>₹{svc.originalPrice}</span>
                          </div>
                          {getQty && getQty(svc) > 0 ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: 'var(--brand-50)',
                                border: '1px solid var(--brand-500)',
                                borderRadius: 8,
                                padding: '3px 10px'
                              }}
                            >
                              <button
                                onClick={() => onRemoveFromCart && onRemoveFromCart(svc)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}
                              >
                                -
                              </button>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--brand-600)' }}>{getQty(svc)}</strong>
                              <button
                                onClick={() => onAddToCart && onAddToCart(svc)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 900, color: 'var(--brand-600)' }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'var(--brand-500)', color: 'var(--brand-500)', fontWeight: 800, padding: '4px 14px', borderRadius: 8, fontSize: '0.78rem' }}
                              onClick={() => {
                                onAddToCart && onAddToCart({
                                  id: svc.name,
                                  name: svc.name,
                                  title: svc.name,
                                  price: svc.price,
                                  originalPrice: svc.originalPrice,
                                  category: catName,
                                  img: svc.img,
                                  time: svc.time,
                                  rating: svc.rating,
                                  qty: 1
                                });
                              }}
                            >
                              Add +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* If clicked from a service card: show service detail at top */}
        {isServiceObj && (

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {/* Left: Image */}
            <div style={{ height: 280, position: 'relative', overflow: 'hidden', borderRadius: '24px 0 0 0' }}>
              <img src={category.img} alt={category.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
              {category.tag && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--brand-500)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: 8 }}>
                  {category.tag}
                </span>
              )}
              {category.rating && (
                <span style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: '0.88rem', fontWeight: 700 }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" /> {category.rating} ★
                </span>
              )}
            </div>

            {/* Right: Service details */}
            <div style={{ padding: '28px 24px 20px' }}>
              {catName && (
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {catName}
                </span>
              )}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', margin: '4px 0 8px', lineHeight: 1.25 }}>
                {category.title}
              </h2>
              {category.subtitle && (
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.55 }}>
                  {category.subtitle}
                </p>
              )}

              {/* Price */}
              {category.price && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }}>₹{category.price}</span>
                  {category.originalPrice && (
                    <span style={{ fontSize: '1rem', color: 'var(--text-4)', textDecoration: 'line-through' }}>₹{category.originalPrice}</span>
                  )}
                  {category.originalPrice && (
                    <span style={{ background: '#e6f4ea', color: '#0f8a5f', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 8 }}>
                      {Math.round(((category.originalPrice - category.price) / category.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* Inclusions */}
              {category.inclusions && category.inclusions.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    What's included
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {category.inclusions.map((inc, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.83rem', color: 'var(--text-2)' }}>
                        <span style={{ color: 'var(--brand-500)', fontWeight: 900, marginTop: 1 }}>✓</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Providers section */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldCheck size={20} color="var(--brand-500)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Admin-Approved Professionals
            </span>
          </div>
          {!isServiceObj && (
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>
              {displayName ? `${displayName} Specialists` : 'All Admin-Approved Service Partners'}
            </h2>
          )}
          <p style={{ color: 'var(--text-3)', fontSize: '0.87rem', marginBottom: 20 }}>
            {catName
              ? `Verified & background-checked professionals for ${catName} services in Vijayawada.`
              : 'Browse 100% background-verified service providers approved by Admin Operations.'
            }
          </p>

          {loading ? (
            <div className="p-5 text-center"><Spinner size={32} label="Loading verified partners..." /></div>
          ) : providers.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '0.9rem' }}>
              <ShieldCheck size={40} style={{ marginBottom: 12, opacity: 0.35 }} />
              <p>No approved providers found for "{catName || displayName}".</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Check back later or browse other categories.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {providers.map((p) => {
                const categoryKeyword = (catName || displayName || '').split(/[\s&/]+/)[0].toLowerCase();
                const matchingServices = dbServices.filter((s) => {
                  if (!s.category) return false;
                  return (
                    s.category.toLowerCase().includes(categoryKeyword) ||
                    (catName && s.category.toLowerCase() === catName.toLowerCase())
                  );
                });

                return (
                  <div
                    key={p._id}
                    style={{
                      padding: 18,
                      borderRadius: 18,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={p.user?.name}
                        style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--brand-500)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center justify-between">
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{p.user?.name}</strong>
                          <span style={{ background: 'var(--success-soft)', color: 'var(--success-dark, var(--success))', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>
                            ● Admin Approved
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1" style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>
                          <Star size={14} fill="#f59e0b" />
                          <span>4.88 ★ ({p.experienceYears || 5}+ Yrs Experience)</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.84rem', color: 'var(--text-2)' }}>
                      <div className="flex items-center gap-1"><MapPin size={14} color="var(--brand-500)" /> {[p.address, p.city].filter(Boolean).join(', ') || 'Vijayawada, AP'}</div>
                      <div className="flex items-center gap-1"><Phone size={14} color="var(--success)" /> {p.phone || '+91 98765 11111'}</div>
                    </div>

                    {p.skills?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.skills.slice(0, 4).map((s) => (
                          <span key={s} style={{ background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '0.74rem', padding: '2px 8px', borderRadius: 8, color: 'var(--text-2)', fontWeight: 600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Admin-Approved Services & Pricing List */}
                    {matchingServices.length > 0 && (
                      <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--brand-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>Admin-Approved Services & Prices</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>({matchingServices.length} available)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {matchingServices.map((svc) => (
                            <div
                              key={svc._id || svc.name}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                borderRadius: 10,
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                gap: 10
                              }}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svc.name}</strong>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>⚡ {svc.time || '1 hr'} • ★ {svc.rating || '4.85'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <div style={{ textAlign: 'right' }}>
                                  <strong style={{ fontSize: '0.92rem', color: 'var(--brand-600)', display: 'block' }}>₹{svc.price}</strong>
                                  {svc.originalPrice && <strike style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>₹{svc.originalPrice}</strike>}
                                </div>
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, padding: '4px 10px' }}
                                  onClick={() => {
                                    onAddToCart && onAddToCart({
                                      id: svc.name,
                                      name: svc.name,
                                      title: svc.name,
                                      price: svc.price,
                                      originalPrice: svc.originalPrice,
                                      category: svc.category || catName,
                                      providerId: p._id,
                                      providerName: p.user?.name,
                                      qty: 1
                                    });
                                    onClose && onClose();
                                    navigate('/cart');
                                  }}
                                >
                                  Book →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      className="btn btn-outline btn-sm btn-block mt-1"
                      style={{ borderRadius: 10, fontWeight: 800, borderColor: 'var(--brand-500)', color: 'var(--brand-600)' }}
                      onClick={() => {
                        const serviceTitle = isServiceObj ? category.title : (catName || 'Home Service Package');
                        onAddToCart && onAddToCart({
                          id: serviceTitle,
                          name: serviceTitle,
                          title: serviceTitle,
                          price: category.price || 1299,
                          originalPrice: category.originalPrice || 1499,
                          category: catName || 'Beauty & Salon',
                          providerId: p._id,
                          providerName: p.user?.name,
                          qty: 1
                        });
                        onClose && onClose();
                        navigate('/cart');
                      }}
                    >
                      Book {p.user?.name?.split(' ')[0]} Now →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}