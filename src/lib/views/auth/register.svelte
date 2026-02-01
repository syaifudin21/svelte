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

    async function handleRegister(e: SubmitEvent) {
        e.preventDefault();
        authStore.setLoading(true);
        authStore.setError(null);

        try {
            const response = await authService.register({ username, password });
            
            const userData = response.data?.user || response.data || response.user;
            if (userData) {
                authStore.setUser(userData);
            }
            
            toast.success(response.message || "Registration successful!");
            goto("/login");
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
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
					&ldquo;Join thousands of developers using our platform to build amazing things.&rdquo;
				</p>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p class="text-sm text-muted-foreground">Enter your details below to create your account</p>
			</div>
			<div class={cn("grid gap-6")}>
				<form onsubmit={handleRegister}>
					<div class="grid gap-2">
                        <div class="grid gap-1">
							<Label class="sr-only" for="name">Username</Label>
							<Input
								id="name"
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
                                Registering...
                            {:else}
                                Create Account
                            {/if}
                        </Button>
					</div>
				</form>
                <div class="text-center text-sm text-muted-foreground">
                    Already have an account? <a href="/login" class="text-primary hover:underline">Login</a>
                </div>
			</div>
		</div>
	</div>
</div>

<div class="flex flex-col md:hidden min-h-screen items-center justify-center p-4">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div class="flex flex-col space-y-2 text-center">
            <h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p class="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>
        <div class="grid gap-6">
            <form onsubmit={handleRegister}>
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
                            Registering...
                        {:else}
                            Sign Up with Email
                        {/if}
                    </Button>
                </div>
            </form>
            {#if authStore.error}
                <p class="text-sm font-medium text-destructive">{authStore.error}</p>
            {/if}
            <div class="text-center text-sm text-muted-foreground">
                Already have an account? <a href="/login" class="text-primary hover:underline">Login</a>
            </div>
        </div>
    </div>
</div>
