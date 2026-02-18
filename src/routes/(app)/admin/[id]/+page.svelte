<script lang="ts">
  import { page } from "$app/stores";
  import AdminDetail from "$lib/views/admin/admin-detail.svelte";

  let id = $derived($page.params.id);
</script>

<AdminDetail {id} />
