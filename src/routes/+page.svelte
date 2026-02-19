<script lang="ts">
	import { onMount } from "svelte";

	onMount(() => {
		// Set dark mode by default for this landing page
		document.documentElement.classList.add("dark");
	});
</script>

<svelte:head>
	<title>OmniGo - Move Anything Anywhere</title>
	<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
</svelte:head>

<div class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-omni-primary/30">
	<!-- Sticky Header -->
	<header class="fixed top-0 left-0 right-0 z-50 glass-header">
		<div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
			<div class="flex items-center gap-2 group cursor-pointer">
				<div class="size-10 bg-omni-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-omni-primary/20">
					<span class="material-symbols-outlined font-bold">rocket_launch</span>
				</div>
				<span class="text-2xl font-black tracking-tighter text-white">Omni<span class="text-omni-primary">Go</span></span>
			</div>
			<nav class="hidden md:flex items-center gap-10">
				<a class="text-sm font-semibold hover:text-omni-primary transition-colors uppercase tracking-widest text-white/90" href="#services">Services</a>
				<a class="text-sm font-semibold hover:text-omni-primary transition-colors uppercase tracking-widest text-white/90" href="#">Company</a>
				<a class="text-sm font-semibold hover:text-omni-primary transition-colors uppercase tracking-widest text-white/90" href="#">Safety</a>
				<a class="text-sm font-semibold hover:text-omni-primary transition-colors uppercase tracking-widest text-white/90" href="#">Help</a>
			</nav>
			<div class="flex items-center gap-4">
				<button class="px-6 py-2.5 bg-omni-primary hover:bg-omni-primary/90 text-white font-bold rounded-lg transition-all shadow-lg shadow-omni-primary/25 active:scale-95">
					Get Started
				</button>
			</div>
		</div>
	</header>

	<main class="service-snap-container">
		<!-- Hero Section -->
		<section class="service-slide flex flex-col items-center justify-center bg-background-dark overflow-hidden">
			<div class="absolute inset-0 opacity-20 pointer-events-none">
				<div class="absolute top-1/4 -left-20 w-96 h-96 bg-omni-primary rounded-full blur-[120px]"></div>
				<div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-omni-primary/40 rounded-full blur-[120px]"></div>
			</div>
			<div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
				<div class="space-y-8">
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-omni-primary/10 border border-omni-primary/20 text-omni-primary text-xs font-bold uppercase tracking-widest">
						<span class="material-symbols-outlined text-sm">auto_awesome</span>
						The Future of Mobility
					</div>
					<h1 class="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] dark:text-white">
						Move <span class="text-omni-primary">Anything</span> <br/>
						<span class="text-gradient">Anywhere</span>
					</h1>
					<p class="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
						Experience the most premium all-in-one platform for urban logistics, transport, and daily essentials. Designed for the modern world.
					</p>
					<div class="flex flex-wrap gap-4 pt-4">
						<button class="px-8 py-4 bg-omni-primary text-white font-bold rounded-xl flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-omni-primary/20">
							Download App
							<span class="material-symbols-outlined">download_for_offline</span>
						</button>
						<button class="px-8 py-4 bg-surface-dark border border-border-dark text-white font-bold rounded-xl hover:bg-border-dark transition-colors">
							Partner With Us
						</button>
					</div>
				</div>
				<div class="relative hidden lg:block">
					<div class="relative z-10 p-8">
						<img alt="Premium smartphone showing OmniGo app interface" class="w-full h-auto rounded-[3rem] shadow-2xl border-8 border-surface-dark rotate-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbiFZutxuOevoghIxi2R1QFWtANYtGflUUqntaJhtTm0_FZFe1R5jEznz4kS1DPB7GxGqdVcymn7NzU7sxuoGS-oU29o_-Ds3B50O_ZzbT4RGJbe4FU4aXf4GOsM_Y66_TCs6ooKcBAiweVV3tQ6-aGbXUXaO5O-GS1Pbd-BHMxbg2GCtnNs9pSlIbVJlrvpuf0IK3F4ztiEUpia6YC-phR-2cWIqBj1Ghue83tngZJ_BFIddCt8HQ0RYfs_KdVFyDtlD9M3i3L9PL"/>
					</div>
					<div class="absolute -bottom-10 -left-10 z-20 bg-omni-primary p-6 rounded-2xl shadow-xl flex items-center gap-4 -rotate-6">
						<span class="material-symbols-outlined text-4xl text-white">electric_car</span>
						<div>
							<p class="text-white font-bold text-lg">Fast Booking</p>
							<p class="text-white/80 text-sm">Available in 200+ Cities</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Service: Ride -->
		<section class="service-slide relative group overflow-hidden" id="services">
			<div class="absolute inset-0">
				<img alt="Premium Ride Service" class="w-full h-full object-cover scale-105 transition-transform duration-1000 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYnMhwTN2QzhPRIRMBOYkrwj1z6K0CqjVDDxaVqjX4U4MhcUadYuouwMbWK7WQRjqhqJDQk6q7BvVAb-9xGcyqkWCi2tpcgzJ8Pjq_RLRyTtxay5QyDnIy836RoJvWbDnfM2d5_S8DvcY5MkM54lZqQXjGulHmboj8HZRyWPlsQXeRWX68HTwupja8HL3druv-poK32FuqEJk4AAbyNceAmODhOOJ6VRpYwE3XSm6MtwkhS6DjQMaeKkHBtfRJySHiu-J7DmDU9xOX"/>
				<div class="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
			</div>
			<div class="relative h-full max-w-7xl mx-auto px-6 flex items-center">
				<div class="max-w-xl space-y-6">
					<span class="text-omni-primary font-bold tracking-widest uppercase text-sm">01 / Services</span>
					<h2 class="text-5xl md:text-7xl font-black text-white leading-tight">Comfortable <br/> Rides</h2>
					<p class="text-xl text-slate-300 leading-relaxed">
						Safe and convenient daily commutes at your fingertips. Our highly-rated drivers ensure you reach your destination in comfort and style, every single time.
					</p>
					<div class="grid grid-cols-2 gap-6 pt-6">
						<div class="space-y-2">
							<span class="material-symbols-outlined text-omni-primary text-3xl">verified_user</span>
							<h4 class="font-bold text-white">Verified Drivers</h4>
							<p class="text-sm text-slate-400">Multi-step safety background checks for all partners.</p>
						</div>
						<div class="space-y-2">
							<span class="material-symbols-outlined text-omni-primary text-3xl">schedule</span>
							<h4 class="font-bold text-white">Instant Pickup</h4>
							<p class="text-sm text-slate-400">Average wait time under 3 minutes in city centers.</p>
						</div>
					</div>
					<button class="mt-8 px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-omni-primary hover:text-white transition-all">Book Now</button>
				</div>
			</div>
		</section>

		<!-- Service: Taxi -->
		<section class="service-slide relative group overflow-hidden">
			<div class="absolute inset-0">
				<img alt="Professional Taxi Fleet" class="w-full h-full object-cover scale-105 transition-transform duration-1000 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClOEIJcpt44DmPj5EvBej9yATAXZNPiuJlAE4E7tlLoU_JfFEMGx5H-n6M-Nh3rQvrGWt69Butv2lUvzI29JY5-aSOUzGQjHyDvAcK4r79BLB5x7pAXSFi9xE29t13NgUDC7H75TKYtvHTfG2DhnB7U7fAMUrCDtHHq01AiNhuab4qpEWXV1EJDAb9o481FgLnGP4WGC99F_VoT6U4NEgwZqZWvLI7mY_yvRYPA-5YqCHYiJf_cJngqWYtZRpazyaJDMXkExGKqEDb"/>
				<div class="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-transparent"></div>
			</div>
			<div class="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-end">
				<div class="max-w-xl space-y-6 text-right">
					<span class="text-omni-primary font-bold tracking-widest uppercase text-sm">02 / Services</span>
					<h2 class="text-5xl md:text-7xl font-black text-white leading-tight">Executive <br/> Taxi Fleet</h2>
					<p class="text-xl text-slate-300 leading-relaxed">
						Professional high-end fleet for your executive travel needs. From airport transfers to corporate meetings, travel in the prestige you deserve.
					</p>
					<div class="flex justify-end gap-12 pt-6">
						<div class="space-y-2">
							<span class="material-symbols-outlined text-omni-primary text-3xl">stars</span>
							<h4 class="font-bold text-white">Premium Only</h4>
						</div>
						<div class="space-y-2">
							<span class="material-symbols-outlined text-omni-primary text-3xl">business_center</span>
							<h4 class="font-bold text-white">Corporate Ready</h4>
						</div>
					</div>
					<button class="mt-8 px-10 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all">Request Executive</button>
				</div>
			</div>
		</section>

		<!-- Service: Fast Cargo -->
		<section class="service-slide relative group overflow-hidden">
			<div class="absolute inset-0">
				<img alt="Fast Cargo Logistics" class="w-full h-full object-cover scale-105 transition-transform duration-1000 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkJC8hZK10dDyraV89nKHeklvvX6GHgJtP4lRz63_F2vhKedV6sQhFF-LJFD4jIpEEVMR6a4xABJuephxfy-6UrIwfB5yCS2TmwISviGcZ0U7VxFHLfmcYrYjHVtZZJTquv5WQyBf4v09q4J5giVKB6mdzlQT6D80Ttm9zJtJcocPd78a_63jtV7Hx5wRzM8kpCaTm5Pr5Qf0U8t286l8pvqD2dj1dGIoiucdjlzQ_I67cqin6T6hnuvh-9_PUz_JExYp44zry3MT5"/>
				<div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
			</div>
			<div class="relative h-full max-w-7xl mx-auto px-6 flex items-center">
				<div class="max-w-xl space-y-6">
					<span class="text-omni-primary font-bold tracking-widest uppercase text-sm">03 / Services</span>
					<h2 class="text-5xl md:text-7xl font-black text-white leading-tight">Logistics <br/> Reimagined</h2>
					<p class="text-xl text-slate-300 leading-relaxed">
						Reliable logistics and lightning-fast delivery for your business. From documents to heavy machinery, we move your cargo with care and speed.
					</p>
					<div class="space-y-4 pt-4">
						<div class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
							<span class="material-symbols-outlined text-omni-primary">local_shipping</span>
							<div>
								<h4 class="font-bold text-white">Real-time Tracking</h4>
								<p class="text-sm text-slate-400">Monitor your shipment every meter of the way.</p>
							</div>
						</div>
						<div class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
							<span class="material-symbols-outlined text-omni-primary">speed</span>
							<div>
								<h4 class="font-bold text-white">Express Delivery</h4>
								<p class="text-sm text-slate-400">Same-day delivery for urgent regional shipments.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Service: Mart & Food -->
		<section class="service-slide relative group overflow-hidden">
			<div class="absolute inset-0">
				<img alt="Mart and Food Delivery" class="w-full h-full object-cover scale-105 transition-transform duration-1000 group-hover:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMeKKGSqEyXO2maH4bEG0zN8ygzCUuneIPUbGzdZdsnLacIwDlLxqnh8Y7oN1yPVDDQRUm38HtQlwfHSaiRnRv1GBNMZSWt1OSA1_MUGG2brubjcqV2uwqgyCfQysqjLLWOQYOVTtt1jdT9O9kljlrpLjBlu6h2hRktSCkH6YrPs_YTIJk5M7dT8Hae9KoTtgNtXQ8KRWirM5c-eTOhYd05E1OqnqA6w7GnICM_NbcTu819Is7QkS4Pcz3wd2DDTlYUX9pJLqwCLjr"/>
				<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
			</div>
			<div class="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-24">
				<div class="max-w-3xl space-y-6">
					<span class="text-omni-primary font-bold tracking-widest uppercase text-sm">04 / Services</span>
					<h2 class="text-5xl md:text-7xl font-black text-white leading-tight">Freshness <br/> Delivered</h2>
					<div class="grid md:grid-cols-2 gap-12">
						<div class="space-y-4">
							<h3 class="text-2xl font-bold text-white flex items-center gap-2">
								<span class="material-symbols-outlined text-omni-primary">shopping_basket</span> Mart
							</h3>
							<p class="text-slate-300">Instant delivery of fresh groceries and daily essentials from your favorite local markets.</p>
						</div>
						<div class="space-y-4">
							<h3 class="text-2xl font-bold text-white flex items-center gap-2">
								<span class="material-symbols-outlined text-omni-primary">restaurant</span> Food
							</h3>
							<p class="text-slate-300">Your favorite meals delivered hot to your doorstep. From local gems to global favorites.</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer Section -->
		<section class="service-slide bg-background-dark flex flex-col pt-20">
			<div class="flex-grow max-w-7xl mx-auto px-6 w-full">
				<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 pb-20 border-b border-border-dark">
					<div class="col-span-2 lg:col-span-2 space-y-6">
						<div class="flex items-center gap-2">
							<div class="size-8 bg-omni-primary rounded-lg flex items-center justify-center text-white">
								<span class="material-symbols-outlined text-sm font-bold">rocket_launch</span>
							</div>
							<span class="text-xl font-black tracking-tighter text-white">OmniGo</span>
						</div>
						<p class="text-slate-500 max-w-sm">
							Redefining urban mobility through innovation, safety, and a commitment to seamless logistics for everyone, everywhere.
						</p>
						<div class="flex gap-4">
							<a class="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-omni-primary hover:bg-omni-primary/10 transition-all" href="#">
								<span class="material-symbols-outlined">public</span>
							</a>
							<a class="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-omni-primary hover:bg-omni-primary/10 transition-all" href="#">
								<span class="material-symbols-outlined">mail</span>
							</a>
							<a class="size-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-400 hover:text-omni-primary hover:bg-omni-primary/10 transition-all" href="#">
								<span class="material-symbols-outlined">group</span>
							</a>
						</div>
					</div>
					<div>
						<h4 class="text-white font-bold mb-6">Platform</h4>
						<ul class="space-y-4 text-slate-500 text-sm">
							<li><a class="hover:text-omni-primary transition-colors" href="#">How it works</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Pricing</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Cities</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Business</a></li>
						</ul>
					</div>
					<div>
						<h4 class="text-white font-bold mb-6">Company</h4>
						<ul class="space-y-4 text-slate-500 text-sm">
							<li><a class="hover:text-omni-primary transition-colors" href="#">About Us</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Careers</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Safety</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Newsroom</a></li>
						</ul>
					</div>
					<div>
						<h4 class="text-white font-bold mb-6">Support</h4>
						<ul class="space-y-4 text-slate-500 text-sm">
							<li><a class="hover:text-omni-primary transition-colors" href="#">Help Center</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Contact</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Privacy</a></li>
							<li><a class="hover:text-omni-primary transition-colors" href="#">Terms</a></li>
						</ul>
					</div>
				</div>
				<div class="py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-xs font-medium uppercase tracking-widest">
					<p>© 2024 OmniGo Technologies Inc. All rights reserved.</p>
					<div class="flex gap-8">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-sm">location_on</span>
							Global HQ, San Francisco
						</div>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-sm">language</span>
							English (US)
						</div>
					</div>
				</div>
			</div>
			<div class="bg-omni-primary py-4 text-center">
				<p class="text-white font-bold tracking-widest text-xs uppercase">Join the revolution of movement</p>
			</div>
		</section>
	</main>

	<!-- Side Navigation / Scroll Progress -->
	<div class="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
		<a class="size-2 rounded-full bg-omni-primary ring-4 ring-omni-primary/20" href="#services"></a>
		<div class="size-2 rounded-full bg-slate-700"></div>
		<div class="size-2 rounded-full bg-slate-700"></div>
		<div class="size-2 rounded-full bg-slate-700"></div>
		<div class="size-2 rounded-full bg-slate-700"></div>
	</div>
</div>

<style>
	:global(body) {
		font-family: 'Public Sans', sans-serif;
	}
	:global(.service-snap-container) {
		scroll-snap-type: y mandatory;
		overflow-y: scroll;
		height: 100vh;
	}
	:global(.service-slide) {
		scroll-snap-align: start;
		height: 100vh;
		width: 100%;
		position: relative;
	}
	:global(.glass-header) {
		background: rgba(10, 10, 10, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(236, 91, 19, 0.1);
	}
	:global(.text-gradient) {
		background: linear-gradient(to right, #ec5b13, #ff8c42);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
