<script lang="ts">
	import DriverDetailContent from "$lib/views/driver/driver-show.svelte";
	import { page } from "$app/state";

	const id = page.params.id;
</script>

<DriverDetailContent {id} />
