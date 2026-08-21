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

/* ============================== MENU ==============================

   ⚠️ **The `price` fields below are DATA ONLY — /menu renders none of them**
   (client answer to plan §5 Q5, 2026-08-21, which is also what the original
   site did). They are kept because they were verified against UberEats and
   Snackpass in the 2026-08-21 sync and are the repo's record of what the
   kitchen charges — but nothing displays them, so **they can go stale
   silently.** Re-verify before ever putting a price back on the page. */

/* ⚠️ **`hidden: true` takes an item — or a whole section — OFF /menu without
   deleting it** (client, 2026-08-21). The data below stays complete and stays
   the repo's record of the kitchen's real menu; /menu filters on the flag at
   render time (src/routes/menu/+page.svelte), and a section whose every item is
   hidden drops out with them rather than rendering an empty heading. Un-hiding
   is deleting one line. Nothing else in the app reads MENU except PHO_FAVORITES
   below, which resolves three phở by `num` and is unaffected — but a `hidden`
   item picked up by a future homepage row WOULD reappear there, because the
   filter lives on the menu page, not in the data. */

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
				img: `menu-appetizer-spring-roll.avif`
			},
			{
				en: 'Summer Roll (2)', vi: 'Gỏi Cuốn', zh: '夏日虾卷',
				desc: 'Fresh rice-paper rolls with shrimp, vermicelli, lettuce, and herbs, served with peanut dip.',
				img: `menu-appetizer-summer-roll.avif`
			},
			{
				en: 'Lemongrass Chicken Wings (4)', vi: 'Cánh Gà Sả', zh: '香茅鸡翅',
				desc: 'Crispy fried wings in a lemongrass-garlic marinade with a tangy dip.',
				img: `menu-appetizer-lemongrass-chicken-wings.avif`
			},
			{
				// Both ordering platforms say "No proteins included" — the proteins
				// are the Extra Protein add-ons below (menu sync 2026-08-21).
				en: 'Viet Salad w. Ginger Sauce', vi: 'Gỏi', zh: '越式沙拉',
				desc: 'Shredded greens with ginger dressing. Add an extra protein to make it a meal.',
				img: `menu-appetizer-viet-salad-with-ginger-sauce.avif`
			},
			{
				hidden: true,
				en: 'Fries', vi: 'Khoai Tây Chiên', zh: '炸薯条',
				desc: 'Crisp golden fries, fresh out of the fryer.',
				price: '$6',
				img: `menu-fries.jpg`
			},
			{
				hidden: true,
				en: 'Frozen Spring Rolls (15)', vi: 'Chả Giò Đông Lạnh', zh: '冷冻春卷',
				desc: 'Our house-made spring rolls, batch-frozen to fry at home.',
				price: '$20',
				img: `menu-frozen-spring-rolls.jpg`
			},
			// The two add-ons. They were an `extras` text list until 2026-08-21;
			// with photos in hand they are ordinary items, last in the section so
			// the dishes still lead. Client photos, multiplied to --cream offline
			// because they arrived on pure white (docs/asset-map.md). Both are HIDDEN
			// since 2026-08-21 (client) — the tail placement stands for the day
			// they come back.
			{
				hidden: true,
				en: 'Extra Protein · Lemongrass Chicken', vi: 'Gà Nướng Sả', zh: '香茅鸡扒',
				desc: 'Add grilled lemongrass chicken to any dish.',
				price: '$8',
				img: `menu-extra-protein-lemongrass-chicken.avif`
			},
			{
				hidden: true,
				en: 'Extra Protein · Lemongrass Pork Chop', vi: 'Sườn Nướng Sả', zh: '香茅猪扒',
				desc: 'Add a grilled lemongrass pork chop to any dish.',
				price: '$8',
				img: `menu-extra-protein-lemongrass-pork-chop.avif`
			}
		]
	},
	{
		id: 'burgers',
		title: 'Burger',
		price: '$12',
		// "Served with french fries." removed 2026-08-21: on both ordering
		// platforms the burger is $12, fries are $6, and the Burger + Fries
		// combo is exactly $18 — fries are NOT included at $12.
		// Shot top-down in the same in-situ session as the burgers and appetizers
		// (client-supplied 2026-08-20). ⚠️ These replace the hand-coded
		// SAUCE_COLORS dots in /menu's sauce row, which crops them to CIRCLES —
		// so the renditions are square and centred on the bowl, and a re-crop
		// that moves the bowl off centre will show as a lopsided dot.
		sauces: [
			{ en: 'Ketchup', zh: '番茄酱', vi: 'Tương Cà', img: `menu-sauce-ketchup.avif` },
			{ en: 'Mayonnaise', zh: '美乃滋', vi: 'Mayo', img: `menu-sauce-mayonnaise.avif` },
			{ en: 'Spicy Mayo', zh: '辣美乃滋', vi: 'Mayo Cay', img: `menu-sauce-spicy-mayo.avif` },
			{ en: 'Cilantro Cream', zh: '香菜奶油酱', vi: 'Sốt Kem Ngò', img: `menu-sauce-cilantro-cream.avif` }
		],
		// Client-supplied 2026-08-20 — the answer to plan §5 Q6's "if it stays, it
		// wants photos". ⚠️ These are in-situ plates on the stall's wood table
		// against the red banquette, NOT cut-outs on the #F1EAD7 studio backdrop.
		// The four appetizers and the four sauces above were reshot the same way
		// on 2026-08-20, so /menu now runs in-situ rectangles for Appetizer +
		// Burger and floating cut-outs for Noodle, Main and Drinks. Masters in
		// docs/assets/image-source/ (gitignored).
		items: [
			{
				en: 'Smoked Paprika Chicken Burger', vi: 'Burger Gà Paprika', zh: '烟熏红椒鸡肉堡',
				img: `menu-burger-smoked-paprika-chicken-burger.avif`
			},
			{
				en: 'Lemongrass Pork Tenderloin Burger', vi: 'Burger Heo Sả', zh: '香茅猪肉汉堡',
				img: `menu-burger-lemongrass-pork-tenderloin-burger.avif`
			}
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
				img: `menu-noodle-fresh-phoenix-chicken-pho.avif`
			},
			{
				num: 2, en: 'Rare Eye Round Beef Pho', vi: 'Phở Tái', zh: '生牛眼肉河粉',
				desc: 'Paper-thin rare eye round, gently cooked by rich, slow-simmered beef broth.',
				img: `menu-noodle-rare-eye-round-beef-pho.avif`
			},
			{
				num: 3, en: 'Phở Special', vi: 'Phở Đặc Biệt', zh: '火车头',
				desc: 'Rare sliced beef, well-done brisket, beef flank, tendon, tripe, and beef meatballs.',
				img: `menu-noodle-pho-special.avif`
			},
			{
				num: 4, en: 'Pho & Grilled', vi: 'Phở & Nướng', zh: '烤肉河粉',
				desc: 'Phở topped straight off the grill.', choice: 'Choice: pork / chicken / ribeye',
				img: `menu-noodle-pho-and-grilled.avif`
			},
			{
				num: 5, en: 'Spicy Pho', vi: 'Phở Cay', zh: '辣河粉', spicy: true,
				desc: 'A chili-forward broth that brings the heat.', choice: 'Choice: chicken / eye round',
				img: `menu-noodle-spicy-pho.avif`
			},
			{
				// Unnumbered on the live menus — the kitchen's 1–5 numbering stops
				// at the phở, so no `num` here (menu sync 2026-08-21).
				hidden: true,
				en: 'Bún Bò Huế', zh: '传统顺化牛肉猪脚粉', spicy: true,
				desc: 'Huế-style spicy beef noodle soup — thick round noodles in a lemongrass-chili broth.',
				img: `menu-bun-bo-hue.jpg`
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
				img: `menu-main-shaking-beef-rice.avif`
			},
			{
				num: 7, en: 'Smoked Paprika Chicken Rice', vi: 'Cơm Gà Paprika', zh: '烟熏红椒鸡饭',
				desc: 'Grilled chicken glazed with smoked paprika.',
				img: `menu-main-smoked-paprika-chicken-rice.avif`
			},
			{
				num: 8, en: 'Pork Chop Rice', vi: 'Cơm Sườn Nướng', zh: '猪扒饭',
				desc: 'Grilled lemongrass-marinated pork chop.',
				img: `menu-main-pork-chop-rice.avif`
			},
			{
				// $19 on both live menus while the section runs $17 — the one
				// exception, so it carries its own price label.
				num: 9, en: 'Lemongrass Beef Rice', vi: 'Bò Nướng Sả', zh: '香茅肋眼牛排饭',
				desc: 'Grilled ribeye in a fragrant lemongrass marinade.',
				price: '$19',
				img: `menu-main-lemongrass-beef-rice.avif`
			},
			{
				num: 10, en: 'Rice Vermicelli Bowl', vi: 'Bún Thịt Nướng', zh: '越式檬粉',
				desc: 'Cool rice vermicelli with fresh herbs and pickles.',
				choice: 'Choice: spring rolls / pork / chicken / ribeye',
				img: `menu-main-rice-vermicelli-bowl.avif`
			},
			{
				// Unnumbered on the live menus, like Bún Bò Huế (menu sync 2026-08-21).
				hidden: true,
				en: 'Lemongrass Chicken Rice', vi: 'Cơm Gà Nướng Sả', zh: '香茅鸡饭',
				desc: 'Grilled chicken in a fragrant lemongrass marinade.',
				img: `menu-lemongrass-chicken-rice.jpg`
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
				img: `menu-vietnamese-iced-coffee.jpg`
			},
			{ en: 'Thai Green Milk Tea', vi: 'Trà Sữa Thái Xanh', zh: '泰式奶绿', img: `menu-thai-green-milk-tea.jpg` },
			{
				en: 'Salted Limeade', vi: 'Chanh Muối', zh: '盐渍青柠水',
				img: `menu-salted-limeade.jpg`
			},
			{
				en: 'Sugarcane Juice', vi: 'Nước Mía', zh: '甘蔗汁',
				desc: 'Pressed fresh at the drink station.',
				img: `menu-sugarcane-juice.jpg`
			},
			// The bottled/canned drinks. An `extras` text list until 2026-08-21;
			// now ordinary items, last so the signature drinks still lead.
			// ⚠️ Client photos, and they are PRODUCT shots at ~220px — an order of
			// magnitude smaller than the dish photography. They were upscaled 2×
			// (lanczos + unsharp) so the browser downscales rather than upscales
			// them, but the detail ceiling is still the 220px original: these are
			// the softest images on the site. **Ask for larger files.**
			{
				en: 'Soda', vi: 'Nước Ngọt', zh: '汽水',
				choice: 'Choice: Coke / Diet Coke / Sprite / Fanta / Ginger Ale',
				price: '$2.25',
				img: `menu-soda.avif`
			},
			{
				en: 'Bottled Water', vi: 'Nước Đóng Chai', zh: '瓶装水',
				price: '$2',
				img: `menu-bottled-water.avif`
			},
			{
				en: 'Sparkling Water', vi: 'Nước Có Gas', zh: '苏打水',
				price: '$4.50',
				img: `menu-sparkling-water.avif`
			}
		]
	},
	/* The two sections below were added in the 2026-08-21 menu sync (UberEats +
	   Snackpass are the sources; Snackpass carries the store's own prices, so
	   its numbers win). Platform-exclusive combos (the Fantuan-only one
	   especially) are deliberately NOT here — client call.
	   ⚠️ Their photos are PLATFORM pulls, not client deliveries — several are
	   crops out of the client's own poster art (docs/asset-map.md lists each
	   source), so treat them as placeholders the client may re-shoot. The Phở
	   Special Combo has no photo on either platform. */
	{
		id: 'combos',
		title: 'All Day Combo',
		// Hidden whole (client, 2026-08-21) — all four combos with it.
		hidden: true,
		items: [
			{
				en: 'Combo for 1', zh: '单人套餐',
				desc: 'Any appetizer (half portion), any noodle or main, and any drink.',
				price: '$25',
				img: `menu-combo-for-1.jpg`
			},
			{
				en: 'All Day Combo for 2', zh: '特惠双人套餐',
				desc: 'A full-size appetizer, two noodles or mains, and two drinks — the no-tax, no-tips deal.',
				price: '$48.90',
				img: `menu-all-day-combo-for-2.jpg`
			},
			{
				en: 'Vietnamese Burger + Fries Combo', zh: '越南汉堡套餐',
				desc: 'Either burger with a side of fries.',
				price: '$18',
				img: `menu-vietnamese-burger-fries-combo.jpg`
			},
			{
				// ⚠️ Deliberately REUSES the Combo for 2 photo (client direction
				// 2026-08-21) — neither platform has a shot of this combo. So the
				// same image appears twice in this section; swap it the moment a
				// real one exists rather than treating the repeat as intended.
				en: 'Phở Special Combo', zh: '火车头套餐',
				desc: 'Built around our #3 Phở Special.',
				price: '$26',
				img: `menu-all-day-combo-for-2.jpg`
			}
		]
	},
	{
		id: 'retail',
		title: 'Retail & Gifts',
		items: [
			{
				en: 'NonLa Tote Bag',
				desc: 'The stall’s canvas tote — as seen on the bar shelf.',
				price: '$25',
				img: `menu-nonla-tote-bag.jpg`
			},
			{
				en: 'Cafe Du Monde Coffee (15 oz)', zh: '罐装越南咖啡',
				desc: 'The classic chicory-blend tin for Vietnamese-style coffee at home.',
				price: '$15',
				img: `menu-cafe-du-monde-coffee.jpg`
			},
			{
				hidden: true,
				en: 'Digital Gift Card', zh: '电子礼品卡',
				desc: 'Any amount, delivered digitally — purchase through Snackpass.',
				img: `menu-digital-gift-card.png`
			}
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
