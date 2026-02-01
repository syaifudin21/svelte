<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { cn } from "$lib/utils";
    import { authService } from "$lib/services/auth.service";
    import { authStore } from "$lib/stores/auth.svelte";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";

    let username = $state("");
    let password = $state("");

    async function handleLogin(e: SubmitEvent) {
        e.preventDefault();
        authStore.setLoading(true);
        authStore.setError(null);

        try {
            const response = await authService.login({ username, password });
            
            // Extract according to provided structure: response.data.token and response.data.user
            const token = response.data?.token;
            const userData = response.data?.user;
            
            if (!token || !userData) {
                authStore.setError("Respon server tidak valid.");
                return;
            }

            // Check for admin role
            const roles = userData.roles || [];
            if (!roles.includes("admin")) {
                authStore.setError("Akses ditolak. Anda bukan Administrator.");
                toast.error("Anda tidak memiliki izin untuk mengakses Dashboard Admin.");
                return;
            }
            
            // Set session
            authStore.setUser(userData);
            authStore.setToken(token);
            
            toast.success(response.message || "Login berhasil!");
            goto("/dashboard");
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
            authStore.setError(errorMsg);
        } finally {
            authStore.setLoading(false);
        }
    }
</script>

<div class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
	<div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
		<div class="absolute inset-0 bg-zinc-900"></div>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mr-2 h-6 w-6"
			>
				<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
			</svg>
			Acme Inc
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					&ldquo;This library has saved me countless hours of work and helped me deliver stunning
					designs to my clients faster than ever before.&rdquo;
				</p>
				<footer class="text-sm">Sofia Davis</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Login to your account</h1>
				<p class="text-sm text-muted-foreground">Enter your credentials below to login</p>
			</div>
			<div class={cn("grid gap-6")}>
				<form onsubmit={handleLogin}>
					<div class="grid gap-2">
						<div class="grid gap-1">
							<Label class="sr-only" for="username">Username</Label>
							<Input
								id="username"
								placeholder="Username"
								type="text"
                                bind:value={username}
                                required
                                disabled={authStore.isLoading}
							/>
						</div>
                        <div class="grid gap-1">
							<Label class="sr-only" for="password">Password</Label>
							<Input
								id="password"
								placeholder="Password"
								type="password"
                                bind:value={password}
                                required
                                disabled={authStore.isLoading}
							/>
						</div>
                        {#if authStore.error}
                            <p class="text-sm font-medium text-destructive">{authStore.error}</p>
                        {/if}
						<Button type="submit" disabled={authStore.isLoading}>
                            {#if authStore.isLoading}
                                Logging in...
                            {:else}
                                Sign In
                            {/if}
                        </Button>
					</div>
				</form>
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
					</div>
				</div>
				<Button variant="outline" type="button" disabled={authStore.isLoading}>
                    <svg role="img" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
                        <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
					Github
				</Button>
			</div>
			<p class="px-8 text-center text-sm text-muted-foreground">
				By clicking continue, you agree to our{" "}
				<a href="/terms" class="underline underline-offset-4 hover:text-primary">
					Terms of Service
				</a>{" "}
				and{" "}
				<a href="/privacy" class="underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</a>
				.
			</p>
		</div>
	</div>
</div>

<div class="flex flex-col md:hidden min-h-screen items-center justify-center p-4">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">Login</h1>
            <p class="text-sm text-muted-foreground">Enter your credentials to login</p>
        </div>
        <div class="grid gap-6">
            <form onsubmit={handleLogin}>
                <div class="grid gap-2">
                    <div class="grid gap-1">
                        <Label class="sr-only" for="username-mobile">Username</Label>
                        <Input
                            id="username-mobile"
                            placeholder="Username"
                            type="text"
                            bind:value={username}
                            required
                        />
                    </div>
                    <div class="grid gap-1">
                        <Label class="sr-only" for="password-mobile">Password</Label>
                        <Input
                            id="password-mobile"
                            placeholder="Password"
                            type="password"
                            bind:value={password}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={authStore.isLoading}>
                        {#if authStore.isLoading}
                            Logging in...
                        {:else}
                            Sign In
                        {/if}
                    </Button>
                </div>
            </form>
            {#if authStore.error}
                <p class="text-sm font-medium text-destructive">{authStore.error}</p>
            {/if}
            <Button variant="outline" type="button">Github</Button>
        </div>
    </div>
</div>
