// Urban-Company-inspired landing content for OnboardHub.
// Image URLs verified working (Unsplash CDN).

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const imgHero = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const HERO_IMAGE = imgHero('photo-1581092335397-9583eb92d232');

export const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Vijayawada'
];

export const TRUST_BADGES = [
  { icon: '🛡️', title: 'Expert Professionals', desc: 'Background verified & trained' },
  { icon: '⭐', title: '4.8 Service Rating', desc: 'Based on 2M+ reviews', value: '4.8' },
  { icon: '🌍', title: '12M+ Customers', desc: 'Trusted globally', value: '12M+' }
];

// Big photo category tiles (like UC home page)
export const CATEGORY_TILES = [
  { slug: 'salon', label: "Women's Salon", tag: ['Salon', 'Relationships'] , img: img('photo-1584132967334-10e028bd69f7') },
  { slug: 'cleaning', label: 'Home Cleaning', tag: ['Cleaning', 'Relationships'], img: img('photo-1581578731548-c64695cc6952') },
  { slug: 'ac', label: 'AC & Appliance Repair', tag: ['Appliance Repair'], img: img('photo-1507473885765-e6ed057f782c') },
  { slug: 'home-repair', label: 'Electrician, Plumber & Carpenter', tag: ['Home Repair'], img: img('photo-1621905251189-08b45d6a269e') },
  { slug: 'painting', label: 'Painting & Renovation', tag: ['Painting'], img: img('photo-1589939705384-5185137a7f0f') },
  { slug: 'pest', label: 'Pest Control', tag: ['Pest Control'], img: img('photo-1584184924103-e310d9dc82fc') },
  { slug: 'movers', label: 'Moving & Packers', tag: ['Moving'], img: img('photo-1560518883-ce09059eeffa') },
  { slug: 'spa', label: 'Spa & Massage', tag: ['Spa & Massage'], img: img('photo-1540555700478-4be289fbecef') },
  { slug: 'fitness', label: 'Health & Fitness', tag: ['Fitness'], img: img('photo-1585128792020-803d29415281') }
];

// Service offerings displayed like UC's "Most booked services"
export const POPULAR_SERVICES = [
  { name: 'Intense cleaning (2 bathrooms)', rating: '4.8', price: 979, compareAt: 1058, img: img('photo-1556911220-bff31c812dba'), badge: 'Most booked' },
  { name: 'Foam-jet AC service', rating: '4.75', price: 799, img: img('photo-1581092335397-9583eb92d232') },
  { name: 'AC repair', rating: '4.73', price: 299, img: img('photo-1584184924103-e310d9dc82fc') },
  { name: 'Intense cleaning (3 bathrooms)', rating: '4.8', price: 1429, compareAt: 1587, img: img('photo-1523413651479-597eb2da0ad6') },
  { name: 'Tap repair', rating: '4.77', price: 79, img: img('photo-1585704032915-c3400ca199e7') },
  { name: 'Fan repair (ceiling/exhaust/wall)', rating: '4.79', price: 129, img: img('photo-1581092160562-40aa08e78837') },
  { name: 'Switch/socket replacement', rating: '4.83', price: 59, img: img('photo-1555949963-ff9fe0c870eb') },
  { name: 'Chimney repair', rating: '4.76', price: 499, img: img('photo-1556912167-f556f1f39fdf'), badge: 'New' },
  { name: 'Full home deep cleaning', rating: '4.82', price: 1899, compareAt: 2199, img: img('photo-1584622650111-993a426fbf0a') },
  { name: 'Bathroom & kitchen cleaning', rating: '4.78', price: 649, img: img('photo-1484154218962-a197022b5858') }
];

// "New and noteworthy" strip
export const NEW_SERVICES = [
  { name: 'Television repair', rating: '4.7', price: 199, img: img('photo-1555949963-ff9fe0c870eb') },
  { name: 'Geyser service', rating: '4.76', price: 599, img: img('photo-1507473885765-e6ed057f782c') },
  { name: 'Door lock repair', rating: '4.84', price: 149, img: img('photo-1556228720-195a672e8a03') },
  { name: 'Tap replacement', rating: '4.81', price: 79, img: img('photo-1585704032915-c3400ca199e7') }
];

export const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Bengaluru', text: 'Signed up as a cleaning professional. The admin verified my documents in under 48 hours — now I get regular bookings!', service: 'Home Cleaning' },
  { name: 'Arjun Mehta', city: 'Mumbai', text: 'The onboarding portal is slick. Uploaded my ID, certifications and got approved within a day. Highly professional team.', service: 'AC & Appliances' },
  { name: 'Sneha Reddy', city: 'Hyderabad', text: 'Love how transparent the status tracking is. I could see exactly where my application stood and edit anything before approval.', service: 'Salon & Spa' },
  { name: 'Rohit Verma', city: 'Delhi NCR', text: 'As a plumber, this platform brought me steady work. Approval was quick and the dashboard stats are super useful.', service: 'Plumbing' }
];