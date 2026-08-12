// All site copy + data for Nón Lá Express, sourced from docs/website-brief.md.
// Menu content: printed "New Menu" is authoritative for names/prices (§7.1),
// enriched with the old web menu's descriptions where items match.
// Bilingual captions (EN / 中文 / Viet) mirror the printed menu exactly.

import { assetUrl } from '$lib/wp/assets.js';

// Resolved once, against whichever host is serving this bundle: `<base>/assets`
// on GitHub Pages, `/wp-content/themes/nonla-express/assets` inside the
// WordPress theme. Every `${IMG}/x.jpg` in the components then works in both
// places untouched — see src/lib/wp/assets.js for the resolution order.
export const IMG = assetUrl('/assets/images');
export const VID = assetUrl('/assets/videos');
// The un-themed folk-art SVGs served as plain <img> (the themed ones are
// inlined by Art.svelte instead — redesign-plan.md §2.2).
export const ART = assetUrl('/assets/art');

export const BRAND = 'Nón Lá Express';
export const KITCHEN = 'Vietnamese Kitchen';
export const TAGLINE = 'phở, the new era';
export const AN_NAO = 'ăn nào!'; // "let's eat!"

export const ADDRESS = {
	lines: ['Tangram Food Hall · Stall FH17', '133-33 39th Ave', 'Flushing, NY 11354'],
	short: 'Tangram Food Hall FH17 · Flushing, Queens',
	mapsUrl: 'https://maps.google.com/?q=Tangram+133-33+39th+Ave+Flushing+NY+11354',
	transit: 'Take the 7 train or LIRR to Flushing–Main St — Tangram is a three-minute walk.'
};

export const PHONE = { display: '(347) 690-1999', tel: 'tel:+13476901999' };

// Best-supported reading of conflicting sources; verify before launch (brief §6 #8).
export const HOURS = [{ days: 'Monday – Sunday', time: '11:00 AM – 10:00 PM' }];
export const LUNCH_WINDOW = 'Mon–Fri · 11AM–3PM';

export const ORDER_URL = 'https://order.snackpass.co/67be450e8c2c2460a8b96002';
export const DELIVERY_NOTE = 'Also on Grubhub and Seamless.';

export const SOCIAL = {
	instagram: { label: '@nonlaexpress', url: 'https://www.instagram.com/nonlaexpress' },
	yelp: { label: 'Yelp', url: 'https://www.yelp.com/biz/non-la-express-flushing' }
};

export const MISSION =
	'Make healthy & delicious Vietnamese food accessible and convenient for everyone in our community.';

export const STORY = [
	'Nón Lá Express was born from a group of friends who love phở — and who noticed that a proper bowl traditionally asks for leisurely dining. As their lives got busier, they saw their opportunity: a convenient way to enjoy phở on the go without sacrificing quality or flavor.',
	'From a stall inside Tangram, Flushing’s food hall on 39th Avenue, the kitchen brings the healthiness of Vietnamese cooking into the fast-food world — silky rice noodles, rich comforting broth, and dishes prepared quickly without cutting corners.'
];

export const VALUES = [
	{ title: 'Made with utmost integrity', body: 'Every bowl is prepared quickly without cutting corners, capturing the rich and aromatic essence of Vietnamese cuisine.' },
	{ title: 'Fresh ingredients only', body: 'We source and use only fresh ingredients — no shortcuts on the way to a better bowl.' },
	{ title: 'Care and efficiency', body: 'Served with care and efficiency — a quick meal that never feels like fast food.' }
];

// VISIBLE prose — the footer paragraph under the stacked logo. Long on purpose:
// it is read, not truncated. Not the meta description; see META_DESCRIPTION.
export const SEO_BLURB =
	'Nón Lá Express is a Vietnamese restaurant in Flushing, Queens, serving fresh pho, noodle soups, rice dishes, and signature drinks. Visit us at Tangram Food Hall or order online when you are craving Vietnamese food near Flushing.';

// The homepage <meta name="description">, kept under ~155 characters so Google
// shows it whole. It was SEO_BLURB + a Chinese suffix, which ran to ~260 and got
// cut mid-sentence in results.
//
// ⚠️ This string is duplicated in the live WordPress database as the Yoast SEO
// description for the Home page. Change it here and the two disagree — a crawler
// that runs JavaScript sees this one, a crawler that doesn't sees Yoast's. Update
// both, or run `make pull-content` first if the client edited it live.
export const META_DESCRIPTION =
	'Vietnamese restaurant in Flushing, Queens — fresh pho, noodle soups, rice dishes and signature drinks at Tangram Food Hall. 法拉盛越南河粉.';

export const NEWSLETTER_PITCH = 'Sign up for exclusive promos, new menu drops, store openings, and more.';

/* ============================== HOMEPAGE (Phase C) ==============================
   Verbatim from the original nonlaexpress.com (plan §3). That site disappears at
   DNS cutover, so the plan is the only remaining source — don't paraphrase these
   without checking it. */

// Intro section: the h1 is deliberately small on the original — it is an SEO
// line, not a statement headline. The statement voice is STATEMENT below.
export const INTRO_SEO = {
	h1: 'Authentic Vietnamese Restaurant in Flushing, Queens',
	blurb:
		'Nón Lá Express serves fresh pho, Vietnamese noodle soups, rice dishes, and signature drinks in Flushing, Queens.'
};

export const STATEMENT = {
	headline: 'NATURAL INGREDIENTS, FRESH TASTE.',
	body: 'At Nón Lá Express, we bring fresh Vietnamese flavors to Flushing with warm bowls of pho, flavorful noodle dishes, rice dishes, and refreshing drinks. Our Vietnamese restaurant in Queens focuses on fresh ingredients, bold flavor, and convenient service.',
	tag: '#nonlaexpress'
};

export const DRINKS_BLURB = {
	headline: 'COOL DRINKS WARM MEMORIES IN EVERY SIP.',
	en: 'Our drinks are crafted to cool you down and bring back warm, familiar moments. From bold Vietnamese coffee to sweet sugarcane juice and refreshing salted limeade, every sip is made to brighten your day and pair perfectly with our authentic Vietnamese food.',
	zh: '我们的饮品为清凉而生，也为温暖回忆而来。从浓郁的越南咖啡，到清甜的甘蔗汁与清爽的咸柠水，每一口都让你感受轻松惬意，也与我们的地道越南美食完美搭配。'
};

/* ============================== MENU ============================== */

export const LUNCH_SPECIAL = {
	title: 'Lunch Special',
	zh: '套餐',
	vi: 'Bữa Ăn Set',
	price: 25,
	window: LUNCH_WINDOW,
	steps: [
		// The "Squid Game not included" exclusion went with the dish itself
		// (removed 2026-08-11, client direction) — the carve-out named an
		// appetizer the menu no longer has.
		{ n: '①', en: 'Any appetizer — half portion', zh: '任意一份小吃（半份）' },
		{ n: '②', en: 'Any noodle or main', zh: '任意一份河粉／主食' },
		{ n: '③', en: 'Any drink', zh: '任意一杯饮品' }
	]
};

export const MENU = [
	{
		id: 'appetizers',
		title: 'Appetizer',
		price: '$9',
		items: [
			{
				en: 'Spring Roll (4)', vi: 'Chả Giò', zh: '越南春卷',
				desc: 'Crispy golden rolls with seasoned pork, shrimp, mushrooms, and vermicelli, served with nuoc cham.',
				img: `spring-roll.jpg`
			},
			{
				en: 'Summer Roll (2)', vi: 'Gỏi Cuốn', zh: '夏日虾卷',
				desc: 'Fresh rice-paper rolls with shrimp, vermicelli, lettuce, and herbs, served with peanut dip.',
				img: `summer-roll.jpg`
			},
			{
				en: 'Lemongrass Chicken Wings (4)', vi: 'Cánh Gà Sả', zh: '香茅鸡翅',
				desc: 'Crispy fried wings in a lemongrass-garlic marinade with a tangy dip.',
				img: `wings.jpg`
			},
			{
				en: 'Viet Salad w. Ginger Sauce', vi: 'Gỏi', zh: '越式沙拉',
				desc: 'Shredded greens with ginger dressing and your choice of pork, chicken, or ribeye.',
				img: `viet-salad.jpg`
			}
		]
	},
	{
		id: 'burgers',
		title: 'Burger',
		price: '$12',
		note: 'Served with french fries.',
		sauces: [
			{ en: 'Ketchup', zh: '番茄酱', vi: 'Tương Cà' },
			{ en: 'Mayonnaise', zh: '美乃滋', vi: 'Mayo' },
			{ en: 'Spicy Mayo', zh: '辣美乃滋', vi: 'Mayo Cay' },
			{ en: 'Cilantro Cream', zh: '香菜奶油酱', vi: 'Sốt Kem Ngò' }
		],
		items: [
			{ en: 'Smoked Paprika Chicken Burger', vi: 'Burger Gà Paprika', zh: '烟熏红椒鸡肉堡' },
			{ en: 'Lemongrass Pork Tenderloin Burger', vi: 'Burger Heo Sả', zh: '香茅猪肉汉堡' }
		]
	},
	{
		id: 'noodle',
		title: 'Noodle',
		price: '$17',
		blurb:
			'Our phở is made with fresh ingredients, tender meats, and aromatic herbs in every bowl. Served with silky rice noodles and a rich, comforting broth, it’s a warm and satisfying meal made to be enjoyed.',
		note: 'Served with fresh bean sprouts, Thai basil, lime, and jalapeños on the side.',
		items: [
			{
				num: 1, en: 'Fresh Phoenix Chicken Pho', vi: 'Phở Gà', zh: '凤凰鸡河粉',
				desc: 'Tender poached chicken over silky rice noodles in a clear, aromatic broth.',
				img: `pho-ga.jpg`
			},
			{
				num: 2, en: 'Rare Eye Round Beef Pho', vi: 'Phở Tái', zh: '生牛眼肉河粉',
				desc: 'Paper-thin rare eye round, gently cooked by rich, slow-simmered beef broth.',
				img: `pho-tai.jpg`
			},
			{
				num: 3, en: 'Phở Special', vi: 'Phở Đặc Biệt', zh: '火车头',
				desc: 'Rare sliced beef, well-done brisket, beef flank, tendon, tripe, and beef meatballs.',
				img: `pho-special.jpg`
			},
			{
				num: 4, en: 'Pho & Grilled', vi: 'Phở & Nướng', zh: '烤肉河粉',
				desc: 'Phở topped straight off the grill.', choice: 'Choice: pork / chicken / ribeye',
				img: `pho-grilled.jpg`
			},
			{
				num: 5, en: 'Spicy Pho', vi: 'Phở Cay', zh: '辣河粉', spicy: true,
				desc: 'A chili-forward broth that brings the heat.', choice: 'Choice: chicken / eye round',
				img: `spicy-pho.jpg`
			}
		]
	},
	{
		id: 'mains',
		title: 'Main',
		price: '$17',
		note: 'Served with white rice, pickled vegetables, fresh herbs, and a side of nuoc cham.',
		items: [
			{
				num: 6, en: 'Shaking Beef Rice', vi: 'Bò Lúc Lắc', zh: '牛丁饭',
				desc: 'Wok-seared beef tossed with garlic, onions, and peppers.',
				img: `shaking-beef.jpg`
			},
			{
				num: 7, en: 'Smoked Paprika Chicken Rice', vi: 'Cơm Gà Paprika', zh: '烟熏红椒鸡饭',
				desc: 'Grilled chicken glazed with smoked paprika.',
				img: `paprika-chicken-rice.jpg`
			},
			{
				num: 8, en: 'Pork Chop Rice', vi: 'Cơm Sườn Nướng', zh: '猪扒饭',
				desc: 'Grilled lemongrass-marinated pork chop.',
				img: `pork-chop-rice.jpg`
			},
			{
				num: 9, en: 'Lemongrass Beef Rice', vi: 'Bò Nướng Sả', zh: '香茅肋眼牛排饭',
				desc: 'Grilled ribeye in a fragrant lemongrass marinade.',
				img: `lemongrass-beef-rice.jpg`
			},
			{
				num: 10, en: 'Rice Vermicelli Bowl', vi: 'Bún Thịt Nướng', zh: '越式檬粉',
				desc: 'Cool rice vermicelli with fresh herbs and pickles.',
				choice: 'Choice: spring rolls / pork / chicken / ribeye',
				img: `vermicelli.jpg`
			}
		]
	},
	{
		id: 'drinks',
		title: 'Signature Drink Menu',
		price: '$6',
		zh: '招牌饮品',
		vi: 'Thức Uống Đặc Trưng',
		items: [
			{
				en: 'Vietnamese Iced Coffee', vi: 'Cà Phê Sữa Đá', zh: '越南咖啡',
				desc: 'Phin-brewed — hot or iced, with condensed milk or black.',
				img: `iced-coffee.jpg`
			},
			{ en: 'Thai Green Milk Tea', vi: 'Trà Sữa Thái Xanh', zh: '泰式奶绿' },
			{
				en: 'Salted Limeade', vi: 'Chanh Muối', zh: '盐渍青柠水',
				img: `limeade.jpg`
			},
			{
				en: 'Sugarcane Juice', vi: 'Nước Mía', zh: '甘蔗汁',
				desc: 'Pressed fresh at the drink station.',
				img: `sugarcane.jpg`
			}
		],
		extras: [
			{ en: 'Soda', zh: '汽水', vi: 'Nước Ngọt', price: '$2', detail: 'Coke · Diet Coke · Sprite · Fanta · Ginger Ale' },
			{ en: 'Bottled Water', zh: '瓶装水', vi: 'Nước Đóng Chai', price: '$2' },
			{ en: 'Sparkling Water', zh: '苏打水', vi: 'Nước Có Gas', price: '$4.50' }
		]
	}
];

/* The three cards under the statement hero. The original repeats a description
   for each; ours RESOLVES against MENU instead of duplicating it (plan §3), so
   a menu edit can never leave the homepage stale. `label` is the original's own
   card title, which is not always the menu name — "PHỞ & SPICE" for Spicy Pho. */
const NOODLES = MENU.find((s) => s.id === 'noodle').items;
export const PHO_FAVORITES = {
	caption:
		'Explore popular pho favorites at Nón Lá Express, including rib eye pho, chicken pho, spicy pho, and Vietnamese noodle soup in Flushing, Queens.',
	cards: [
		{ label: 'RIB EYE PHỞ', item: NOODLES.find((i) => i.num === 2) },
		{ label: 'CHICKEN PHỞ', item: NOODLES.find((i) => i.num === 1) },
		{ label: 'PHỞ & SPICE', item: NOODLES.find((i) => i.num === 5) }
	]
};

/* ============================== PRESS — REMOVED 2026-08-12 ==============================
   /press is retired in favour of /blog, whose posts come from the WordPress
   database at runtime rather than from this file (src/lib/wp/posts.js).

   What was here: three placeholder entries — all titled "Featured story", all
   noted "Details coming soon" — carrying only the dates harvested from the old
   Wix press page, because brief §6 #17 (outlets and links) never came back.
   They were not even wrapped in InlineEdit, so they could not be edited live
   either. That inertness is precisely what prompted the switch to a real blog.

   If dated press mentions are ever wanted back, they are ordinary blog posts
   now — write them in the dashboard, no code change. */
